import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFeatures1704067200000 implements MigrationInterface {
  name = "AddNewFeatures1704067200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Phase 0: Create ALL base tables if they don't exist ────────────

    // Specialties
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "specialties" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar UNIQUE NOT NULL,
        "icon" varchar DEFAULT '',
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // Doctors
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctors" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar NOT NULL,
        "specialtyId" int NOT NULL REFERENCES "specialties"("id") ON DELETE RESTRICT,
        "hospital" varchar NOT NULL,
        "city" varchar NOT NULL,
        "exp" int DEFAULT 0,
        "fee" int DEFAULT 0,
        "advanceFee" int DEFAULT 0,
        "totalSeats" int DEFAULT 0,
        "usedSeats" int DEFAULT 0,
        "rating" decimal(2,1) DEFAULT 4.5,
        "degrees" varchar DEFAULT '',
        "chamberAddress" varchar NULL,
        "rrule" varchar NULL,
        "nextAppointment" timestamptz NULL,
        "chamberOpenTime" varchar NULL,
        "chamberCloseTime" varchar NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" varchar UNIQUE NOT NULL,
        "password" varchar NOT NULL,
        "role" varchar DEFAULT 'doctor',
        "doctorId" int UNIQUE NULL REFERENCES "doctors"("id") ON DELETE SET NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // Appointments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" SERIAL PRIMARY KEY,
        "userId" int NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "doctorId" int NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
        "patientName" varchar NOT NULL,
        "patientPhone" varchar NOT NULL,
        "appointmentDate" date NOT NULL,
        "slot" varchar NOT NULL,
        "fee" int NOT NULL,
        "status" varchar DEFAULT 'confirmed',
        "paymentMethod" varchar DEFAULT 'online',
        "paymentChoice" varchar DEFAULT 'full',
        "paymentStatus" varchar DEFAULT 'paid',
        "paidAmount" int NULL,
        "amountDue" int DEFAULT 0,
        "paidByUserId" int NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "paidAt" timestamptz NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // Medicine
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medicine" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "description" text NULL,
        "company" varchar(255) NULL,
        "class" varchar(100) NULL,
        "price" decimal(10,2) DEFAULT 0,
        "stock" int DEFAULT 0,
        "imageUrl" varchar(500) NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // Medicine Order (enum type first)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE medicine_order_status AS ENUM ('pending', 'confirmed', 'processing', 'delivered', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medicine_order" (
        "id" SERIAL PRIMARY KEY,
        "medicineId" int NOT NULL REFERENCES "medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity" int DEFAULT 1 NOT NULL,
        "guestName" varchar(255) NULL,
        "guestPhone" varchar(20) NOT NULL,
        "address" varchar(500) NOT NULL,
        "status" medicine_order_status DEFAULT 'pending' NOT NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // ─── Phase 1.1: Add roomNumber to doctors ───────────────────────────

    await queryRunner.query(`
      ALTER TABLE "doctors"
      ADD COLUMN IF NOT EXISTS "roomNumber" varchar NULL
    `);

    // ─── Phase 5.1: Add video consultation fields to doctors ────────────

    await queryRunner.query(`
      ALTER TABLE "doctors"
      ADD COLUMN IF NOT EXISTS "isOnlineForVideo" boolean DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "doctors"
      ADD COLUMN IF NOT EXISTS "currentVideoLink" varchar NULL
    `);

    // ─── Phase 3: Ambulances ────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ambulances" (
        "id" SERIAL PRIMARY KEY,
        "vehicleNumber" varchar(50) NOT NULL,
        "driverName" varchar(255) NOT NULL,
        "driverPhone" varchar(20) NOT NULL,
        "baseLocation" varchar(255) NOT NULL,
        "isAvailable" boolean DEFAULT true,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE dispatch_status AS ENUM ('dispatched', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ambulance_dispatches" (
        "id" SERIAL PRIMARY KEY,
        "ambulanceId" int NOT NULL REFERENCES "ambulances"("id") ON DELETE CASCADE,
        "callerName" varchar(255) NOT NULL,
        "callerPhone" varchar(20) NOT NULL,
        "pickupLocation" varchar(500) NOT NULL,
        "status" dispatch_status DEFAULT 'dispatched',
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // ─── Phase 4: Home Visit Requests ───────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "home_visit_requests" (
        "id" SERIAL PRIMARY KEY,
        "patientName" varchar(255) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "address" varchar(500) NOT NULL,
        "situationDescription" text NULL,
        "isPaid" boolean DEFAULT false,
        "amount" decimal(10,2) DEFAULT 100,
        "paidAt" timestamptz NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    // ─── Phase 5: Virtual Consultations ─────────────────────────────────

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE consultation_status AS ENUM ('waiting', 'active', 'done');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "virtual_consultations" (
        "id" SERIAL PRIMARY KEY,
        "doctorId" int NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
        "patientName" varchar(255) NOT NULL,
        "patientPhone" varchar(20) NOT NULL,
        "status" consultation_status DEFAULT 'waiting',
        "prescriptionText" text NULL,
        "videoLink" varchar(500) NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new tables
    await queryRunner.query(`DROP TABLE IF EXISTS "virtual_consultations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "home_visit_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ambulance_dispatches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ambulances"`);

    // Drop new enum types
    await queryRunner.query(`DROP TYPE IF EXISTS consultation_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS dispatch_status`);

    // Drop new columns from doctors
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "roomNumber"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "isOnlineForVideo"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN IF EXISTS "currentVideoLink"`);

    // Drop base tables in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "medicine_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medicine"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "specialties"`);

    await queryRunner.query(`DROP TYPE IF EXISTS medicine_order_status`);
  }
}
