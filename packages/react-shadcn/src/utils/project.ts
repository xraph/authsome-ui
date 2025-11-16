import fs from 'fs-extra';
import path from 'path';

export interface ProjectInfo {
  hasSrc: boolean;
  hasApp: boolean;
  hasPages: boolean;
  hasShadcn: boolean;
  componentPath: string;
}

export async function getProjectInfo(): Promise<ProjectInfo> {
  const cwd = process.cwd();
  
  const hasSrc = fs.existsSync(path.join(cwd, 'src'));
  const hasApp = fs.existsSync(path.join(cwd, hasSrc ? 'src/app' : 'app'));
  const hasPages = fs.existsSync(path.join(cwd, hasSrc ? 'src/pages' : 'pages'));
  
  // Check for shadcn/ui installation
  const hasShadcn = await checkShadcnConfig();
  
  // Determine component path based on project structure
  let componentPath = 'components';
  
  if (hasShadcn) {
    // Try to read shadcn config for component path
    const shadcnPath = await getShadcnComponentPath();
    if (shadcnPath) {
      componentPath = shadcnPath;
    }
  }
  
  if (hasSrc && !componentPath.startsWith('src/')) {
    componentPath = `src/${componentPath}`;
  }
  
  return {
    hasSrc,
    hasApp,
    hasPages,
    hasShadcn,
    componentPath,
  };
}

async function checkShadcnConfig(): Promise<boolean> {
  const configPath = path.join(process.cwd(), 'components.json');
  return fs.existsSync(configPath);
}

async function getShadcnComponentPath(): Promise<string | null> {
  const configPath = path.join(process.cwd(), 'components.json');
  
  if (!fs.existsSync(configPath)) {
    return null;
  }
  
  try {
    const config = await fs.readJson(configPath);
    return config.aliases?.components || null;
  } catch {
    return null;
  }
}

export function getComponentPath(projectInfo: ProjectInfo): string {
  return path.join(process.cwd(), projectInfo.componentPath);
}

