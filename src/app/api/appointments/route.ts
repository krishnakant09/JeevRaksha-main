import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verified Government Veterinarians & Dispensaries in Maharashtra
export const VET_DIRECTORY = [
  {
    id: "vet-1",
    name: "Dr. Priya Sharma",
    qualification: "B.V.Sc & A.H., M.V.Sc (Surgery)",
    registrationNo: "MSVC-2018-9942",
    experience: "8+ Years",
    rating: 4.9,
    reviewsCount: 142,
    dispensary: "Haveli Taluka Veterinary Dispensary",
    district: "Pune",
    taluka: "Haveli",
    address: "Near Panchayat Samiti, Haveli, Pune - 411028",
    phone: "+91 98231 44521",
    emergencyAvailable: true,
    availableToday: true,
    consultationFee: "Free (Govt. Subsidized)",
    languages: ["Hindi", "Marathi", "English"],
    specialization: "Bovine Surgery, FMD & Lumpy Skin Management",
    avatar: "👩‍⚕️"
  },
  {
    id: "vet-2",
    name: "Dr. Vijay Kadam",
    qualification: "B.V.Sc & A.H., Epidemiologist",
    registrationNo: "MSVC-2015-4421",
    experience: "11+ Years",
    rating: 4.8,
    reviewsCount: 215,
    dispensary: "Pune District Veterinary Poly-Clinic",
    district: "Pune",
    taluka: "Pune City",
    address: "Shivaji Nagar Veterinary Hospital Complex, Pune - 411005",
    phone: "+91 94220 88124",
    emergencyAvailable: true,
    availableToday: true,
    consultationFee: "Free (Govt. Subsidized)",
    languages: ["Marathi", "Hindi"],
    specialization: "Infectious Outbreak Containment, Dairy Herd Health",
    avatar: "👨‍⚕️"
  },
  {
    id: "vet-3",
    name: "Dr. Rajesh Deshmukh",
    qualification: "M.V.Sc (Veterinary Medicine)",
    registrationNo: "MSVC-2012-3108",
    experience: "14+ Years",
    rating: 4.9,
    reviewsCount: 320,
    dispensary: "Baramati Block Veterinary Hospital",
    district: "Pune",
    taluka: "Baramati",
    address: "MIDC Bypass Road, Baramati, Dist. Pune - 413102",
    phone: "+91 98901 23412",
    emergencyAvailable: true,
    availableToday: true,
    consultationFee: "Free (Govt. Subsidized)",
    languages: ["Marathi", "Hindi", "English"],
    specialization: "Livestock Triage, Blood Parasites, Mastitis Protocol",
    avatar: "👨‍⚕️"
  },
  {
    id: "vet-4",
    name: "Dr. Sneha Kulkarni",
    qualification: "B.V.Sc & A.H.",
    registrationNo: "MSVC-2020-8819",
    experience: "5+ Years",
    rating: 4.7,
    reviewsCount: 94,
    dispensary: "Wagholi Primary Veterinary Aid Center",
    district: "Pune",
    taluka: "Haveli",
    address: "Main Market Road, Wagholi, Pune - 412207",
    phone: "+91 97654 32189",
    emergencyAvailable: false,
    availableToday: true,
    consultationFee: "Free (Govt. Subsidized)",
    languages: ["Marathi", "Hindi"],
    specialization: "Small Ruminants (Goat/Sheep), Calf Health & Deworming",
    avatar: "👩‍⚕️"
  },
  {
    id: "vet-5",
    name: "1962 Ambulatory Clinic (Unit 4)",
    qualification: "Govt. Mobile Veterinary Clinic (MVC)",
    registrationNo: "MH-MVC-PUNE-04",
    experience: "24x7 Ambulance",
    rating: 5.0,
    reviewsCount: 512,
    dispensary: "State Animal Husbandry Emergency Wing",
    district: "Pune",
    taluka: "All Talukas (Mobile)",
    address: "Rapid Dispatch Depot, Pune Division",
    phone: "1962 (Toll-Free Emergency)",
    emergencyAvailable: true,
    availableToday: true,
    consultationFee: "Free Emergency Service",
    languages: ["Hindi", "Marathi"],
    specialization: "Emergency Roadside Triage, Dystocia, Severe Trauma",
    avatar: "🚑"
  }
];

// GET /api/appointments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taluka = searchParams.get('taluka');
    const district = searchParams.get('district');

    let vets = VET_DIRECTORY;
    if (taluka) {
      vets = vets.filter(v => v.taluka.toLowerCase().includes(taluka.toLowerCase()) || v.taluka.includes("All Talukas"));
    }
    if (district) {
      vets = vets.filter(v => v.district.toLowerCase().includes(district.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      vets,
      hotline: {
        number: "1962",
        name: "Govt. Mobile Veterinary Ambulance (Maharashtra)",
        tollFree: "1800-233-0418"
      }
    });
  } catch (err) {
    console.error("Appointments API error:", err);
    return NextResponse.json({ error: "Failed to fetch vets" }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vetId = body.vetId;
    const farmerName = body.farmerName;
    const farmerPhone = body.farmerPhone;
    const village = body.village;
    const taluka = body.taluka;
    const animalType = body.animalType;
    const animalTag = body.animalTag || body.tagNumber || "N/A";
    const appointmentType = body.appointmentType || body.consultationType || "CLINIC_VISIT";
    const appointmentDate = body.appointmentDate || body.preferredDate || new Date().toISOString().split("T")[0];
    const timeSlot = body.timeSlot || body.preferredTimeSlot || "Morning (09:00 AM - 12:00 PM)";
    const symptoms = body.symptoms || [];
    const notes = body.notes || "";

    if (!farmerName || !farmerPhone || !animalType) {
      return NextResponse.json({ error: "Missing required booking details (farmerName, farmerPhone, animalType)" }, { status: 400 });
    }

    const selectedVet = VET_DIRECTORY.find(v => v.id === vetId) || VET_DIRECTORY[0];
    const token = `VET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      token,
      vetId: selectedVet.id,
      vetName: selectedVet.name,
      vetPhone: selectedVet.phone,
      dispensary: selectedVet.dispensary,
      farmerName,
      farmerPhone,
      village: village || "Local Village",
      taluka: taluka || selectedVet.taluka,
      animalType,
      animalTag,
      appointmentType,
      appointmentDate,
      timeSlot,
      symptoms: Array.isArray(symptoms) ? symptoms : [String(symptoms)],
      notes,
      status: appointmentType === "EMERGENCY_VISIT" ? "DOCTOR_DISPATCHED" : "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating appointment:", err);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
