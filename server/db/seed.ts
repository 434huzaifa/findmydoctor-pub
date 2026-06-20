import "reflect-metadata";
import bcrypt from "bcryptjs";
import {
  getDataSource,
  Medicine,
  Doctor,
  Specialty,
  Ambulance,
  User,
  Appointment,
  VirtualConsultation,
  HomeVisitRequest,
} from "./data-source";
import { ConsultationStatus } from "./entities/VirtualConsultation";

// ─── Medicines ──────────────────────────────────────────────────────────────

const medicines = [
  {
    name: "Paracetamol 500mg",
    description:
      "Common pain reliever and fever reducer. Used for headaches, muscle aches, and reducing fever.",
    company: "Square Pharma",
    class: "Analgesic",
    price: 2.5,
    stock: 500,
  },
  {
    name: "Amoxicillin 250mg",
    description:
      "Antibiotic used to treat bacterial infections including chest infections, dental abscesses, and UTIs.",
    company: "Beximco",
    class: "Antibiotic",
    price: 8.99,
    stock: 200,
  },
  {
    name: "Omeprazole 20mg",
    description:
      "Proton pump inhibitor that reduces stomach acid. Used for GERD and ulcers.",
    company: "Incepta",
    class: "PPI",
    price: 12.5,
    stock: 300,
  },
  {
    name: "Metformin 500mg",
    description:
      "First-line medication for type 2 diabetes. Helps control blood sugar levels.",
    company: "ACI Ltd",
    class: "Antidiabetic",
    price: 5.0,
    stock: 400,
  },
  {
    name: "Cetirizine 10mg",
    description:
      "Antihistamine for allergies. Relieves hay fever, hives, and allergic rhinitis.",
    company: "Renata",
    class: "Antihistamine",
    price: 3.5,
    stock: 600,
  },
  {
    name: "Losartan 50mg",
    description:
      "ARB medication for high blood pressure. Protects kidneys in diabetic patients.",
    company: "Square Pharma",
    class: "Antihypertensive",
    price: 15.0,
    stock: 250,
  },
  {
    name: "Atorvastatin 20mg",
    description:
      "Statin medication to lower cholesterol and reduce cardiovascular disease risk.",
    company: "Beximco",
    class: "Statin",
    price: 18.0,
    stock: 350,
  },
  {
    name: "Salbutamol Inhaler",
    description:
      "Bronchodilator for asthma and COPD. Provides quick relief from breathing difficulties.",
    company: "GlaxoSmithKline",
    class: "Bronchodilator",
    price: 45.0,
    stock: 100,
  },
  {
    name: "Azithromycin 500mg",
    description:
      "Macrolide antibiotic for respiratory, skin, and ear infections. 3-day treatment course.",
    company: "Incepta",
    class: "Antibiotic",
    price: 25.0,
    stock: 150,
  },
  {
    name: "Pantoprazole 40mg",
    description:
      "Proton pump inhibitor for acid reflux, GERD, and stomach ulcer prevention.",
    company: "ACI Ltd",
    class: "PPI",
    price: 14.0,
    stock: 280,
  },
];

// ─── Specialties ────────────────────────────────────────────────────────────

const specialties = [
  { name: "Cardiology", icon: "❤️" },
  { name: "Neurology", icon: "🧠" },
  { name: "Orthopedics", icon: "🦴" },
  { name: "Pediatrics", icon: "👶" },
  { name: "Dermatology", icon: "🧴" },
  { name: "General Medicine", icon: "🩺" },
  { name: "Gynecology", icon: "🤰" },
  { name: "Ophthalmology", icon: "👁️" },
];

// ─── Doctors ────────────────────────────────────────────────────────────────

