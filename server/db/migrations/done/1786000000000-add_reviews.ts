import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviews1786000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id              SERIAL          NOT NULL,
                "appointmentId" INT             NOT NULL,
                "doctorId"      INT             NOT NULL,
                "patientName"   VARCHAR(255)    NOT NULL,
                "patientPhone"  VARCHAR(20)     NOT NULL,
                rating          INT             NOT NULL,
                comment         TEXT            NULL,
                "createdAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                "updatedAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id),
                CONSTRAINT "UQ_reviews_appointmentId" UNIQUE ("appointmentId"),
                CONSTRAINT "FK_reviews_appointmentId" FOREIGN KEY ("appointmentId")
                    REFERENCES appointments (id) ON DELETE CASCADE,
                CONSTRAINT "FK_reviews_doctorId" FOREIGN KEY ("doctorId")
                    REFERENCES doctors (id) ON DELETE CASCADE
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_reviews_doctorId" ON reviews ("doctorId");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS reviews;
        `);
  }
}
