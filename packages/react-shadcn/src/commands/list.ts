import chalk from 'chalk';
import { COMPONENTS } from '../config/components';

export async function listComponents(): Promise<void> {
  console.log();
  console.log(chalk.bold('Available Components:'));
  console.log();

  Object.entries(COMPONENTS).forEach(([key, config]) => {
    console.log(`  ${chalk.cyan(key.padEnd(20))} ${config.name}`);
    console.log(`  ${chalk.gray('└─')} ${config.description}`);
    console.log();
  });

  console.log(chalk.dim('Usage:'));
  console.log(chalk.dim(`  $ npx authsome-ui add ${chalk.cyan('[component-name]')}`));
  console.log(chalk.dim(`  $ npx authsome-ui add ${chalk.cyan('--all')}`));
}

