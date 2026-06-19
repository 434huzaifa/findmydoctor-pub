import "reflect-metadata";
import bcrypt from "bcryptjs";
import { getDataSource } from "./data-source";
import { Specialty } from "./entities/Specialty";
import { Doctor } from "./entities/Doctor";
import { User } from "./entities/User";
import { Appointment } from "./entities/Appointment";

export async function ensureDoctorSeed() {
  const ds = await getDataSource();
  const specRepo = ds.getRepository(Specialty);
  const doctorRepo = ds.getRepository(Doctor);
  const userRepo = ds.getRepository(User);
  const appointmentRepo = ds.getRepository(Appointment);

  const [specCount, doctorCount, userCount, appointmentCount] = await Promise.all([
    specRepo.count(),
    doctorRepo.count(),
    userRepo.count(),
    appointmentRepo.count(),
  ]);
  if (
    specCount >= 5
    && doctorCount >= 5
    && userCount >= 5
    && appointmentCount >= 5
  ) {
    return;
  }

  // Use DELETE instead of TRUNCATE so FK checks don't fail on referenced tables.
  await appointmentRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();
  await doctorRepo.createQueryBuilder().delete().execute();
  await specRepo.createQueryBuilder().delete().execute();

  const specialties = await specRepo.save([
    specRepo.create({ name: "Cardiology", icon: "💗" }),
    specRepo.create({ name: "Neurology", icon: "🧠" }),
    specRepo.create({ name: "Dermatology", icon: "🩺" }),
    specRepo.create({ name: "Orthopedics", icon: "🦴" }),
    specRepo.create({ name: "Pediatrics", icon: "👶" }),
  ]);

  const doctors = await doctorRepo.save([
    doctorRepo.create({
      name: "Dr. Rahman",
      specialtyId: specialties[0].id,
      hospital: "Dhaka Medical",
      city: "Dhaka",
      exp: 12,
      fee: 800,
      advanceFee: 200,
      totalSeats: 20,
      usedSeats: 2,
      rating: 4.8,
      degrees: "MBBS, MD",
      chamberAddress: "Dhanmondi, Dhaka",
      chamberOpenTime: "09:00",
      chamberCloseTime: "14:00",
    }),
    doctorRepo.create({
      name: "Dr. Khatun",
      specialtyId: specialties[1].id,
      hospital: "Square Hospital",
      city: "Dhaka",
      exp: 8,
      fee: 1000,
      advanceFee: 0,
      totalSeats: 15,
      usedSeats: 1,
      rating: 4.6,
      degrees: "MBBS, FCPS",
      chamberAddress: "Panthapath, Dhaka",
      chamberOpenTime: "10:00",
      chamberCloseTime: "15:00",
    }),
    doctorRepo.create({
      name: "Dr. Sultana",
      specialtyId: specialties[2].id,
      hospital: "Popular Diagnostic",
      city: "Chattogram",
      exp: 10,
      fee: 900,
      advanceFee: 300,
      totalSeats: 18,
      usedSeats: 3,
      rating: 4.7,
      degrees: "MBBS, DDV",
      chamberAddress: "GEC Circle, Chattogram",
      chamberOpenTime: "11:00",
      chamberCloseTime: "16:00",
    }),
    doctorRepo.create({
      name: "Dr. Karim",
      specialtyId: specialties[3].id,
      hospital: "United Hospital",
      city: "Dhaka",
      exp: 14,
      fee: 1200,
      advanceFee: 400,
      totalSeats: 22,
      usedSeats: 2,
      rating: 4.9,
      degrees: "MBBS, MS",
      chamberAddress: "Gulshan, Dhaka",
      chamberOpenTime: "08:30",
      chamberCloseTime: "13:30",
    }),
    doctorRepo.create({
      name: "Dr. Nabila",
      specialtyId: specialties[4].id,
      hospital: "Labaid Hospital",
      city: "Sylhet",
      exp: 7,
      fee: 700,
      advanceFee: 0,
      totalSeats: 16,
      usedSeats: 1,
      rating: 4.5,
      degrees: "MBBS, DCH",
      chamberAddress: "Zindabazar, Sylhet",
      chamberOpenTime: "09:30",
      chamberCloseTime: "13:00",
    }),
  ]);

  const hash = await bcrypt.hash("admin1234", 10);
  const users = await userRepo.save([
    userRepo.create({
      email: "admin@fmd.local",
      password: hash,
      role: "admin",
      doctorId: null,
    }),
    userRepo.create({
      email: "doctor1@fmd.local",
      password: hash,
      role: "doctor",
      doctorId: doctors[0].id,
    }),
    userRepo.create({
      email: "doctor2@fmd.local",
      password: hash,
      role: "doctor",
      doctorId: doctors[1].id,
    }),
    userRepo.create({
      email: "doctor3@fmd.local",
      password: hash,
      role: "doctor",
      doctorId: doctors[2].id,
    }),
    userRepo.create({
      email: "doctor4@fmd.local",
      password: hash,
      role: "doctor",
      doctorId: doctors[3].id,
    }),
  ]);

  await appointmentRepo.save([
    appointmentRepo.create({
      userId: null,
      doctorId: doctors[0].id,
      patientName: "Ahsan Ali",
      patientPhone: "01710000001",
      appointmentDate: "2026-05-07",
      slot: "09:00 AM - 10:00 AM",
      fee: doctors[0].fee,
      status: "confirmed",
      paymentMethod: "online",
      paymentChoice: "advance",
      paymentStatus: "partial",
      paidAmount: doctors[0].advanceFee,
      amountDue: doctors[0].fee - doctors[0].advanceFee,
      paidByUserId: users[1].id,
      paidAt: new Date(),
    }),
    appointmentRepo.create({
      userId: null,
      doctorId: doctors[1].id,
      patientName: "Mina Akter",
      patientPhone: "01710000002",
      appointmentDate: "2026-05-08",
      slot: "10:00 AM - 11:00 AM",
      fee: doctors[1].fee,
      status: "confirmed",
      paymentMethod: "online",
      paymentChoice: "full",
      paymentStatus: "paid",
      paidAmount: doctors[1].fee,
      amountDue: 0,
      paidByUserId: users[2].id,
      paidAt: new Date(),
    }),
    appointmentRepo.create({
      userId: null,
      doctorId: doctors[2].id,
      patientName: "Sadia Noor",
      patientPhone: "01710000003",
      appointmentDate: "2026-05-09",
      slot: "11:00 AM - 12:00 PM",
      fee: doctors[2].fee,
      status: "confirmed",
      paymentMethod: "cash",
      paymentChoice: "full",
      paymentStatus: "unpaid",
      paidAmount: null,
      amountDue: doctors[2].fee,
      paidByUserId: null,
      paidAt: null,
    }),
    appointmentRepo.create({
      userId: null,
      doctorId: doctors[3].id,
      patientName: "Rakib Hasan",
      patientPhone: "01710000004",
      appointmentDate: "2026-05-10",
      slot: "08:30 AM - 09:30 AM",
      fee: doctors[3].fee,
      status: "confirmed",
      paymentMethod: "online",
      paymentChoice: "advance",
      paymentStatus: "partial",
      paidAmount: doctors[3].advanceFee,
      amountDue: doctors[3].fee - doctors[3].advanceFee,
      paidByUserId: users[4].id,
      paidAt: new Date(),
    }),
    appointmentRepo.create({
      userId: null,
      doctorId: doctors[4].id,
      patientName: "Jannat Islam",
      patientPhone: "01710000005",
      appointmentDate: "2026-05-11",
      slot: "09:30 AM - 10:30 AM",
      fee: doctors[4].fee,
      status: "confirmed",
      paymentMethod: "online",
      paymentChoice: "full",
      paymentStatus: "paid",
      paidAmount: doctors[4].fee,
      amountDue: 0,
      paidByUserId: users[1].id,
      paidAt: new Date(),
    }),
  ]);

  console.log("Seed complete with 5 rows per table");
}

ensureDoctorSeed().catch(console.error).finally(() => process.exit(0));