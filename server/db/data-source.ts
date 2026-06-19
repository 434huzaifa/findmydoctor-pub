import "reflect-metadata";
import { loadEnvConfig } from "@next/env";
import path from "path";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Doctor } from "./entities/Doctor";
import { Specialty } from "./entities/Specialty";
import { Appointment } from "./entities/Appointment";
import { Medicine } from "./entities/Medicine";
import { MedicineOrder } from "./entities/MedicineOrder";

// Ensure standalone scripts (tsx/typeorm CLI) load the same env files as Next.js.
loadEnvConfig(process.cwd());

// Singleton guard for Next.js hot-reload in dev
const globalForTypeORM = global as unknown as {
  dataSource: DataSource | undefined;
  dataSourceMode: "runtime" | "cli" | undefined;
};

let dataSourceInitPromise: Promise<DataSource> | null = null;

const isTypeormCliProcess = process.argv.some(
  (arg) => arg.includes("typeorm/cli") || arg.includes("typeorm\\cli"),
);

const dataSourceMode: "runtime" | "cli" = isTypeormCliProcess
  ? "cli"
  : "runtime";

function hasCurrentEntityMetadata(ds: DataSource) {
  if (!ds.isInitialized) return true;

  return (
    ds.hasMetadata(User) &&
    ds.hasMetadata(Specialty) &&
    ds.hasMetadata(Doctor) &&
    ds.hasMetadata(Appointment) &&
    ds.hasMetadata(Medicine) &&
    ds.hasMetadata(MedicineOrder)
  );
}

function createAppDataSource() {
  return new DataSource({
    type: "postgres",
    url: process.env.PG_URL,
    synchronize: false,
    logging: false,
    entities: [User, Specialty, Doctor, Appointment, Medicine, MedicineOrder],
    migrations: isTypeormCliProcess
      ? [
          path.join(
            process.cwd(),
            "server",
            "db",
            "migrations",
            "**",
            "*.{ts,js}",
          ),
        ]
      : [],
  });
}

export let AppDataSource: DataSource =
  !globalForTypeORM.dataSource ||
  globalForTypeORM.dataSourceMode !== dataSourceMode
    ? createAppDataSource()
    : globalForTypeORM.dataSource;

if (process.env.NODE_ENV !== "production") {
  globalForTypeORM.dataSource = AppDataSource;
  globalForTypeORM.dataSourceMode = dataSourceMode;
}

export async function getDataSource(): Promise<DataSource> {
  if (
    AppDataSource.isInitialized &&
    !hasCurrentEntityMetadata(AppDataSource) &&
    process.env.NODE_ENV !== "production"
  ) {
    await AppDataSource.destroy().catch(() => undefined);
    dataSourceInitPromise = null;
    AppDataSource = createAppDataSource();
    globalForTypeORM.dataSource = AppDataSource;
    globalForTypeORM.dataSourceMode = dataSourceMode;
  }

  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!dataSourceInitPromise) {
    dataSourceInitPromise = AppDataSource.initialize()
      .then(() => AppDataSource)
      .catch((error) => {
        dataSourceInitPromise = null;
        throw error;
      });
  }

  const ds = await dataSourceInitPromise;

  if (
    ds.isInitialized &&
    !hasCurrentEntityMetadata(ds) &&
    process.env.NODE_ENV !== "production"
  ) {
    await ds.destroy().catch(() => undefined);
    dataSourceInitPromise = null;
    AppDataSource = createAppDataSource();
    globalForTypeORM.dataSource = AppDataSource;
    globalForTypeORM.dataSourceMode = dataSourceMode;
    dataSourceInitPromise = AppDataSource.initialize()
      .then(() => AppDataSource)
      .catch((error) => {
        dataSourceInitPromise = null;
        throw error;
      });

    return dataSourceInitPromise;
  }

  return ds;
}

export { User, Doctor, Specialty, Appointment, Medicine, MedicineOrder };
