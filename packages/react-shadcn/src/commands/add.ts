import * as p from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { getProjectInfo, getComponentPath } from '../utils/project';
import { COMPONENTS, type ComponentConfig } from '../config/components';

interface AddOptions {
  all?: boolean;
  overwrite?: boolean;
  path?: string;
}

export async function addComponent(
  components: string[],
  options: AddOptions
): Promise<void> {
  const projectInfo = await getProjectInfo();

  // If no components specified and not --all, show selection
  if (components.length === 0 && !options.all) {
    const selected = await p.multiselect({
      message: 'Select components to add:',
      options: Object.entries(COMPONENTS).map(([key, config]) => ({
        value: key,
        label: config.name,
        hint: config.description,
      })),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    components = selected as string[];
  }

  // If --all, add all components
  if (options.all) {
    components = Object.keys(COMPONENTS);
  }

  // Validate components
  const invalidComponents = components.filter((c) => !COMPONENTS[c]);
  if (invalidComponents.length > 0) {
    p.cancel(
      `Invalid components: ${invalidComponents.join(', ')}\nRun ${chalk.cyan('authsome-ui list')} to see available components`
    );
    process.exit(1);
  }

  const spinner = ora('Adding components...').start();

  try {
    // Get component destination path
    const componentPath = options.path || getComponentPath(projectInfo);

    // Add each component
    for (const componentKey of components) {
      const config = COMPONENTS[componentKey];
      await addSingleComponent(config, componentPath, options.overwrite || false);
      spinner.text = `Added ${config.name}`;
    }

    spinner.succeed(chalk.green(`Added ${components.length} component(s)`));

    // Show usage instructions
    console.log();
    p.note(
      `Import components in your project:
${chalk.cyan(`import { SignInForm } from '@/components/auth/sign-in-form';`)}

Or use with AuthProvider:
${chalk.cyan(`<AuthProvider client={authClient}>
  <SignInForm onSuccess={() => router.push('/dashboard')} />
</AuthProvider>`)}`,
      'Usage'
    );
  } catch (error) {
    spinner.fail(chalk.red('Failed to add components'));
    throw error;
  }
}

async function addSingleComponent(
  config: ComponentConfig,
  basePath: string,
  overwrite: boolean
): Promise<void> {
  const templatePath = path.join(
    __dirname,
    '../../templates',
    config.files[0]
  );
  const targetPath = path.join(basePath, config.files[0]);

  // Check if file exists
  if (fs.existsSync(targetPath) && !overwrite) {
    const shouldOverwrite = await p.confirm({
      message: `${config.name} already exists. Overwrite?`,
    });

    if (!shouldOverwrite || p.isCancel(shouldOverwrite)) {
      return;
    }
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(targetPath));

  // Copy template to target
  await fs.copy(templatePath, targetPath);

  // Copy additional files if any
  for (let i = 1; i < config.files.length; i++) {
    const additionalTemplatePath = path.join(
      __dirname,
      '../../templates',
      config.files[i]
    );
    const additionalTargetPath = path.join(basePath, config.files[i]);
    await fs.copy(additionalTemplatePath, additionalTargetPath);
  }

  // Install dependencies if needed
  if (config.dependencies && config.dependencies.length > 0) {
    // Dependencies are assumed to be already installed as they're from authsome-ui
  }
}

