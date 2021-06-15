import { getInput, setFailed } from "@actions/core";
import { CodeBuild, CloudWatchLogs } from "aws-sdk";

const RATE_LIMIT_EXCEED_WAIT = 10000;
const LOOP_WAIT = 5000;

function getCodeBuildParams(): CodeBuild.Types.StartBuildInput[] {
  const ref = getInput("ref", { required: true });
  return getInput("projects", { required: true })
    .split(",")
    .map((x) => ({
      projectName: x.trim(),
      sourceVersion: ref,
    }));
}

function getCloudWatchParams(build: CodeBuild.Types.Build): CloudWatchLogs.Types.GetLogEventsRequest | null {
  const { logs } = build;
  if (!logs) {
    return null;
  }

  const { groupName, streamName } = logs;
  if (!groupName || !streamName) {
    return null;
  }

  return {
    logGroupName: groupName,
    logStreamName: streamName,
    startFromHead: true,
  };
}

async function runWatchBuilds(): Promise<CodeBuild.Types.Build[]> {
  const codeBuild = new CodeBuild();
  const cloudWatchLogs = new CloudWatchLogs();

  if (!codeBuild.config.credentials || !cloudWatchLogs.config.credentials) {
    setFailed("Missing AWS Credentials. Please add @aws-actions/configure-aws-credentials earlier in your job.");
    return;
  }

  const params = getCodeBuildParams();
  const startedBuilds = await Promise.all(params.map((x) => codeBuild.startBuild(x).promise()));
  let builds = startedBuilds.map((x) => x.build);
  let logs = await Promise.all(
    builds.map((x) => {
      const params = getCloudWatchParams(x);
      return params && cloudWatchLogs.getLogEvents(params).promise();
    })
  );

  while (
    builds.some((x) => x.buildStatus === "IN_PROGRESS") ||
    logs.some((x) => x && x.events && x.events.length > 0)
  ) {
    try {
      const ids = builds.map((x) => x.id);
      const batchBuilds = await codeBuild.batchGetBuilds({ ids }).promise();
      builds = batchBuilds.builds;
      logs = await Promise.all(
        builds.map((x, i) => {
          const params = getCloudWatchParams(x);
          const previous = logs[i];
          if (params && previous) {
            params.nextToken = previous.nextForwardToken;
          }

          return params && cloudWatchLogs.getLogEvents(params).promise();
        })
      );

      logs.forEach((x, i) => {
        if (!x || !x.events) {
          return;
        }

        const name = builds[i].projectName;
        x.events.forEach(({ message }) => {
          console.log(`[${name}] ${message.trimEnd()}`);
        });
      });

      await new Promise((resolve) => setTimeout(resolve, LOOP_WAIT));
    } catch (err) {
      if (err.message && err.message.indexOf("Rate exceeded") >= 0) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_EXCEED_WAIT));
      } else {
        throw err;
      }
    }
  }

  return builds;
}

export { getCodeBuildParams, runWatchBuilds };
