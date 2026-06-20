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
import { Ambulance } from "./entities/Ambulance";
import { AmbulanceDispatch } from "./entities/AmbulanceDispatch";
import { HomeVisitRequest } from "./entities/HomeVisitRequest";
import { VirtualConsultation } from "./entities/VirtualConsultation";

// Ensure standalone scripts (tsx/typeorm CLI) load the same env files as Next.js.
loadEnvConfig(process.cwd());

// Singleton guard for Next.js hot-reload in dev
const globalForTypeORM = global as unknown as {
  dataSource: DataSource | undefined;
  dataSourceMode: "runtime" | "cli" | undefined;
};

let dataSourceInitPromise: Promise<DataSource> | null = null;

const isTypeormCliProcess = process.argv.some(
  (arg) => arg.includes("typeorm/cli") || arg.includes("typeorm\\cli")
);

const dataSourceMode: "runtime" | "cli" = isTypeormCliProcess
  ? "cli"
  : "runtime";

const allEntities = [
  User,
  Specialty,
  Doctor,
  Appointment,
  Medicine,
  MedicineOrder,
  Ambulance,
  AmbulanceDispatch,
  HomeVisitRequest,
  VirtualConsultation,
];

function hasCurrentEntityMetadata(ds: DataSource) {
  if (!ds.isInitialized) return true;
  return allEntities.every((entity) => ds.hasMetadata(entity));
}

function createAppDataSource() {
  return new DataSource({
    type: "postgres",
    url: process.env.PG_URL,
    synchronize: false,
    logging: false,
    entities: allEntities,
    migrations: isTypeormCliProcess
      ? [
          path.join(
            process.cwd(),
            "server",
            "db",
            "migrations",
            "**",
            "*.{ts,js}"
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

export {
  User,
  Doctor,
  Specialty,
  Appointment,
  Medicine,
  MedicineOrder,
  Ambulance,
  AmbulanceDispatch,
  HomeVisitRequest,
  VirtualConsultation,
};
