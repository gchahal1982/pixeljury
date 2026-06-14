/**
 * Tiny zero-dependency argument parser for the PixelJury CLI.
 * @param {string[]} argv
 * @returns {{command:string, url:string, options:object, error:string|null}}
 */
export function parseArgs(argv) {
  const options = {
    provider: undefined,
    model: undefined,
    key: undefined,
    out: undefined,
    json: false,
    help: false,
    version: false,
  };
  const positional = [];
  let error = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-v":
      case "--version":
        options.version = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--provider":
        options.provider = argv[++i];
        if (!options.provider) error = "--provider needs a value.";
        break;
      case "--model":
        options.model = argv[++i];
        if (!options.model) error = "--model needs a value.";
        break;
      case "--key":
        options.key = argv[++i];
        if (!options.key) error = "--key needs a value.";
        break;
      case "--out":
        options.out = argv[++i];
        if (!options.out) error = "--out needs a value.";
        break;
      default:
        if (a.startsWith("--provider=")) options.provider = a.slice(11);
        else if (a.startsWith("--model=")) options.model = a.slice(8);
        else if (a.startsWith("--key=")) options.key = a.slice(6);
        else if (a.startsWith("--out=")) options.out = a.slice(6);
        else if (a.startsWith("-")) error = `Unknown option "${a}".`;
        else positional.push(a);
    }
  }

  return {
    command: positional[0] || "",
    url: positional[1] || "",
    options,
    error,
  };
}
