import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrescriptionTxt1781988453213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ADD COLUMN IF NOT EXISTS — safe whether column exists or not
    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD COLUMN IF NOT EXISTS "prescriptionText" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointments"
      DROP COLUMN IF EXISTS "prescriptionText"
    `);
  }
}
