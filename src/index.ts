import { defineCommand, runMain } from "citty";
import { unpackWinExe } from "./lib/unpackExe";

const DEFAULT_SUBCOMMAND = "unpack";
const main = defineCommand({
  meta: {
    name: "",
    version: "0.0.1",
    description: "",
  },
  default: DEFAULT_SUBCOMMAND,
  subCommands: {
    [DEFAULT_SUBCOMMAND]: defineCommand({
      meta: {
        name: "list",
        description: "Run the command.",
      },
      args: {
        exePath: {
          type: "positional",
          description: "Path to the Linear exe",
          default: "hello",
        } as const,
      },
      run: async ({ args }) => {
        // Create temp dir
        await unpackWinExe(args.exePath);
      },
    }),
  },
});

runMain(main);
