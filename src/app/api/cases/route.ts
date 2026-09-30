import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      include: {
        animal: true,
        veterinarian: { select: { id: true, name: true } },
        healthReport: { include: { symptoms: true } },
        treatments: true,
        samples: true,
        fieldVisits: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(cases);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, veterinarianId } = await req.json();
    const updated = await prisma.case.update({
      where: { id },
      data: {
        status,
        ...(veterinarianId ? { veterinarianId } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}
