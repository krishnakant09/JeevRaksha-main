import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, riskLevel } = await req.json();
    const resolvedParams = await params;
    const caseId = resolvedParams.id;

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { healthReport: true }
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Update case status
    let updateData: any = {};
    if (status) {
      updateData.status = status;
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: updateData,
    });

    // Update health report risk level if requested
    if (riskLevel && existingCase.healthReportId) {
      await prisma.healthReport.update({
        where: { id: existingCase.healthReportId },
        data: { riskLevel },
      });
    }

    return NextResponse.json(updatedCase);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}
