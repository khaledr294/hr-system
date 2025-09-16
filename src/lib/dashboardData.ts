import { prisma } from "./prisma";

export async function getDashboardData() {
  const workersCount = await prisma.worker.count();
  const clientsCount = await prisma.client.count();
  const contractsCount = await prisma.contract.count();
  const nationalities = await prisma.worker.findMany({
    select: { nationality: true },
    distinct: ["nationality"],
  });
  const nationalityCounts = await prisma.worker.groupBy({
    by: ["nationality"],
    _count: { nationality: true },
  });
  const contractStatusCounts = await prisma.contract.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return {
    workersCount,
    clientsCount,
    contractsCount,
    nationalitiesCount: nationalities.length,
  nationalities: nationalities.map((n: { nationality: string }) => n.nationality),
    nationalityChartData: {
  labels: nationalityCounts.map((n: { nationality: string; _count: { nationality: number } }) => n.nationality),
      datasets: [{
  data: nationalityCounts.map((n: { nationality: string; _count: { nationality: number } }) => n._count.nationality),
        backgroundColor: ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#fbbf24"],
      }],
    },
    contractStatusChartData: {
  labels: contractStatusCounts.map((c: { status: string; _count: { status: number } }) => c.status),
      datasets: [{
        label: "عدد العقود",
  data: contractStatusCounts.map((c: { status: string; _count: { status: number } }) => c._count.status),
        backgroundColor: ["#6366f1", "#ef4444", "#fbbf24"],
      }],
    },
  };
}
