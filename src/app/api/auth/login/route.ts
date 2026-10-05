import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { email: emailLower.replace('@pashurakshak.in', '@jeevraksha.in') },
          { email: emailLower.replace('@jeevraksha.in', '@pashurakshak.in') },
        ],
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if account is suspended or rejected
    if (user.status === "SUSPENDED" || user.status === "REJECTED") {
      return NextResponse.json(
        { error: `Account is ${user.status.toLowerCase()}. Please contact administration.` },
        { status: 403 }
      );
    }

    // Return user info with jurisdiction (no password)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      registrationNo: user.registrationNo,
      jurisdictionLevel: user.jurisdictionLevel,
      jurisdictionState: user.jurisdictionState,
      jurisdictionDistrict: user.jurisdictionDistrict,
      jurisdictionTaluka: user.jurisdictionTaluka,
      jurisdictionVillage: user.jurisdictionVillage,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
