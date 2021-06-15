import { info, setFailed } from "@actions/core";
import { runWatchBuilds } from "./run-build";

async function run() {
  try {
    info("CodeBuild Started.");
    const builds = await runWatchBuilds();
    info("CodeBuild Completed.");

    builds.forEach((x) => {
      info(`[${x.projectName}]: ${x.buildStatus}`);
    });

    if (builds.some((x) => x.buildStatus !== "SUCCEEDED")) {
      setFailed("Some projects failed.");
    }
  } catch (err) {
    setFailed(err.toString());
  }
}

run();
