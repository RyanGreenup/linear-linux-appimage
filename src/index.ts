import { defineCommand, runMain } from "citty";
import { unpackWinExe } from "./lib/unpackExe";

const DEFAULT_SUBCOMMAND = "unpack";
const main = defineCommand({
  meta: {
    name: "linear",
    version: "0.0.1",
    description: "Repack the Linear Windows app as a Linux AppImage.",
  },
  default: DEFAULT_SUBCOMMAND,
  subCommands: {
    [DEFAULT_SUBCOMMAND]: defineCommand({
      meta: {
        name: "unpack",
        description: "Build an x64 Linux AppImage from a Linear Windows installer.",
      },
      args: {
        exePath: {
          type: "positional",
          description: "Path to the Linear exe",
          required: true,
        } as const,
      },
      run: async ({ args }) => {
        await unpackWinExe(args.exePath);
      },
    }),
  },
});

runMain(main);
