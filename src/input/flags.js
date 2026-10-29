import { program, InvalidArgumentError } from 'commander';
import packageInfo from '../../package.json' with { type: 'json' }

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

async function readFlags() {
    program
        .description(packageInfo.description)
        .version(packageInfo.version)
        .option('-a, --all', "Don't apply the default ignore list (e.g. .git, .env, node_modules, target). Not recommended & Unsafe")
        .option('-c, --copy', 'Copy the result/output to your clipboard')
        .option('-d, --depth <number>', 'Set the maximum folder depth (whole number, 1 or greater)', parseDepth, Infinity)
        .option('-e, --exclude <patterns...>', 'Skip these names in the contents, and do not expand them in the tree')
        .option('--ce, --content-exclude <patterns...>', 'Skip these names in the contents only')
        .option('--te, --tree-exclude <patterns...>', 'Do not expand these folders in the tree (they are still listed)')
        .option('-i, --include <patterns...>', 'Remove these names from the ignore list, even if ignored by default or by -e')
        .option('--ci, --content-include <patterns...>', 'Same as --include, but for the contents only')
        .option('--ti, --tree-include <patterns...>', 'Same as --include, but for the tree only')
        .option('-p, --print', 'Print the result in the terminal, and also save it to context.md')
        .option('-P, --print-only', 'Print the result in the terminal only, without creating context.md')
        .option('-t, --tree', 'Generate only the project tree, without file contents')
        .option('-T, --tokens', 'Display estimated total token count for the output');

    program.parse(process.argv);

    return program.opts();
}

export { readFlags };
