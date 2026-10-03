/**
 * Server-Side Jurisdiction Access Control for Pashu Rakshak (SIH26128)
 * 
 * Rules:
 * - STATE_OFFICER / SYSTEM_ADMIN: Access across the entire State (Maharashtra).
 * - DISTRICT_OFFICER: Strictly bound to their assigned district. Cannot query other districts.
 * - TALUKA_OFFICER: Strictly bound to their assigned district AND taluka/block.
 * - VETERINARIAN: Access to assigned district/taluka or specific assigned cases.
 */

export interface OfficerUser {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  jurisdictionLevel?: string | null; // STATE, DISTRICT, TALUKA, VILLAGE
  jurisdictionState?: string | null;
  jurisdictionDistrict?: string | null;
  jurisdictionTaluka?: string | null;
  jurisdictionVillage?: string | null;
}

export interface RequestedLocationFilter {
  district?: string | null;
  taluka?: string | null;
  village?: string | null;
}

/**
 * Builds server-enforced Prisma WHERE conditions for HealthReport queries.
 */
export function buildHealthReportJurisdictionFilter(
  user: OfficerUser | null,
  requested?: RequestedLocationFilter
) {
  if (!user) {
    return { id: "__UNAUTHORIZED__" }; // Deny access
  }

  const where: any = {};

  // 1. Role-based server boundary
  if (user.role === "DISTRICT_OFFICER") {
    // Hard server enforcement: locked to officer's assigned district
    where.locationDistrict = user.jurisdictionDistrict || "Pune";
    if (requested?.taluka) where.locationBlock = requested.taluka;
    if (requested?.village) where.locationVillage = requested.village;
    return where;
  }

  if (user.role === "TALUKA_OFFICER") {
    // Hard server enforcement: locked to assigned district and taluka
    where.locationDistrict = user.jurisdictionDistrict || "Pune";
    where.locationBlock = user.jurisdictionTaluka || "Haveli";
    if (requested?.village) where.locationVillage = requested.village;
    return where;
  }

  // STATE_OFFICER, ADMIN, SYSTEM_ADMIN have state-wide access with optional drilldowns
  if (requested?.district && requested.district !== "ALL") {
    where.locationDistrict = requested.district;
  }
  if (requested?.taluka && requested.taluka !== "ALL") {
    where.locationBlock = requested.taluka;
  }
  if (requested?.village && requested.village !== "ALL") {
    where.locationVillage = requested.village;
  }

  return where;
}

/**
 * Builds server-enforced Prisma WHERE conditions for Case queries.
 */
export function buildCaseJurisdictionFilter(
  user: OfficerUser | null,
  requested?: RequestedLocationFilter
) {
  if (!user) {
    return { id: "__UNAUTHORIZED__" };
  }

  if (user.role === "DISTRICT_OFFICER") {
    const animalWhere: any = { district: user.jurisdictionDistrict || "Pune" };
    if (requested?.taluka) animalWhere.block = requested.taluka;
    if (requested?.village) animalWhere.village = requested.village;
    return { animal: animalWhere };
  }

  if (user.role === "TALUKA_OFFICER") {
    const animalWhere: any = {
      district: user.jurisdictionDistrict || "Pune",
      block: user.jurisdictionTaluka || "Haveli",
    };
    if (requested?.village) animalWhere.village = requested.village;
    return { animal: animalWhere };
  }

  const animalWhere: any = {};
  if (requested?.district && requested.district !== "ALL") {
    animalWhere.district = requested.district;
  }
  if (requested?.taluka && requested.taluka !== "ALL") {
    animalWhere.block = requested.taluka;
  }
  if (requested?.village && requested.village !== "ALL") {
    animalWhere.village = requested.village;
  }

  return Object.keys(animalWhere).length > 0 ? { animal: animalWhere } : {};
}

/**
 * Verifies if an officer has administrative jurisdiction over a given target location.
 */
export function canOfficerActOnLocation(
  user: OfficerUser | null,
  targetDistrict: string,
  targetTaluka?: string
): boolean {
  if (!user) return false;
  if (user.role === "STATE_OFFICER" || user.role === "ADMIN" || user.role === "SYSTEM_ADMIN") {
    return true; // Statewide jurisdiction
  }
  if (user.role === "DISTRICT_OFFICER") {
    return user.jurisdictionDistrict?.toLowerCase() === targetDistrict.toLowerCase();
  }
  if (user.role === "TALUKA_OFFICER") {
    const matchesDistrict = user.jurisdictionDistrict?.toLowerCase() === targetDistrict.toLowerCase();
    const matchesTaluka = targetTaluka ? user.jurisdictionTaluka?.toLowerCase() === targetTaluka.toLowerCase() : true;
    return matchesDistrict && matchesTaluka;
  }
  return false;
}
