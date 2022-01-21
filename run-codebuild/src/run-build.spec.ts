import "mocha";
import { expect } from "chai";

import { getCodeBuildParams } from "./run-build";

describe("getCodeBuildParams", () => {
  beforeEach(() => {
    process.env["INPUT_PROJECTS"] = "";
    process.env["INPUT_REF"] = "";
    process.env["INPUT_IMAGE_OVERRIDES"] = "";
  });

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

  it("should override image for single project", () => {
    process.env["INPUT_PROJECTS"] = "project-name";
    process.env["INPUT_REF"] = "12345";
    process.env["INPUT_IMAGE_OVERRIDES"] = "xyz";

    const params = getCodeBuildParams();
    expect(params).to.eql([
      {
        projectName: "project-name",
        sourceVersion: "12345",
        imageOverride: "xyz",
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

  it("should override image for multiple projects", () => {
    process.env["INPUT_PROJECTS"] = "project1, project2";
    process.env["INPUT_REF"] = "asdf";
    process.env["INPUT_IMAGE_OVERRIDES"] = "xyz, abc";

    const params = getCodeBuildParams();
    expect(params).to.eql([
      {
        projectName: "project1",
        sourceVersion: "asdf",
        imageOverride: "xyz",
      },
      {
        projectName: "project2",
        sourceVersion: "asdf",
        imageOverride: "abc",
      },
    ]);
  });

  it("should optionally override image for multiple projects", () => {
    process.env["INPUT_PROJECTS"] = "project1, project2";
    process.env["INPUT_REF"] = "asdf";
    process.env["INPUT_IMAGE_OVERRIDES"] = ", abc";

    const params = getCodeBuildParams();
    expect(params).to.eql([
      {
        projectName: "project1",
        sourceVersion: "asdf",
      },
      {
        projectName: "project2",
        sourceVersion: "asdf",
        imageOverride: "abc",
      },
    ]);
  });
});
