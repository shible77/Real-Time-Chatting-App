import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";  
import path from "path";
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB credentials error");
}
const connection = mysql.createConnection({
  uri: process.env.DB_URL,
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, './ca.pem')),
  },
});

export const db = drizzle(connection);