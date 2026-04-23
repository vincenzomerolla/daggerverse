import config from "@commitlint/config-conventional";
import lint from "@commitlint/lint";
import { dag, func, object, type Secret } from "@dagger.io/dagger";
// @ts-expect-error
import createPreset from "conventional-changelog-conventionalcommits";

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
  ): Promise<string> {
    let container = dag
      .container()
      .withEnvVariable("GH_REPO", repo)
      .withSecretVariable("GITHUB_TOKEN", githubToken)
      .from("serversideup/github-cli:2.91.0")
      .withExec(["gh", "pr", "view", branch, "--json", "title"]);
    let pr = JSON.parse(await container.stdout());
    let parserPreset = await createPreset({});
    let report = await lint(pr.title, config.rules, {
      parserOpts: parserPreset.parserOpts,
    });

    if (!report.valid) {
      let errors = report.errors.map((e) => `- ${e.message}`).join("\n");
      throw new Error(`\nFailed to pass commitlint:\n\n${errors}`);
    }

    return `✅ PR title "${pr.title}" passes commitlint conventional commit rules`;
  }
}
