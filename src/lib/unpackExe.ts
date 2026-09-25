/**
 * Unpack a windows Install
 *
 * TODO handle MacOsX with `7z x App -o dmg`
 */
export async function unpackWinExe(exePath: string) {
  const cwd = await createTempDir();
  const exeFileName = basename(exePath);
  const runInTemp = execa({ cwd });
  // Copy the file
  await copyFile(exePath, join(cwd, exeFileName));
  // NOTE: The NSIS uninstaller in the archive can'tbe decoded by 7z
  // it's not required so just ignore it.
  await runInTemp("7z", ["x", exeFileName, "-x!$R0/Uninstall Linear.exe"]);

  // Unpack the archive with the app
  const appArchive = "$PLUGINSDIR/app-64.7z";
  runInTemp("7z", ["x", appArchive]);

  // Print the tree for debugging
  const { stdout: treeOut } = await runInTemp("tree");
  console.log(treeOut);

  /**
   * The asarFile to repack
   * */
  const asarFile = "resources/app.asar";
}
