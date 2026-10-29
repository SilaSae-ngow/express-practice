const express = require("express");
const app = express();
const pool = require("./db");
const skillsRouter = require("./routes/skills");

app.use(express.static("public"));
app.use(express.json());
app.use("/api", skillsRouter);

const skills = ["Node.js", "JavaScript", "HTML"];


app.get("/api/skill/:id", (req, res) => {
  const id = Number(req.params.id);
  const skill = skills[id];

  if (skill === undefined) {
    return res.status(404).json({ message: "ไม่พบทักษะนี้" });
  }

  res.json({ id, skill });
});

app.get("/api/search", (req, res) => {
  const keyword = req.query.keyword || "";

  const results = skills.filter((skill) =>
    skill.toLocaleLowerCase().includes(keyword.toLowerCase()),
  );

  res.json(results);
});

app.delete("/api/skills/:id", (req, res) => {
  const id = Number(req.params.id);

  if (skills[id] === undefined) {
    return res.status(404).json({ message: "ไม่พบทักษะนี้" });
  }

  const deletedSkill = skills.splice(id, 1);
  res.json({ deleted: deletedSkill[0], skills });
});

app.put("/api/skills/:id", (req, res) => {
  const id = Number(req.params.id);

  if (skills[id] === undefined) {
    return res.status(404).json({ message: "ไม่พบทักษะนี้" });
  }

  skills[id] = req.body.name;
  res.json({ updated: skills[id] });
});

app.post("/api/db-skills", async (req, res) => {
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
      "INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING *",
      [name.trim(), category.trim()],
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "เพิ่มทักษะไม่สำเร็จ" });
  }
});

app.listen(3000, () => {
  console.log("เซิร์ฟเวอร์พร้อมที่ http://localhost:3000");
});
