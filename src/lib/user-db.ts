import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface DBUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: string;
  status: string;
  language: string;
  registrationNo?: string | null;
  jurisdictionLevel: string;
  jurisdictionState: string;
  jurisdictionDistrict: string | null;
  jurisdictionTaluka: string | null;
  jurisdictionVillage: string | null;
  createdAt: Date | string;
}

export async function findUserByPhone(phone: string): Promise<DBUser | null> {
  const pseudoEmail = `farmer_${phone}@jeevraksha.gov.in`;
  const pseudoVetEmail = `vet_${phone}@jeevraksha.gov.in`;
  const pseudoOfficerEmail = `officer_${phone}@maharashtra.gov.in`;

  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      "SELECT * FROM User WHERE phone = ? OR email IN (?, ?, ?) LIMIT 1",
      phone,
      pseudoEmail,
      pseudoVetEmail,
      pseudoOfficerEmail
    );
    if (rows && rows.length > 0) return rows[0];
  } catch (e) {
    console.error("Error in findUserByPhone raw query:", e);
  }

  return null;
}

export async function upsertFarmerUser(params: {
  phone: string;
  name: string;
  district: string;
  taluka: string;
  village?: string;
  language?: string;
}): Promise<DBUser> {
  const existing = await findUserByPhone(params.phone);
  const now = new Date().toISOString();
  const pseudoEmail = `farmer_${params.phone}@jeevraksha.gov.in`;

  if (existing) {
    await prisma.$executeRawUnsafe(
      "UPDATE User SET name = ?, role = 'FARMER', status = 'APPROVED', language = ?, jurisdictionDistrict = ?, jurisdictionTaluka = ?, jurisdictionVillage = ? WHERE id = ?",
      params.name,
      params.language || "mr",
      params.district,
      params.taluka,
      params.village || null,
      existing.id
    );
    return {
      ...existing,
      name: params.name,
      role: "FARMER",
      status: "APPROVED",
      language: params.language || "mr",
      jurisdictionDistrict: params.district,
      jurisdictionTaluka: params.taluka,
      jurisdictionVillage: params.village || null,
    };
  }

  const id = `usr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    "INSERT INTO User (id, email, phone, name, role, status, language, jurisdictionState, jurisdictionDistrict, jurisdictionTaluka, jurisdictionVillage, createdAt) VALUES (?, ?, ?, ?, 'FARMER', 'APPROVED', ?, 'Maharashtra', ?, ?, ?, ?)",
    id,
    pseudoEmail,
    params.phone,
    params.name,
    params.language || "mr",
    params.district,
    params.taluka,
    params.village || null,
    now
  );

  return {
    id,
    email: pseudoEmail,
    phone: params.phone,
    name: params.name,
    role: "FARMER",
    status: "APPROVED",
    language: params.language || "mr",
    jurisdictionLevel: "STATE",
    jurisdictionState: "Maharashtra",
    jurisdictionDistrict: params.district,
    jurisdictionTaluka: params.taluka,
    jurisdictionVillage: params.village || null,
    createdAt: now,
  };
}

export async function upsertVetUser(params: {
  phone: string;
  name: string;
  registrationNo: string;
  district: string;
  taluka: string;
  language?: string;
}): Promise<DBUser> {
  const existing = await findUserByPhone(params.phone);
  const now = new Date().toISOString();
  const pseudoEmail = `vet_${params.phone}@jeevraksha.gov.in`;

  if (existing) {
    await prisma.$executeRawUnsafe(
      "UPDATE User SET name = ?, role = 'VETERINARIAN', status = 'PENDING_REVIEW', language = ?, registrationNo = ?, jurisdictionDistrict = ?, jurisdictionTaluka = ? WHERE id = ?",
      params.name,
      params.language || "mr",
      params.registrationNo,
      params.district,
      params.taluka,
      existing.id
    );
    return {
      ...existing,
      name: params.name,
      role: "VETERINARIAN",
      status: "PENDING_REVIEW",
      language: params.language || "mr",
      registrationNo: params.registrationNo,
      jurisdictionDistrict: params.district,
      jurisdictionTaluka: params.taluka,
    };
  }

  const id = `vet_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    "INSERT INTO User (id, email, phone, name, role, status, language, registrationNo, jurisdictionState, jurisdictionDistrict, jurisdictionTaluka, createdAt) VALUES (?, ?, ?, ?, 'VETERINARIAN', 'PENDING_REVIEW', ?, ?, 'Maharashtra', ?, ?, ?)",
    id,
    pseudoEmail,
    params.phone,
    params.name,
    params.language || "mr",
    params.registrationNo,
    params.district,
    params.taluka,
    now
  );

  return {
    id,
    email: pseudoEmail,
    phone: params.phone,
    name: params.name,
    role: "VETERINARIAN",
    status: "PENDING_REVIEW",
    language: params.language || "mr",
    registrationNo: params.registrationNo,
    jurisdictionLevel: "STATE",
    jurisdictionState: "Maharashtra",
    jurisdictionDistrict: params.district,
    jurisdictionTaluka: params.taluka,
    jurisdictionVillage: null,
    createdAt: now,
  };
}

