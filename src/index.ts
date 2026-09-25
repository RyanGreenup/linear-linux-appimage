import { defineCommand, runMain } from "citty";

const DEFAULT_SUBCOMMAND = "";
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
        message: {
          type: "string",
          description: "Message to print.",
          default: "hello",
        } as const,
      },
      run: async ({ args }) => {
        console.log(args.message);
      },
    }),
  },
});

runMain(main);