const doctors = [
  {
    name: "Dr. Aisha Rahman",
    hospital: "Dhaka Medical College",
    city: "Dhaka",
    exp: 15,
    fee: 1500,
    advanceFee: 500,
    totalSeats: 20,
    usedSeats: 5,
    rating: 4.8,
    degrees: "MBBS, MD (Cardiology)",
    chamberAddress: "Road 12, Dhanmondi, Dhaka",
    roomNumber: "301-A",
    specialtyName: "Cardiology",
    email: "doctor1@fmd.local",
  },
  {
    name: "Dr. Karim Hossain",
    hospital: "BIRDEM Hospital",
    city: "Dhaka",
    exp: 12,
    fee: 1200,
    advanceFee: 400,
    totalSeats: 15,
    usedSeats: 3,
    rating: 4.6,
    degrees: "MBBS, FCPS (Medicine)",
    chamberAddress: "Shahbag, Dhaka",
    roomNumber: "205",
    specialtyName: "General Medicine",
    email: "doctor2@fmd.local",
  },
  {
    name: "Dr. Fatima Begum",
    hospital: "Square Hospital",
    city: "Dhaka",
    exp: 10,
    fee: 2000,
    advanceFee: 700,
    totalSeats: 12,
    usedSeats: 8,
    rating: 4.9,
    degrees: "MBBS, MD (Pediatrics)",
    chamberAddress: "Panthapath, Dhaka",
    roomNumber: "Floor 5, Room 12",
    specialtyName: "Pediatrics",
    email: "doctor3@fmd.local",
  },
  {
    name: "Dr. Rafiq Ahmed",
    hospital: "Chittagong Medical College",
    city: "Chittagong",
    exp: 20,
    fee: 1000,
    advanceFee: 300,
    totalSeats: 25,
    usedSeats: 10,
    rating: 4.7,
    degrees: "MBBS, MS (Orthopedics)",
    chamberAddress: "GEC Circle, Chittagong",
    roomNumber: "Block B, 102",
    specialtyName: "Orthopedics",
    email: "doctor4@fmd.local",
  },
];

// ─── Ambulances ─────────────────────────────────────────────────────────────

const ambulances = [
  {
    vehicleNumber: "DHK-1234",
    driverName: "Abdul Karim",
    driverPhone: "+8801711111111",
    baseLocation: "Dhanmondi, Dhaka",
    isAvailable: true,
  },
  {
    vehicleNumber: "DHK-5678",
    driverName: "Mohammad Ali",
    driverPhone: "+8801722222222",
    baseLocation: "Gulshan, Dhaka",
    isAvailable: true,
  },
  {
    vehicleNumber: "CTG-1001",
    driverName: "Jamal Uddin",
    driverPhone: "+8801833333333",
    baseLocation: "GEC Circle, Chittagong",
    isAvailable: false,
  },
  {
    vehicleNumber: "DHK-9999",
    driverName: "Rahim Mia",
    driverPhone: "+8801944444444",
    baseLocation: "Mirpur, Dhaka",
    isAvailable: true,
  },
];

// ─── Seed Function ──────────────────────────────────────────────────────────

