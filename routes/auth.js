const express = require("express");
const argon2 = require("argon2");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  try {
    const passwordHash = await argon2.hash(password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, created_at`,
      [email.trim().toLowerCase(), passwordHash],
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ message: "อีเมล์นี้ถูกใช้แล้ว" });
    }

    console.error(e);
    res.status(500).json({ message: "สมัครสมาชิกไม่สำเร็จ" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    res.status(401).json({ message: "กรุณากรอกอีเมล์และรหัสผ่าน" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email.trim().toLowerCase()],
    );

    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ message: "อีเมล์หรือรหัสไม่ถูกต้อง" });
    }

    const passwordIsCorrect = await argon2.verify(user.password_hash, password);

    if (!passwordIsCorrect) {
      res.status(401).json({ message: "อีเมล์หรือรหัสไม่ถูกต้อง" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "เข้าสู่ระบบไม่สำเร็จ" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.id });
});

module.exports = router;
