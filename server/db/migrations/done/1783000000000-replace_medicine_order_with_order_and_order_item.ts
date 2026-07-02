import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceMedicineOrderWithOrderAndOrderItem1783000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS medicine_order;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "order" (
                id          SERIAL          NOT NULL,
                "guestName" VARCHAR(255)        NULL,
                "guestPhone" VARCHAR(20)    NOT NULL,
                address     VARCHAR(500)    NOT NULL,
                status      VARCHAR(20)     NOT NULL DEFAULT 'pending',
                total       DECIMAL(10, 2)  NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id)
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_order_guestPhone" ON "order" ("guestPhone");
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS order_item (
                id          SERIAL                      NOT NULL,
                "orderId"   INT                         NOT NULL,
                "medicineId" INT                        NOT NULL,
                quantity    INT                         NOT NULL DEFAULT 1,
                "unitPrice" DECIMAL(10, 2)               NOT NULL,
                "createdAt" TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

                PRIMARY KEY (id),

                CONSTRAINT "FK_order_item_order"
                    FOREIGN KEY ("orderId")
                    REFERENCES "order" (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,

                CONSTRAINT "FK_order_item_medicine"
                    FOREIGN KEY ("medicineId")
                    REFERENCES medicine (id)
                    ON DELETE RESTRICT
                    ON UPDATE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS order_item;
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS "order";
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
}
