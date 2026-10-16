{
  description = "Repack the Linear Windows app as a Linux AppImage";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      pname = "linear-linux-appimage";
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      pkgsFor = system: nixpkgs.legacyPackages.${system};
    in
    {
      overlays.default = final: _prev: {
        ${pname} = final.callPackage ./package.nix { };
      };

      packages = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          ${pname} = pkgs.callPackage ./package.nix { };
          default = self.packages.${system}.${pname};
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor system;
        in
        {
          default = pkgs.mkShell {
            inputsFrom = [ self.packages.${system}.default ];
            packages = with pkgs; [
              bun
              p7zip
              just
            ];
          };
        }
      );

      checks = forAllSystems (system: {
        build = self.packages.${system}.default;
        typecheck = self.packages.${system}.default.overrideAttrs {
          pname = "${pname}-typecheck";
          inherit (self.packages.${system}.default) pnpmDeps;
          dontBuild = false;
          buildPhase = "node_modules/.bin/tsc --noEmit";
          installPhase = "touch $out";
          doInstallCheck = false;
        };
      });

      formatter = forAllSystems (system: (pkgsFor system).nixfmt-tree);
    };
}
