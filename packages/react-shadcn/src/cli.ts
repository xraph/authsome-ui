#!/usr/bin/env node

/**
 * AuthSome UI CLI
 * 
 * A CLI tool to add authentication components to your project,
 * following the shadcn/ui philosophy of copy-paste, not install.
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { addComponent } from './commands/add';
import { initProject } from './commands/init';
import { listComponents } from './commands/list';
import { version } from '../package.json';

const program = new Command();

program
  .name('authsome-ui')
  .description('Add authentication components to your project')
  .version(version);

program
  .command('init')
  .description('Initialize AuthSome UI in your project')
  .action(async () => {
    console.log();
    p.intro(chalk.bold.cyan('🔐 AuthSome UI'));
    
    try {
      await initProject();
      p.outro(chalk.green('✓ Project initialized successfully!'));
    } catch (error) {
      p.cancel(chalk.red('Failed to initialize project'));
      process.exit(1);
    }
  });

program
  .command('add [components...]')
  .description('Add authentication components to your project')
  .option('-a, --all', 'Add all components')
  .option('-o, --overwrite', 'Overwrite existing files')
  .option('-p, --path <path>', 'Custom component path')
  .action(async (components: string[], options) => {
    console.log();
    p.intro(chalk.bold.cyan('🔐 AuthSome UI'));
    
    try {
      await addComponent(components, options);
      p.outro(chalk.green('✓ Components added successfully!'));
    } catch (error) {
      p.cancel(chalk.red('Failed to add components'));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available components')
  .action(async () => {
    console.log();
    p.intro(chalk.bold.cyan('🔐 AuthSome UI Components'));
    
    await listComponents();
    
    console.log();
  });

program.parse();

