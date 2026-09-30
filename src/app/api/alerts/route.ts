import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(alerts);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    const updated = await prisma.alert.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to mark alert read' }, { status: 500 });
  }
}
