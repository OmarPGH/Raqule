import { program, Option, InvalidArgumentError } from 'commander';
import packageInfo from '../../package.json' with { type: 'json' }
import { outputFileName, configFileName } from '../shared/constants.js';

function parseDepth(value) {
    const normalized = value.toLowerCase();

    if (['infinity', 'inf', 'max'].includes(normalized)) {
        return Infinity;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new InvalidArgumentError('Depth must be a whole number of 1 or greater, or "infinity"/"inf"/"max".');
    }

    return parsed;
}

function parseMax(value) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new InvalidArgumentError('Max must be a whole number of 1 or greater.');
    }

    return parsed;
}

function readFlags() {
    program
        .description(packageInfo.description)
        .version(packageInfo.version)
        .option('-a, --all', "Don't apply the default ignore list (e.g. .git, .env, node_modules, target). Not recommended & Unsafe")
        .option('-c, --copy', 'Copy the result/output to your clipboard')
        .option('-C, --copy-only', 'Copy the result/output to your clipboard only, without printing it')
        .option('--cc, --create-config', `Create ${configFileName} if the project has none, without asking`)
        .option('-d, --depth <value>', 'Set the maximum folder depth. Accepts a whole number (1 or greater), or `infinity`/`inf`/`max` (case-insensitive) for no limit. Defaults to `Infinity` (no limit) when omitted', parseDepth, Infinity)
        .addOption(new Option('-D, --default', "Automatically selects the default option for prompts & confirmations").conflicts(['output', 'directoryPath', 'createConfig']))
        .option('--dp, --directory-path <path>', 'The project directory to gather (skips the directory prompt)')
        .option('-e, --exclude <patterns...>', 'Skip these names in the contents, and do not expand them in the tree')
        .option('--ce, --content-exclude <patterns...>', 'Skip these names in the contents only')
        .option('--te, --tree-exclude <patterns...>', 'Do not expand these folders in the tree (they are still listed)')
        .option('-i, --include <patterns...>', 'Remove these names from the ignore list, even if ignored by default or by -e')
        .option('--ci, --content-include <patterns...>', 'Same as --include, but for the contents only')
        .option('--ti, --tree-include <patterns...>', 'Same as --include, but for the tree only')
        .option('-m, --max <number>', 'Set the maximum output tokens (whole number, 1 or greater)', parseMax)
        .option('-n, --non-interactive', 'Never prompt: use the values passed by flags (-o, --dp, --cc) and the defaults for the rest')
        .option('-o, --output <path>', `The folder where ${outputFileName} is saved (skips the output path prompt)`)
        .option('-p, --print', `Print the result in the terminal, and also save it to ${outputFileName}`)
        .option('-P, --print-only', `Print the result in the terminal only, without creating ${outputFileName}`)
        .option('-t, --tree', 'Generate only the project tree, without file contents')
        .option('-T, --tokens', 'Display estimated total token count for the output');

    program.parse(process.argv);

    const flags = program.opts();

    if (flags.default && flags.nonInteractive) {
        console.warn('Warning: -n/--non-interactive is redundant when -D/--default is used. Running with -D.');
    }

    return flags;
}

export { readFlags };
