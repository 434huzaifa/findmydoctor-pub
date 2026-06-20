import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrescriptionToAppointments1704067300000
  implements MigrationInterface
{
  name = "AddPrescriptionToAppointments1704067300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "prescriptionText" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "prescriptionText"
    `);
  }
}