export async function upsertOfficerUser(params: {
  phone: string;
  name: string;
  role: string;
  district: string;
  taluka: string;
}): Promise<DBUser> {
  const existing = await findUserByPhone(params.phone);
  const now = new Date().toISOString();
  const pseudoEmail = `officer_${params.phone}@maharashtra.gov.in`;

  if (existing) {
    await prisma.$executeRawUnsafe(
      "UPDATE User SET name = ?, role = ?, status = 'APPROVED', jurisdictionDistrict = ?, jurisdictionTaluka = ? WHERE id = ?",
      params.name,
      params.role,
      params.district,
      params.taluka,
      existing.id
    );
    return {
      ...existing,
      name: params.name,
      role: params.role,
      status: "APPROVED",
      jurisdictionDistrict: params.district,
      jurisdictionTaluka: params.taluka,
    };
  }

  const id = `off_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    "INSERT INTO User (id, email, phone, name, role, status, language, jurisdictionState, jurisdictionDistrict, jurisdictionTaluka, createdAt) VALUES (?, ?, ?, ?, ?, 'APPROVED', 'mr', 'Maharashtra', ?, ?, ?)",
    id,
    pseudoEmail,
    params.phone,
    params.name,
    params.role,
    params.district,
    params.taluka,
    now
  );

  return {
    id,
    email: pseudoEmail,
    phone: params.phone,
    name: params.name,
    role: params.role,
    status: "APPROVED",
    language: "mr",
    jurisdictionLevel: "STATE",
    jurisdictionState: "Maharashtra",
    jurisdictionDistrict: params.district,
    jurisdictionTaluka: params.taluka,
    jurisdictionVillage: null,
    createdAt: now,
  };
}

export async function saveFarmerProfile(userId: string, district: string, taluka: string, village?: string) {
  const now = new Date().toISOString();
  const id = `fp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  try {
    const rows: any[] = await prisma.$queryRawUnsafe("SELECT id FROM FarmerProfile WHERE userId = ? LIMIT 1", userId);
    if (rows && rows.length > 0) {
      await prisma.$executeRawUnsafe(
        "UPDATE FarmerProfile SET district = ?, taluka = ?, village = ? WHERE userId = ?",
        district, taluka, village || null, userId
      );
    } else {
      await prisma.$executeRawUnsafe(
        "INSERT INTO FarmerProfile (id, userId, district, taluka, village, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        id, userId, district, taluka, village || null, now
      );
    }
  } catch (e) {
    console.error("Error saving farmer profile:", e);
  }
}

