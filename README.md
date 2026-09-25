# Linear AppImage repacker

Build an x64 Linux AppImage from a Linear Windows installer. The tool extracts
the bundled Electron app, detects its Electron version, and packages it with the
matching Linux runtime. It uses the Linear icon embedded in the Windows
executable.

> [!NOTE]
> This has only been tested on the windows [Linear `v1.32.4` `exe`][1] (Electron
> v41.3.0 is used in that release [^@5110d3b] ) [^@d6caae0]

[^@5110d3b]:
    Release electron v41.3.0 · electron/electron. (n.d.). GitHub. Retrieved
    September 25, 2026, from
    https://github.com/electron/electron/releases/tag/v41.3.0

[^@d6caae0]:
    Download Linear. (n.d.). Retrieved September 25, 2026, from
    https://linear.app/download

[1]: https://releases.linear.app/windows

## Requirements

- `pnpm`
- `7z` (p7zip)
- Internet
  - Must download the Electron runtime matching the version used for the
    executable

## Build

```sh
pnpm install
bun run src/index.ts unpack "/path/to/Linear Setup 1.32.4.exe"
```

For the installer path in `justfile`, run `just`. The result is
`dist/Linear-<version>-x86_64.AppImage`.

> [!CAUTION]
> The tool checks the app for native `.node` modules and stops if it finds one.
> These have not yet been handled as Linear is quite web centric. Such modules
> require Linux builds before the app can be packaged and this has not yet been
> implemented.
