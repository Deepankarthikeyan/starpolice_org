/**
 * Update (or create) the single superadmin account. Safe to run on dev Atlas only.
 *
 *   SUPERADMIN_EMAIL=you@example.com SUPERADMIN_PASSWORD=secret npm run set-superadmin
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!uri) {
    throw new Error("MONGODB_URI is required.");
  }
  if (!email || !password) {
    throw new Error("Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD.");
  }

  await connectDB(uri);

  const hash = await bcrypt.hash(password, 10);
  const previousEmail = process.env.SUPERADMIN_PREVIOUS_EMAIL?.trim().toLowerCase();

  let user = await User.findOne({ role: "superadmin" });
  if (!user && previousEmail) {
    user = await User.findOne({ email: previousEmail });
  }
  if (!user) {
    user = await User.findOne({ email: "superadmin@starpolice.academy" });
  }

  const conflict = await User.findOne({ email, role: { $ne: "superadmin" } });
  if (conflict) {
    throw new Error(`Another account already uses ${email} (role: ${conflict.role}).`);
  }

  if (!user) {
    await User.create({
      name: "Super Admin",
      email,
      password: hash,
      role: "superadmin",
      isActive: true,
    });
    console.log(`Created superadmin: ${email}`);
  } else {
    const oldEmail = user.email;
    user.email = email;
    user.password = hash;
    user.role = "superadmin";
    user.isActive = true;
    if (!user.name?.trim()) user.name = "Super Admin";
    await user.save();
    console.log(`Updated superadmin: ${oldEmail} → ${email}`);
  }

  await mongoose.disconnect().catch(() => undefined);
  process.exit(0);
}

main().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
