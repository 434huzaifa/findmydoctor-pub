import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMedicineTable1781898246607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS medicine (
                id          SERIAL          NOT NULL,
                name        VARCHAR(255)    NOT NULL,
                description TEXT                NULL,
                company     VARCHAR(255)        NULL,
                class       VARCHAR(100)        NULL,
                price       DECIMAL(10, 2)  NOT NULL DEFAULT 0,
                "imageUrl"  VARCHAR(500)        NULL,
                "createdAt" TIMESTAMP       NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP       NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id)
            );
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS medicine_order (
                id          SERIAL                      NOT NULL,
                "medicineId" INT                        NOT NULL,
                quantity    INT                         NOT NULL DEFAULT 1,
                "guestPhone" VARCHAR(20)                NOT NULL,
                status      VARCHAR(20)                 NOT NULL DEFAULT 'pending',
                address     VARCHAR(500)                NULL,
                "createdAt" TIMESTAMP                   NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP                   NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id),

                CONSTRAINT "FK_medicine_order_medicine"
                    FOREIGN KEY ("medicineId")
                    REFERENCES medicine (id)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS medicine_order;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS medicine;
        `);
  }
}
