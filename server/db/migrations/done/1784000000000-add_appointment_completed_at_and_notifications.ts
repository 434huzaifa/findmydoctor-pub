import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmentCompletedAtAndNotifications1784000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE appointments
            ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMPTZ NULL;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id              SERIAL          NOT NULL,
                channel         VARCHAR(20)     NOT NULL DEFAULT 'inapp',
                "targetType"    VARCHAR(20)     NOT NULL,
                "targetId"      INT             NOT NULL,
                "recipientPhone" VARCHAR(20)    NOT NULL,
                message         TEXT            NOT NULL,
                status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
                "scheduledFor"  TIMESTAMPTZ     NOT NULL,
                "sentAt"        TIMESTAMPTZ     NULL,
                "createdAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                "updatedAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id)
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_recipientPhone" ON notifications ("recipientPhone");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS notifications;
        `);

    await queryRunner.query(`
            ALTER TABLE appointments
            DROP COLUMN IF EXISTS "completedAt";
        `);
  }
}
