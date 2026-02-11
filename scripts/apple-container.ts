import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type EnvMap = Record<string, string>;

type FlyConfig = {
  env: EnvMap;
  vmMemory?: string;
};

const repoRoot = resolve(import.meta.dir, '..');
const serverDir = resolve(repoRoot, 'server');
const flyTomlPath = resolve(serverDir, 'fly.toml');
const dataDir = resolve(serverDir, '.container-data');

const containerName = process.env.APPLE_CONTAINER_NAME || 'rs-dev-server';
const imageName = process.env.APPLE_CONTAINER_IMAGE || 'rs-dev-server:latest';
const defaultCpus = process.env.APPLE_CONTAINER_CPUS || '4';

function run(cmd: string, args: string[], allowFailure = false): number {
  const child = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: process.env
  });

  if (child.error) {
    console.error(`[apple-container] Failed to execute ${cmd}: ${child.error.message}`);
    process.exit(1);
  }

  const code = child.status ?? 1;
  if (!allowFailure && code !== 0) {
    process.exit(code);
  }
  return code;
}

function normalizeMemory(input?: string): string {
  if (!input) return '16g';
  const lower = input.trim().toLowerCase();
  if (lower.endsWith('gib')) return `${lower.slice(0, -3)}g`;
  if (lower.endsWith('gb')) return `${lower.slice(0, -2)}g`;
  if (lower.endsWith('mib')) return `${lower.slice(0, -3)}m`;
  if (lower.endsWith('mb')) return `${lower.slice(0, -2)}m`;
  return lower;
}

function parseFlyToml(path: string): FlyConfig {
  if (!existsSync(path)) {
    return { env: {} };
  }

  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/);

  const env: EnvMap = {};
  let section = '';
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const sectionMatch = line.match(/^\[(.+)]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    if (section === 'env') {
      const m = line.match(/^([A-Za-z0-9_]+)\s*=\s*"(.*)"$/);
      if (m) {
        env[m[1]] = m[2];
      }
    }
  }

  const vmMemoryMatch = text.match(/^\[vm]\s*[\s\S]*?^memory\s*=\s*"([^"]+)"/m);
  return {
    env,
    vmMemory: vmMemoryMatch?.[1]
  };
}

function ensureDataDir(): void {
  mkdirSync(dataDir, { recursive: true });
}

function buildImage(): void {
  run('container', ['build', '--file', resolve(serverDir, 'Dockerfile'), '--tag', imageName, serverDir]);
}

function removeIfExists(): void {
  run('container', ['stop', containerName], true);
  run('container', ['rm', containerName], true);
}

function up(): void {
  ensureDataDir();

  const fly = parseFlyToml(flyTomlPath);
  const env = {
    NODE_DEBUG: 'true',
    BUILD_STARTUP: 'false',
    BUILD_STARTUP_UPDATE: 'false',
    DB_BACKEND: 'sqlite',
    EASY_STARTUP: 'true',
    FRIEND_SERVER: 'true',
    LOGIN_SERVER: 'true',
    NODE_MEMBERS: 'true',
    NODE_PORT: '43594',
    NODE_RANDOM_EVENTS: 'false',
    NODE_TICKRATE: '20',
    NODE_XPRATE: '25',
    WEBSITE_REGISTRATION: 'false',
    WEB_PORT: '8080',
    AGENT_PORT: '7780',
    ...fly.env
  };

  const webPort = env.WEB_PORT || '8080';
  const nodePort = env.NODE_PORT || '43594';
  const agentPort = env.AGENT_PORT || '7780';

  const memory = normalizeMemory(process.env.APPLE_CONTAINER_MEMORY || fly.vmMemory || '16g');

  removeIfExists();

  const args = [
    'run',
    '--name',
    containerName,
    '--detach',
    '--cpus',
    defaultCpus,
    '--memory',
    memory,
    '-p',
    `127.0.0.1:${webPort}:${webPort}`,
    '-p',
    `127.0.0.1:${nodePort}:${nodePort}`,
    '-p',
    `127.0.0.1:${agentPort}:${agentPort}`,
    '-v',
    `${dataDir}:/opt/server/data`
  ];

  for (const [key, value] of Object.entries(env)) {
    args.push('-e', `${key}=${value}`);
  }

  args.push(imageName);

  run('container', args);
}

function logs(): void {
  run('container', ['logs', containerName]);
}

function status(): void {
  run('container', ['ls', '-a']);
}

function down(): void {
  removeIfExists();
}

function restart(): void {
  down();
  up();
}

function printHelp(): void {
  console.log(`Usage: bun run apple-container [command]\n\nCommands:\n  up       Build-independent start (default)\n  build    Build image ${imageName}\n  down     Stop and remove container\n  restart  Recreate container\n  logs     Show container logs\n  status   Show container list\n`);
}

const command = process.argv[2] || 'up';

switch (command) {
  case 'up':
    up();
    break;
  case 'build':
    buildImage();
    break;
  case 'down':
    down();
    break;
  case 'restart':
    restart();
    break;
  case 'logs':
    logs();
    break;
  case 'status':
    status();
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    console.error(`[apple-container] Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
