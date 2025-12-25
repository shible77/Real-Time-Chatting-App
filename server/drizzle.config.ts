import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default {
  dialect: "mysql",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dbCredentials: {
    url : process.env.DB_URL!,
  },
} satisfies Config;