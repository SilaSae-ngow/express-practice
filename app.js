require("dotenv").config();

const express = require("express");
const app = express();
const pool = require("./db");
const skillsRouter = require("./routes/skills");
const authRouter = require("./routes/auth")

app.use(express.static("public"));
app.use(express.json());
app.use("/api", skillsRouter);
app.use("/api/auth", authRouter)

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

app.listen(3000, () => {
  console.log("เซิร์ฟเวอร์พร้อมที่ http://localhost:3000");
});
