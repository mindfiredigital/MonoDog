import { prisma } from '../db/prisma';

export const getRecentActivity = async (limit = 20) => {
  const activities = await prisma.activityLog.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  const total = await prisma.activityLog.count();

  const formattedActivities = activities.map((act: any) => ({
    id: act.id,
    type: act.type,
    packageName: act.packageName,
    message: act.message,
    timestamp: act.timestamp,
    metadata: act.metadata ? JSON.parse(act.metadata) : null,
  }));

  return {
    activities: formattedActivities,
    total,
  };
};
