const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth")
const router = express.Router();

router.get("/db-skills", requireAuth, async (req, res) => {
  const search = req.query.search || "";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT * FROM skills
      WHERE user_id = $1 AND (name ILIKE $2 OR category ILIKE $2)
      ORDER BY id
      LIMIT $3 OFFSET $4`,
      [req.user.id ,`%${search}%`, limit, offset],
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM skills
      WHERE user_id = $1 AND (name ILIKE $2 OR category ILIKE $2)`,
      [req.user.id, `%${search}%`],
    );

    res.json({
      items: result.rows,
      total: Number(countResult.rows[0].count),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "อ่านข้อมูลไม่สำเร็จ" });
  }
});

router.put("/db-skills/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body;

  if (!Number.isInteger(id) || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "กรุณาตรวจสอบ id และชื่อทักษะ" });
  }

  try {
    const result = await pool.query(
      "UPDATE skills SET name = $1, category = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [name.trim(), category.trim(), id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบทักษะ" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "แก้ไขทักษะไม่สำเร็จ" });
  }
});

router.delete("/db-skills/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ messsage: "id ไม่ถูกต้อง" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบทักษะนี้" });
    }

    res.json({ deleted: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "ลบทักษะไม่สำเร็จ" });
  }
});

router.post("/db-skills", requireAuth, async (req, res) => {
  const { name, category } = req.body;

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof category !== "string" ||
    category.trim() === ""
  ) {
    return res.status(400).json({ message: "กรุณาระบุชื่อทักษะ" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO skills (name, category, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), category.trim(), req.user.id],
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "เพิ่มทักษะไม่สำเร็จ" });
  }
});


module.exports = router;
