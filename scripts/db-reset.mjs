import "dotenv/config";
import { spawnSync } from "node:child_process";

const {
    DB_HOST = "localhost",
    DB_PORT = "5432",
    DB_USER = "postgres",
    DB_NAME,
    DB_PASSWORD,
} = process.env;

if (!DB_NAME || !DB_PASSWORD) {
    console.error("DB_NAME / DB_PASSWORD tidak ditemukan di .env");
    process.exit(1);
}

const files = ["reset", "schema", "seed"].flatMap((f) => ["-f", `database/${f}.sql`]);

const result = spawnSync(
    "psql",
    ["-v", "ON_ERROR_STOP=1", "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER, "-d", DB_NAME, ...files],
    { stdio: "inherit", env: { ...process.env, PGPASSWORD: DB_PASSWORD } }
);

process.exit(result.status ?? 1);