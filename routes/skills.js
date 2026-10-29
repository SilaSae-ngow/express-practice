const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/db-skills", async (req, res) => {
  const search = req.query.search || "";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT * FROM skills
      WHERE name ILIKE $1 OR category ILIKE $1
      ORDER BY id
      LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset],
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM skills
      WHERE name ILIKE $1 OR category ILIKE $1`,
      [`%${search}%`],
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

router.put("/db-skills/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body;

  if (!Number.isInteger(id) || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "กรุณาตรวจสอบ id และชื่อทักษะ" });
  }

  try {
    const result = await pool.query(
      "UPDATE skills SET name = $1, category = $2 WHERE id = $3 RETURNING *",
      [name.trim(), category.trim(), id],
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

router.delete("/db-skills/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ messsage: "id ไม่ถูกต้อง" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM skills WHERE id = $1 RETURNING *",
      [id],
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

module.exports = router;
