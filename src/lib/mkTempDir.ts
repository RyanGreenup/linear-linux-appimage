import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
