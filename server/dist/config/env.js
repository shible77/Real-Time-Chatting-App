"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
exports.env = {
    DB_URL: process.env.DB_URL,
    PORT: Number(process.env.PORT || 5000),
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
};
