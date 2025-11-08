{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  cachix.enable = false;

  # https://devenv.sh/packages/
  packages = with pkgs; [
    git
    tailwindcss-language-server
    # For vscode-html-language-server and vscode-css-language-server
    vscode-langservers-extracted
    hyperfine
  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    directory = "./frontend/";
    pnpm.enable = true;
  };

  # https://devenv.sh/processes/
  # processes.dev.exec = "${lib.getExe pkgs.watchexec} -n -- ls -la";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  # https://devenv.sh/basics/
  enterShell = ''
    git --version # Use packages
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}