export async function saveAnimalSummaries(userId: string, animals: Array<{ species: string; count: number }>) {
  const now = new Date().toISOString();
  for (const item of animals) {
    const count = Number(item.count || 0);
    if (item.species && count > 0) {
      const id = `as_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      await prisma.$executeRawUnsafe(
        "INSERT INTO AnimalSummary (id, userId, species, count, createdAt) VALUES (?, ?, ?, ?, ?)",
        id, userId, item.species.toLowerCase(), count, now
      ).catch(() => {});
    }
  }
}

export async function saveVetProfile(params: {
  userId: string;
  vetType: string;
  registrationNo: string;
  council: string;
  certificateUrl: string;
  serviceDistrict: string;
  serviceTaluka: string;
  serviceVillages?: string;
  languages?: string;
  availability?: string;
}) {
  const now = new Date().toISOString();
  const id = `vp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  try {
    const rows: any[] = await prisma.$queryRawUnsafe("SELECT id FROM VetProfile WHERE userId = ? LIMIT 1", params.userId);
    if (rows && rows.length > 0) {
      await prisma.$executeRawUnsafe(
        "UPDATE VetProfile SET vetType = ?, registrationNo = ?, council = ?, certificateUrl = ?, serviceDistrict = ?, serviceTaluka = ?, serviceVillages = ?, languages = ?, availability = ? WHERE userId = ?",
        params.vetType, params.registrationNo, params.council, params.certificateUrl, params.serviceDistrict, params.serviceTaluka, params.serviceVillages || null, params.languages || null, params.availability || null, params.userId
      );
    } else {
      await prisma.$executeRawUnsafe(
        "INSERT INTO VetProfile (id, userId, vetType, registrationNo, council, certificateUrl, serviceDistrict, serviceTaluka, serviceVillages, languages, availability, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id, params.userId, params.vetType, params.registrationNo, params.council, params.certificateUrl, params.serviceDistrict, params.serviceTaluka, params.serviceVillages || null, params.languages || null, params.availability || null, now
      );
    }
  } catch (e) {
    console.error("Error saving vet profile:", e);
  }
}

export async function recordConsent(userId: string, type: string, accepted: boolean = true) {
  const now = new Date().toISOString();
  const id = `cns_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    "INSERT INTO Consent (id, userId, type, accepted, textVersion, acceptedAt) VALUES (?, ?, ?, ?, '1.0', ?)",
    id, userId, type, accepted ? 1 : 0, now
  ).catch(() => {});
}

export async function logAudit(userId: string | null, action: string, details: string) {
  const now = new Date().toISOString();
  const id = `aud_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$executeRawUnsafe(
    "INSERT INTO AuditLog (id, userId, action, details, createdAt) VALUES (?, ?, ?, ?, ?)",
    id, userId, action, details, now
  ).catch(() => {});
}

export interface VetApplication {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  vetType: string;
  registrationNo: string;
  council: string;
  certificateUrl: string | null;
  serviceDistrict: string;
  serviceTaluka: string;
  serviceVillages: string | null;
  languages: string | null;
  availability: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export async function getAllVets(statusFilter?: string): Promise<VetApplication[]> {
  try {
    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.status, 
        u.createdAt, 
        v.vetType, 
        COALESCE(v.registrationNo, u.registrationNo) as registrationNo, 
        v.council, 
        v.certificateUrl, 
        COALESCE(v.serviceDistrict, u.jurisdictionDistrict) as serviceDistrict, 
        COALESCE(v.serviceTaluka, u.jurisdictionTaluka) as serviceTaluka, 
        v.serviceVillages, 
        v.languages, 
        v.availability, 
        v.reviewedBy, 
        v.reviewedAt, 
        v.rejectionReason
      FROM User u
      LEFT JOIN VetProfile v ON u.id = v.userId
      WHERE u.role = 'VETERINARIAN'
    `;

    if (statusFilter && statusFilter !== "ALL") {
      sql += ` AND u.status = '${statusFilter}'`;
    }

    sql += " ORDER BY u.createdAt DESC";

    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    return rows.map((r) => ({
      id: r.id,
      name: r.name || "Dr. Unnamed Veterinarian",
      email: r.email,
      phone: r.phone,
      role: r.role,
      status: r.status,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      vetType: r.vetType || "VET",
      registrationNo: r.registrationNo || "N/A",
      council: r.council || "Maharashtra State Veterinary Council (MSVC)",
      certificateUrl: r.certificateUrl || null,
      serviceDistrict: r.serviceDistrict || "Pune",
      serviceTaluka: r.serviceTaluka || "Haveli",
      serviceVillages: r.serviceVillages || null,
      languages: r.languages || "mr,hi,en",
      availability: r.availability || "Full Time",
      reviewedBy: r.reviewedBy || null,
      reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : null,
      rejectionReason: r.rejectionReason || null,
    }));
  } catch (err) {
    console.error("Error in getAllVets query:", err);
    return [];
  }
}

export async function approveVet(userId: string, reviewerName: string = "State Administrator"): Promise<boolean> {
  const now = new Date().toISOString();
  try {
    await prisma.$executeRawUnsafe(
      "UPDATE User SET status = 'APPROVED' WHERE id = ?",
      userId
    );
    await prisma.$executeRawUnsafe(
      "UPDATE VetProfile SET reviewedBy = ?, reviewedAt = ?, rejectionReason = NULL WHERE userId = ?",
      reviewerName,
      now,
      userId
    );
    await logAudit(
      userId,
      "VET_REGISTRATION_APPROVED",
      `Veterinarian application approved by ${reviewerName}`
    );
    return true;
  } catch (e) {
    console.error("Error approving vet:", e);
    return false;
  }
}

export async function rejectVet(userId: string, reason: string, reviewerName: string = "State Administrator"): Promise<boolean> {
  const now = new Date().toISOString();
  try {
    await prisma.$executeRawUnsafe(
      "UPDATE User SET status = 'REJECTED' WHERE id = ?",
      userId
    );
    await prisma.$executeRawUnsafe(
      "UPDATE VetProfile SET reviewedBy = ?, reviewedAt = ?, rejectionReason = ? WHERE userId = ?",
      reviewerName,
      now,
      reason,
      userId
    );
    await logAudit(
      userId,
      "VET_REGISTRATION_REJECTED",
      `Veterinarian application rejected by ${reviewerName}. Reason: ${reason}`
    );
    return true;
  } catch (e) {
    console.error("Error rejecting vet:", e);
    return false;
  }
}

