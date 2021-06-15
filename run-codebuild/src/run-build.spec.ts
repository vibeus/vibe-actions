import "mocha";
import { expect } from "chai";

import { getCodeBuildParams } from "./run-build";

describe("getCodeBuildParams", () => {
  it("should return single param", () => {
    process.env["INPUT_PROJECTS"] = "project-name";
    process.env["INPUT_REF"] = "12345";

    const params = getCodeBuildParams();
    expect(params).to.eql([
      {
        projectName: "project-name",
        sourceVersion: "12345",
      },
    ]);
  });

  it("should return multiple params", () => {
    process.env["INPUT_PROJECTS"] = "project1, project2";
    process.env["INPUT_REF"] = "asdf";

    const params = getCodeBuildParams();
    expect(params).to.eql([
      {
        projectName: "project1",
        sourceVersion: "asdf",
      },
      {
        projectName: "project2",
        sourceVersion: "asdf",
      },
    ]);
  });
});
