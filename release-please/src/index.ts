import { dag, object, func, Secret, Container } from "@dagger.io/dagger";
import {
  GitHub,
  Manifest,
  CreatedRelease,
  PullRequest,
  VERSION,
} from "release-please";

@object()
export class ReleasePlease {
  base(): Container {
    return dag
      .container()
      .withDefaultTerminalCmd(["/bin/bash"])
      .from("node:20")
      .withExec(["npm", "i", "-g", "release-please"]);
  }

  /**
   * Run release-please on a repository
   */
  @func()
  async run(githubToken: Secret, repository: string) {
    return this.base();
  }
}
