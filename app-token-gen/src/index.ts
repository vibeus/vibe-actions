import { getInput, info, error, setFailed, setOutput } from "@actions/core";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export async function run() {
  const privateKey = getInput("app_private_key", { required: true });
  const appId = getInput("app_id", { required: true });

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey },
  });

  let installId = parseInt(getInput("app_install_id", { required: false }));
  if (!installId) {
    try {
      const resp = await octokit.apps.listInstallations();
      if (resp.data.length > 1) {
        installId = resp.data[0].id;
      }
    } catch (err) {
      error("Failed to list installations.");
      setFailed(err);
      return;
    }
  }

  if (!installId) {
    setFailed("Unable to get app's install id.");
    return;
  }

  info(`Using app install id: ${installId}`);

  try {
    const resp = await octokit.apps.createInstallationAccessToken({ installation_id: installId });
    setOutput("access_token", resp.data.token);
  } catch (err) {
    error("Failed to create access token.");
    setFailed(err);
    return;
  }
}

run();
