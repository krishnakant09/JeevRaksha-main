import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalAnimals, activeCases, highRiskZones, totalVaccinations, recentReports, recentAlerts] = await Promise.all([
      prisma.animal.count(),
      prisma.case.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.healthReport.count({ where: { riskLevel: 'HIGH' } }),
      prisma.vaccination.count(),
      prisma.healthReport.findMany({
        include: { animal: true, symptoms: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.alert.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalAnimals,
      activeCases,
      highRiskZones,
      totalVaccinations,
      recentReports,
      recentAlerts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