async function seed() {
  const ds = await getDataSource();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("admin1234", 10);

  // ─── Seed Specialties ─────────────────────────────────────────────────────

  const specialtyRepo = ds.getRepository(Specialty);
  let allSpecialties = await specialtyRepo.find();

  if (allSpecialties.length === 0) {
    console.log("Seeding specialties...");
    await specialtyRepo.save(specialties);
    allSpecialties = await specialtyRepo.find();
    console.log(`✅ Seeded ${specialties.length} specialties`);
  } else {
    console.log(
      `⏭️  Specialties already exist (${allSpecialties.length}), skipping`,
    );
  }

  const specialtyMap = new Map(allSpecialties.map((s) => [s.name, s.id]));

  // ─── Seed Doctors ─────────────────────────────────────────────────────────

  const doctorRepo = ds.getRepository(Doctor);
  const userRepo = ds.getRepository(User);

  const allDoctors = await doctorRepo.find();

  if (allDoctors.length === 0) {
    console.log("Seeding doctors...");

    for (const doc of doctors) {
      const { specialtyName, email, ...doctorData } = doc;
      const specialtyId = specialtyMap.get(specialtyName);

      if (specialtyId) {
        const savedDoctor = await doctorRepo.save({
          ...doctorData,
          specialtyId,
        });
        allDoctors.push(savedDoctor);
      }
    }
    console.log(`✅ Seeded ${doctors.length} doctors`);
  } else {
    console.log(`⏭️  Doctors already exist (${allDoctors.length}), skipping`);
  }

  // ─── Seed Admin User ──────────────────────────────────────────────────────

  const existingAdmin = await userRepo.findOne({
    where: { email: "admin@fmd.local" },
  });

  if (!existingAdmin) {
    console.log("Seeding admin user...");
    await userRepo.save({
      email: "admin@fmd.local",
      password: hashedPassword,
      role: "admin",
      doctorId: null,
    });
    console.log(`✅ Seeded admin user (admin@fmd.local / admin1234)`);
  } else {
    console.log(`⏭️  Admin user already exists, skipping`);
  }

  // ─── Seed Doctor Users ────────────────────────────────────────────────────

  const existingDoctorUsers = await userRepo.find({
    where: { role: "doctor" },
  });

  if (existingDoctorUsers.length === 0) {
    console.log("Seeding doctor users...");

    for (let i = 0; i < allDoctors.length; i++) {
      const doctor = allDoctors[i];
      const email = doctors[i]?.email || `doctor${i + 1}@fmd.local`;

      await userRepo.save({
        email,
        password: hashedPassword,
        role: "doctor",
        doctorId: doctor.id,
      });

      console.log(`  → Created user: ${email} linked to ${doctor.name}`);
    }

    console.log(`✅ Seeded ${allDoctors.length} doctor users`);
  } else {
    console.log(
      `⏭️  Doctor users already exist (${existingDoctorUsers.length}), skipping`,
    );
  }

  // ─── Seed Medicines ───────────────────────────────────────────────────────

  const medicineRepo = ds.getRepository(Medicine);
  const existingMedicines = await medicineRepo.count();

  if (existingMedicines === 0) {
    console.log("Seeding medicines...");
    await medicineRepo.save(medicines);
    console.log(`✅ Seeded ${medicines.length} medicines`);
  } else {
    console.log(`⏭️  Medicines already exist (${existingMedicines}), skipping`);
  }

  // ─── Seed Ambulances ──────────────────────────────────────────────────────

  const ambulanceRepo = ds.getRepository(Ambulance);
  const existingAmbulances = await ambulanceRepo.count();

  if (existingAmbulances === 0) {
    console.log("Seeding ambulances...");
    await ambulanceRepo.save(ambulances);
    console.log(`✅ Seeded ${ambulances.length} ambulances`);
  } else {
    console.log(
      `⏭️  Ambulances already exist (${existingAmbulances}), skipping`,
    );
  }

  // ─── Seed Sample Appointments ─────────────────────────────────────────────

  const appointmentRepo = ds.getRepository(Appointment);
  const existingAppointments = await appointmentRepo.count();

  if (existingAppointments === 0 && allDoctors.length > 0) {
    console.log("Seeding sample appointments...");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const sampleAppointments = [
      // Dr. Aisha Rahman's appointments
      {
        doctorId: allDoctors[0]?.id,
        patientName: "Mohammad Hasan",
        patientPhone: "+8801712345678",
        appointmentDate: formatDate(today),
        slot: "10:00 AM - 10:30 AM",
        fee: allDoctors[0]?.fee || 1500,
        status: "confirmed",
        paymentMethod: "online" as const,
        paymentChoice: "full" as const,
        paymentStatus: "paid" as const,
        paidAmount: allDoctors[0]?.fee || 1500,
        amountDue: 0,
      },
      {
        doctorId: allDoctors[0]?.id,
        patientName: "Fatema Khatun",
        patientPhone: "+8801898765432",
        appointmentDate: formatDate(today),
        slot: "11:00 AM - 11:30 AM",
        fee: allDoctors[0]?.fee || 1500,
        status: "confirmed",
        paymentMethod: "cash" as const,
        paymentChoice: "advance" as const,
        paymentStatus: "partial" as const,
        paidAmount: allDoctors[0]?.advanceFee || 500,
        amountDue:
          (allDoctors[0]?.fee || 1500) - (allDoctors[0]?.advanceFee || 500),
      },
      {
        doctorId: allDoctors[0]?.id,
        patientName: "Abdul Karim",
        patientPhone: "+8801555555555",
        appointmentDate: formatDate(tomorrow),
        slot: "09:00 AM - 09:30 AM",
        fee: allDoctors[0]?.fee || 1500,
        status: "confirmed",
        paymentMethod: "online" as const,
        paymentChoice: "full" as const,
        paymentStatus: "paid" as const,
        paidAmount: allDoctors[0]?.fee || 1500,
        amountDue: 0,
      },
      // Dr. Karim Hossain's appointments
      {
        doctorId: allDoctors[1]?.id,
        patientName: "Rahim Uddin",
        patientPhone: "+8801611111111",
        appointmentDate: formatDate(today),
        slot: "02:00 PM - 02:30 PM",
        fee: allDoctors[1]?.fee || 1200,
        status: "confirmed",
        paymentMethod: "cash" as const,
        paymentChoice: "full" as const,
        paymentStatus: "unpaid" as const,
        paidAmount: null,
        amountDue: allDoctors[1]?.fee || 1200,
      },
      {
        doctorId: allDoctors[1]?.id,
        patientName: "Salma Begum",
        patientPhone: "+8801722222222",
        appointmentDate: formatDate(nextWeek),
        slot: "03:00 PM - 03:30 PM",
        fee: allDoctors[1]?.fee || 1200,
        status: "confirmed",
        paymentMethod: "online" as const,
        paymentChoice: "full" as const,
        paymentStatus: "paid" as const,
        paidAmount: allDoctors[1]?.fee || 1200,
        amountDue: 0,
      },
      // Dr. Fatima Begum's appointments (Pediatrics)
      {
        doctorId: allDoctors[2]?.id,
        patientName: "Baby Arif (Parent: Kamal)",
        patientPhone: "+8801833333333",
        appointmentDate: formatDate(today),
        slot: "10:00 AM - 10:30 AM",
        fee: allDoctors[2]?.fee || 2000,
        status: "confirmed",
        paymentMethod: "online" as const,
        paymentChoice: "full" as const,
        paymentStatus: "paid" as const,
        paidAmount: allDoctors[2]?.fee || 2000,
        amountDue: 0,
      },
    ].filter((apt) => apt.doctorId); // Filter out any with undefined doctorId

    for (const apt of sampleAppointments) {
      await appointmentRepo.save(apt);
    }

    console.log(`✅ Seeded ${sampleAppointments.length} sample appointments`);
  } else {
    console.log(
      `⏭️  Appointments already exist (${existingAppointments}), skipping`,
    );
  }

  // ─── Seed Sample Virtual Consultations ────────────────────────────────────

  const consultationRepo = ds.getRepository(VirtualConsultation);
  const existingConsultations = await consultationRepo.count();

  if (existingConsultations === 0 && allDoctors.length > 0) {
    console.log("Seeding sample virtual consultations...");

    // Set first doctor as online for video
    await doctorRepo.update(allDoctors[0].id, { isOnlineForVideo: true });

    const sampleConsultations = [
      {
        doctorId: allDoctors[0]?.id,
        patientName: "Jamil Ahmed",
        patientPhone: "+8801999888777",
        status: ConsultationStatus.WAITING,
        prescriptionText: null,
        videoLink: null,
      },
      {
        doctorId: allDoctors[0]?.id,
        patientName: "Nasreen Akter",
        patientPhone: "+8801666555444",
        status: ConsultationStatus.WAITING,
        prescriptionText: null,
        videoLink: null,
      },
    ].filter((c) => c.doctorId);

    for (const consultation of sampleConsultations) {
      await consultationRepo.save(consultation);
    }

    console.log(
      `✅ Seeded ${sampleConsultations.length} sample virtual consultations`,
    );
    console.log(`✅ Set ${allDoctors[0]?.name} as online for video calls`);
  } else {
    console.log(
      `⏭️  Virtual consultations already exist (${existingConsultations}), skipping`,
    );
  }

  // ─── Seed Sample Home Visit Request ───────────────────────────────────────

  const homeVisitRepo = ds.getRepository(HomeVisitRequest);
  const existingHomeVisits = await homeVisitRepo.count();

  if (existingHomeVisits === 0) {
    console.log("Seeding sample home visit request...");

    await homeVisitRepo.save({
      patientName: "Elderly Patient - Rahim",
      phone: "+8801777666555",
      address: "House 45, Road 8, Dhanmondi, Dhaka",
      situationDescription: "High fever and difficulty breathing for 2 days",
      isPaid: false,
      amount: 100,
    });

    console.log(`✅ Seeded 1 sample home visit request`);
  } else {
    console.log(
      `⏭️  Home visit requests already exist (${existingHomeVisits}), skipping`,
    );
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n" + "═".repeat(50));
  console.log("🎉 SEED COMPLETE!");
  console.log("═".repeat(50));
  console.log("\n📋 Test Credentials:");
  console.log("─".repeat(30));
  console.log("Admin:    admin@fmd.local / admin1234");
  console.log("Doctor 1: doctor1@fmd.local / admin1234");
  console.log("Doctor 2: doctor2@fmd.local / admin1234");
  console.log("Doctor 3: doctor3@fmd.local / admin1234");
  console.log("Doctor 4: doctor4@fmd.local / admin1234");
  console.log("─".repeat(30));
  console.log("\n📊 Data Summary:");
  console.log(`  • Specialties: ${allSpecialties.length}`);
  console.log(`  • Doctors: ${allDoctors.length}`);
  console.log(
    `  • Users: ${allDoctors.length + 1} (${allDoctors.length} doctors + 1 admin)`,
  );
  console.log(`  • Medicines: ${medicines.length}`);
  console.log(`  • Ambulances: ${ambulances.length}`);
  console.log(`  • Sample Appointments: Created`);
  console.log(`  • Sample Consultations: Created`);
  console.log("═".repeat(50) + "\n");

  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
