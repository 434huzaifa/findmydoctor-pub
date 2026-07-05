import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmbulanceBookingWindowAndRate1785000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ambulances
            ADD COLUMN IF NOT EXISTS "hourlyRate" NUMERIC NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "publicDescription" TEXT NULL,
            ADD COLUMN IF NOT EXISTS "detailedDescription" TEXT NULL;
        `);

    await queryRunner.query(`
            ALTER TABLE ambulance_dispatches
            ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMPTZ NULL,
            ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMPTZ NULL,
            ADD COLUMN IF NOT EXISTS "totalCost" NUMERIC NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ambulance_dispatches
            DROP COLUMN IF EXISTS "startTime",
            DROP COLUMN IF EXISTS "endTime",
            DROP COLUMN IF EXISTS "totalCost";
        `);

    await queryRunner.query(`
            ALTER TABLE ambulances
            DROP COLUMN IF EXISTS "hourlyRate",
            DROP COLUMN IF EXISTS "publicDescription",
            DROP COLUMN IF EXISTS "detailedDescription";
        `);
  }
}
