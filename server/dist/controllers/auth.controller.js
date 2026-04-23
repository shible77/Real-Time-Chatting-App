"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setup_1 = require("../db/setup");
const users_1 = require("../db/schema/users");
const drizzle_orm_1 = require("drizzle-orm");
const env_1 = require("../config/env");
const validate_1 = require("../utils/validate");
const auth_schema_1 = require("../validators/auth.schema");
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, password } = (0, validate_1.validate)(auth_schema_1.signupSchema, req.body);
            const hash = yield argon2_1.default.hash(password);
            yield setup_1.db.insert(users_1.users).values({
                name,
                email,
                passwordHash: hash,
            });
            res.status(201).json({ status: "success", message: "USER_CREATED" });
        }
        catch (err) {
            throw err;
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = (0, validate_1.validate)(auth_schema_1.loginSchema, req.body);
            const user = yield setup_1.db
                .select()
                .from(users_1.users)
                .where((0, drizzle_orm_1.eq)(users_1.users.email, email))
                .limit(1);
            if (!user.length) {
                return res.status(401).json({ message: "INVALID_CREDENTIALS" });
            }
            const valid = yield argon2_1.default.verify(user[0].passwordHash, password);
            if (!valid) {
                return res.status(401).json({ message: "INVALID_CREDENTIALS" });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user[0].id }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
            res.status(200).json({ status: "success", token: token, userName: user[0].name });
        }
        catch (err) {
            throw err;
        }
    });
}
