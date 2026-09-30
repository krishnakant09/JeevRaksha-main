import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/animals?ownerId=xxx  OR  GET /api/animals (all)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const animals = await prisma.animal.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(animals);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch animals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerId, species, breed, age, gender, weight, village, block, district } = body;

    if (!ownerId || !species || !village || !block || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const animal = await prisma.animal.create({
      data: {
        ownerId,
        species,
        breed: breed || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        weight: weight ? parseFloat(weight) : null,
        village,
        block,
        district,
      },
    });
    return NextResponse.json(animal, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to register animal' }, { status: 500 });
  }
}
