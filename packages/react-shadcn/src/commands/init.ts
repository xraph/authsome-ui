import * as p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import { getProjectInfo } from '../utils/project';

export async function initProject(): Promise<void> {
  const projectInfo = await getProjectInfo();

  // Check if shadcn/ui is installed
  const hasShadcn = await checkShadcnInstalled();

  if (!hasShadcn) {
    const shouldInstall = await p.confirm({
      message: 'shadcn/ui is not detected. Would you like to install it?',
      initialValue: true,
    });

    if (p.isCancel(shouldInstall)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    if (shouldInstall) {
      await installShadcn();
    }
  }

  // Install AuthSome UI dependencies
  const spinner = ora('Installing AuthSome UI dependencies...').start();

  try {
    await execa('pnpm', [
      'add',
      '@authsome/ui-core',
      '@authsome/ui-react',
      '@authsome/ui-react-headless',
    ]);

    spinner.succeed(chalk.green('Dependencies installed'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies'));
    throw error;
  }

  // Ask which adapter to install
  const adapter = await p.select({
    message: 'Which auth provider will you use?',
    options: [
      { value: 'authsome', label: 'AuthSome', hint: 'Stub (awaiting official SDK)' },
      { value: 'supabase', label: 'Supabase', hint: 'Uses Supabase JS client' },
      { value: 'clerk', label: 'Clerk', hint: 'Uses Clerk SDK' },
      { value: 'generic', label: 'Custom Backend', hint: 'Generic adapter' },
      { value: 'skip', label: 'Skip for now' },
    ],
  });

  if (p.isCancel(adapter)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  if (adapter !== 'skip') {
    const adapterSpinner = ora(`Installing ${adapter} adapter...`).start();

    try {
      const packages = [`@authsome-ui/adapter-${adapter}`];
      
      // Add peer dependencies
      if (adapter === 'supabase') {
        packages.push('@supabase/supabase-js');
      } else if (adapter === 'clerk') {
        packages.push('@clerk/clerk-js');
      }

      await execa('pnpm', ['add', ...packages]);
      adapterSpinner.succeed(chalk.green(`${adapter} adapter installed`));
    } catch (error) {
      adapterSpinner.fail(chalk.red('Failed to install adapter'));
      throw error;
    }
  }

  // Create auth client setup file
  await createAuthClientFile(adapter as string);

  p.note(
    `AuthSome UI is ready! 🎉

Next steps:
1. Add auth components: ${chalk.cyan('npx authsome-ui add')}
2. List available components: ${chalk.cyan('npx authsome-ui list')}

Example:
${chalk.cyan('npx authsome-ui add sign-in-form sign-up-form')}`,
    'Success'
  );
}

async function checkShadcnInstalled(): Promise<boolean> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return '@radix-ui/react-slot' in allDeps || 'class-variance-authority' in allDeps;
}

async function installShadcn(): Promise<void> {
  const spinner = ora('Installing shadcn/ui...').start();

  try {
    await execa('npx', ['shadcn-ui@latest', 'init', '-y']);
    spinner.succeed(chalk.green('shadcn/ui installed'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to install shadcn/ui'));
    throw error;
  }
}

async function createAuthClientFile(adapter: string): Promise<void> {
  if (adapter === 'skip') return;

  const authClientPath = path.join(process.cwd(), 'lib', 'auth-client.ts');

  // Check if src directory exists
  const hasSrcDir = fs.existsSync(path.join(process.cwd(), 'src'));
  const finalPath = hasSrcDir
    ? path.join(process.cwd(), 'src', 'lib', 'auth-client.ts')
    : authClientPath;

  await fs.ensureDir(path.dirname(finalPath));

  const content = generateAuthClientContent(adapter);
  await fs.writeFile(finalPath, content);

  console.log();
  p.note(`Created auth client at ${chalk.cyan(finalPath)}`, 'File created');
}

function generateAuthClientContent(adapter: string): string {
  const adapterImports: Record<string, string> = {
    authsome: `import { AuthSomeAdapter } from '@authsome/adapter-authsome';`,
    supabase: `import { SupabaseAdapter } from '@authsome/adapter-supabase';`,
    clerk: `import { ClerkAdapter } from '@authsome/adapter-clerk';`,
    generic: `import { GenericAdapter } from '@authsome/adapter-generic';`,
  };

  const adapterConfigs: Record<string, string> = {
    authsome: `  provider: new AuthSomeAdapter({
    apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL!,
  }),`,
    supabase: `  provider: new SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),`,
    clerk: `  provider: new ClerkAdapter({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  }),`,
    generic: `  provider: new GenericAdapter({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    endpoints: {
      signIn: '/auth/login',
      signUp: '/auth/register',
      // Add more endpoints as needed
    },
  }),`,
  };

  return `import { AuthClient } from '@authsome/ui-core';
${adapterImports[adapter]}

export const authClient = new AuthClient({
${adapterConfigs[adapter]}
});
`;
}

