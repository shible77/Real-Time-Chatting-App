import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import fs from "fs";  
import path from "path";
import { env } from "../config/env";


if (!env.DB_URL) {
  throw new Error("DB credentials error");
}
const connection = mysql.createConnection({
  uri: env.DB_URL,
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, './ca.pem')),
  },
});

export const db = drizzle(connection);