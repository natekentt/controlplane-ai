#!/usr/bin/env node
// ControlPlane AI — CLI for structured, supervised AI workflows

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { updateCommand } from "./commands/update.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));

const program = new Command();

program
  .name("controlplane-ai")
  .description("CLI for distributing the ControlPlane AI framework into any project")
  .version(pkg.version);

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

program.parse();
