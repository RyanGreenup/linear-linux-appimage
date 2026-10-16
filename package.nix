{
  lib,
  stdenvNoCC,
  bun,
  nodejs,
  p7zip,
  pnpm_11,
  fetchPnpmDeps,
  pnpmConfigHook,
  makeWrapper,
  versionCheckHook,
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "linear-linux-appimage";
  version = "0.0.1";

  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./package.json
      ./pnpm-lock.yaml
      ./tsconfig.json
      ./src
    ];
  };

  nativeBuildInputs = [
    nodejs
    pnpm_11
    pnpmConfigHook
    makeWrapper
  ];

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    pnpm = pnpm_11;
    fetcherVersion = 4;
    hash = "sha256-aAQAixKrA7tqC2OowqZiVX8a330O0vgQ+c32cfzhLUM=";
  };

  dontBuild = true;

  installPhase = ''
    runHook preInstall
    mkdir -p $out/lib/${finalAttrs.pname} $out/bin
    cp -r src package.json node_modules $out/lib/${finalAttrs.pname}/
    makeWrapper ${lib.getExe bun} $out/bin/${finalAttrs.meta.mainProgram} \
      --add-flags $out/lib/${finalAttrs.pname}/src/index.ts \
      --prefix PATH : ${lib.makeBinPath [ p7zip ]}
    runHook postInstall
  '';

  nativeInstallCheckInputs = [ versionCheckHook ];
  doInstallCheck = true;

  meta = {
    description = "Repack the Linear Windows app as a Linux AppImage";
    homepage = "https://github.com/RyanGreenup/linear-linux-appimage";
    platforms = [
      "x86_64-linux"
      "aarch64-linux"
    ];
    mainProgram = "linear-linux-appimage";
  };
})
