import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { db } from "../db/setup";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { env } from "../config/env";
import { validate } from "../utils/validate";
import { loginSchema, signupSchema } from "../validators/auth.schema";

export async function signup(req: Request, res: Response) {
  const { name, email, password } = validate(signupSchema, req.body);

  const hash = await argon2.hash(password);

  await db.insert(users).values({
    name,
    email,
    passwordHash: hash,
  });

  res.status(201).json({ message: "USER_CREATED" });
}

export async function login(req: Request, res: Response) {
  const { email, password } = validate(loginSchema, req.body);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user.length) {
    return res.status(401).json({ message: "INVALID_CREDENTIALS" });
  }

  const valid = await argon2.verify(user[0].passwordHash, password);
  if (!valid) {
    return res.status(401).json({ message: "INVALID_CREDENTIALS" });
  }

  const token = jwt.sign(
    { userId: user[0].id},
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
}
