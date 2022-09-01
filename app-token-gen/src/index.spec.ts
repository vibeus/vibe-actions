import "mocha";
import { run } from ".";

const APP_ID = "233888";

// insert key before running test.
const APP_PRIVATE_KEY = `
-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----
`;

describe("app-token-gen", () => {
  it("should get token", () => {
    process.env["INPUT_APP_ID"] = APP_ID;
    process.env["INPUT_APP_PRIVATE_KEY"] = APP_PRIVATE_KEY;

    run();
  });
});
