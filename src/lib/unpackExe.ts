import { extractAll } from "@electron/asar";
import { build, createTargets, Platform } from "electron-builder";
import { execa } from "execa";
import { createReadStream } from "node:fs";
import { access, mkdir, readdir, readFile, rename, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createTempDir } from "./mkTempDir";

const APP_ARCHIVE = "$PLUGINSDIR/app-64.7z";

async function findElectronVersion(executable: string): Promise<string> {
  let previous = "";
  for await (const chunk of createReadStream(executable, { highWaterMark: 1024 * 1024 })) {
    const text = previous + (chunk as Buffer).toString("latin1");
    const version = /Electron\/(\d+\.\d+\.\d+)/.exec(text)?.[1];
    if (version) return version;
    previous = text.slice(-64);
  }
  throw new Error(`Could not find the Electron version in ${executable}`);
}

async function findNativeModule(directory: string): Promise<string | undefined> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nativeModule = await findNativeModule(path);
      if (nativeModule) return nativeModule;
    } else if (entry.name.endsWith(".node")) {
      return path;
    }
  }
}

/** Build an x64 Linux AppImage from a Linear Windows installer. */
export async function unpackWinExe(exePath: string, outputDir = resolve("dist")): Promise<string[]> {
  const installer = resolve(exePath);
  await access(installer);
  const cwd = await createTempDir();
  const runInTemp = execa({ cwd });

  try {
    await runInTemp("7z", ["x", installer, APP_ARCHIVE, "-y"]);
    const appArchive = join(cwd, APP_ARCHIVE);
    await runInTemp("7z", ["x", appArchive, "-y"]);

    const windowsExecutable = join(cwd, "Linear.exe");
    const electronVersion = await findElectronVersion(windowsExecutable);
    const iconDir = join(cwd, "icons");
    await mkdir(iconDir);
    await runInTemp("7z", ["e", windowsExecutable, ".rsrc/1033/ICON/1", `-o${iconDir}`, "-y"]);
    await rename(join(iconDir, "1"), join(iconDir, "256x256.png"));

    const asarFile = join(cwd, "resources", "app.asar");
    const appDir = join(cwd, "app");
    extractAll(asarFile, appDir);

    const nativeModule = await findNativeModule(appDir);
    if (nativeModule) {
      throw new Error(`The Windows app contains a native module that needs a Linux build: ${nativeModule}`);
    }

    const metadata = JSON.parse(await readFile(join(appDir, "package.json"), "utf8")) as {
      version: string;
      main: string;
    };
    await access(join(appDir, metadata.main));
    console.log(`Packaging Linear ${metadata.version} with Electron ${electronVersion}`);

    const artifacts = await build({
      projectDir: appDir,
      targets: createTargets([Platform.LINUX], "AppImage", "x64"),
      publish: "never",
      config: {
        appId: "com.linear.desktop",
        productName: "Linear",
        electronVersion,
        directories: { output: resolve(outputDir) },
        artifactName: "Linear-${version}-${arch}.${ext}",
        npmRebuild: false,
        linux: { category: "Office", executableName: "linear", icon: iconDir },
      },
    });
    await rm(join(resolve(outputDir), "linux-unpacked"), { recursive: true, force: true });
    await rm(join(resolve(outputDir), "builder-debug.yml"), { force: true });
    for (const artifact of artifacts) console.log(`Built ${artifact}`);
    return artifacts;
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}
