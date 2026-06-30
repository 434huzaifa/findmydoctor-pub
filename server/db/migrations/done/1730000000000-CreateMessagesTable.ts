import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMessagesTable1730000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" SERIAL PRIMARY KEY,
                "senderName" varchar(255) NOT NULL,
                "senderPhone" varchar(20) NOT NULL,
                "message" text NOT NULL,
                "status" varchar DEFAULT 'pending',
                "createdAt" timestamptz NOT NULL DEFAULT now(),
                "updatedAt" timestamptz NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "messages"`);
    }
}
