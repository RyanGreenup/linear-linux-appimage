import { defineCommand, runMain } from "citty";
import { execa } from "execa";
import { copyFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

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
        const cwd = await createTempDir();
        const exeFileName = basename(args.exePath);
        const runInTemp = execa({ cwd });
        // Copy the file
        await copyFile(args.exePath, join(cwd, exeFileName));
        // Extract the `.exe` with 7zip (similar for `.app`)
        const { stdout: extractedOutput } = await runInTemp("7z", ["x", exeFileName]);
        // console.log(extractedOutput);

        // // Print the tree for debugging
        // const { stdout: treeOut } = await runInTemp("tree");
        // console.log(treeOut);
      },
    }),
  },
});

/**
 * Creates a temporary directory
 */
export async function createTempDir(prefix = "linear-unpack"): Promise<string> {
  // os.tmpdir() provides the system temp folder (e.g., /tmp or AppData\Local\Temp)
  const baseDir = join(tmpdir(), prefix);

  // mkdtemp appends 6 random characters to the prefix to ensure uniqueness
  const tempDirPath = await mkdtemp(baseDir);

  console.log(`Temporary directory created at: ${tempDirPath}`);
  return tempDirPath;
}

runMain(main);
