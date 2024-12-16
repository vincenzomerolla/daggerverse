import lint from "@commitlint/lint";
import { type QualifiedRules, RuleConfigSeverity } from "@commitlint/types";
import {
  dag,
  object,
  func,
  type Secret,
  type Container,
} from "@dagger.io/dagger";

let rules: QualifiedRules = {
  "type-case": [RuleConfigSeverity.Error, "always", "lower-case"],
  "type-empty": [RuleConfigSeverity.Error, "never"],
  "type-enum": [
    RuleConfigSeverity.Error,
    "always",
    [
      "build",
      "chore",
      "ci",
      "docs",
      "feat",
      "fix",
      "perf",
      "refactor",
      "revert",
      "style",
      "test",
    ],
  ],
};

@object()
export class GhValidPrTitle {
  /**
   * Checks if a Github PR title is valid
   */
  @func()
  async check(
    repo: string,
    branch: string,
    githubToken: Secret,
  ): Promise<Container> {
    let container = dag
      .gh({
        repo,
        token: githubToken,
      })
      .exec(["pr", "view", branch, "--json", "title"]);

    let pr = JSON.parse(await container.stdout());

    let report = await lint(pr.title, rules);

    if (!report.valid) {
      throw new Error(
        `\nFailed to pass commitlint: \n${report.errors
          .map((e) => `- ${e.message}`)
          .join("\n")}`,
      );
    }

    return container;
  }
}
