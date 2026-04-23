import { scanMonorepo } from '@monodog/utils/helpers';

const getRandomActivityType = () => {
  const activityTypes = [
    'package_updated',
    'build_success',
    'test_passed',
    'dependency_updated',
  ];
  return activityTypes[Math.floor(Math.random() * activityTypes.length)];
};

const getRandomRecentTimestamp = () => {
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

  return new Date(Date.now() - Math.random() * oneWeekInMs);
};

export const getRecentActivity = async (limit = 20) => {
  const packages = scanMonorepo(process.cwd());

  const activities = packages
    .slice(0, Math.min(limit, packages.length))
    .map((pkg, index) => ({
      id: `activity-${Date.now()}-${index}`,
      type: getRandomActivityType(),
      packageName: pkg.name,
      message: `Activity for ${pkg.name}`,
      timestamp: getRandomRecentTimestamp(),
      metadata: {
        version: pkg.version,
        type: pkg.type,
      },
    }));

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    activities: activities.slice(0, limit),
    total: activities.length,
  };
};
