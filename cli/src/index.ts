#!/usr/bin/env node
// ControlPlane AI — CLI for structured, supervised AI workflows

import { Command } from "commander";
import { VERSION } from "./constants.js";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { updateCommand } from "./commands/update.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { checkForUpdate } from "./lib/version-check.js";

const program = new Command();

program
  .name("controlplane-ai")
  .description("CLI for distributing the ControlPlane AI framework into any project")
  .version(VERSION);

program
  .command("init")
  .description("Initialize ControlPlane AI framework in a project")
  .argument("[directory]", "Target project directory", ".")
  .action(async (directory: string) => {
    await initCommand(directory);
  });

program
  .command("validate")
  .description("Check framework files for local modifications")
  .argument("[directory]", "Target project directory", ".")
  .action(async (directory: string) => {
    await validateCommand(directory);
  });

program
  .command("update")
  .description("Update framework files to latest version")
  .argument("[directory]", "Target project directory", ".")
  .action(async (directory: string) => {
    await updateCommand(directory);
  });

program
  .command("uninstall")
  .description("Remove all ControlPlane AI framework files from a project")
  .argument("[directory]", "Target project directory", ".")
  .action(async (directory: string) => {
    await uninstallCommand(directory);
  });

program.hook("postAction", async () => {
  await checkForUpdate();
});

program.parse();
