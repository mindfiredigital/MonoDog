import { scanMonorepo, generateMonorepoStats } from '@monodog/utils/helpers';

export const getSystemInformation = () => {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
  };
};

export const getMonorepoStats = async () => {
  const packages = scanMonorepo(process.cwd());
  const stats = generateMonorepoStats(packages);

  return {
    ...stats,
    timestamp: Date.now(),
    scanDuration: 0,
  };
};
