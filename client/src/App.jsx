import { useState, useEffect } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

function App() {
  const [page, setPage] = useState(1);
  const [totalSkills, setTotalSkills] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const response = await fetch(
          "/api/db-skills?search=" +
            encodeURIComponent(searchText) +
            "&page=" +
            page +
            "&limit=2",
        );

        if (!response.ok) {
          throw new Error("โหลดทักษะไม่สำเร็จ");
        }

        const data = await response.json();
        setSkills(data.items);
        setTotalSkills(data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, [searchText, page]);

  if (loading) {
    return <p>กำลังโหลด....</p>;
  }

  async function handleAddSkill(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/db-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkill, category: newCategory }),
      });

      if (!response.ok) {
        throw new Error("เพิ่มทักษะไม่สำเร็จ");
      }

      const listResponse = await fetch(
        "/api/db-skills?search=" +
          encodeURIComponent(searchText) +
          "&page=" +
          page +
          "&limit=2",
      );
      const data = await listResponse.json();

      setSkills(data.items);
      setTotalSkills(data.total);
      setNewSkill("");
      setNewCategory("");
    } catch (e) {
      console.error(e);
      alert("เพิ่มทักษะไม่สำเร็จ");
    }
  }

  async function handleDeleteSkill(id) {
    const response = await fetch("/api/db-skills/" + id, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("ลบทักษะไม่สำเร็จ");
      return;
    }

    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== id),
    );

    setTotalSkills((currentTotal) => Math.max(currentTotal - 1, 0));
  }

  async function handleEditSkill(skill) {
    const newName = prompt("ชื่อทักษะ", skill.name);
    if (newName === null || newName.trim() === "") return;

    const newCategory = prompt("หมวดหมู่", skill.category ?? "");
    if (newCategory === null || newCategory.trim() === "") return;

    const response = await fetch("/api/db-skills/" + skill.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        category: newCategory,
      }),
    });

    if (!response.ok) {
      alert("แก้ไขทักษะไม่สำเร็จ");
      return;
    }

    const updatedSkills = await response.json();
    setSkills((currentSkills) =>
      currentSkills.map((item) =>
        item.id === updatedSkills.id ? updatedSkills : item,
      ),
    );
  }

  const skillstest = [
    { id: 1, name: "Node.js", category: "Backend" },
    { id: 2, name: "TypeScript", category: "Language" },
    { id: 3, name: "React", category: "Frontend" },
  ];

  return (
    <main>
      <h1>ทักษะของฉัน</h1>
      <input
        placeholder="ค้นหาทักษะ"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button
        style={{ margin: 10, padding: "0 10px 0 10px", color: "black" }}
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        ก่อนหน้า
      </button>
      <span> หน้า {page} </span>
      <button
        style={{ margin: 10, padding: "0 10px 0 10px", color: "black" }}
        disabled={page * 2 >= totalSkills}
        onClick={() => setPage(page + 1)}
      >
        ถัดไป
      </button>
      {skills.length === 0 && <p>ไม่พบทักษะ</p>}
      <ul>
        {skills.map((skill) => (
          <li key={skill.id} style={{ margin: 10 }}>
            <strong>{skill.name}</strong> {"-"}
            {skill.category || "ยังไม่ได้ระบุหมวดหมู่"}
            <button
              onClick={() => handleDeleteSkill(skill.id)}
              style={{ margin: 10, padding: "0 10px 0 10px", color: "black" }}
            >
              ลบ
            </button>
            <button
              style={{ margin: 10, padding: "0 10px 0 10px", color: "black" }}
              onClick={() => handleEditSkill(skill)}
            >
              แก้ไข
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddSkill}>
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="ชื่อทักษะ"
          required
        />
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="หมวดหมู่"
          required
        />
        <button
          style={{ margin: 10, padding: "0 10px 0 10px", color: "black" }}
          type="submit"
        >
          เพิ่มทักษะ
        </button>
      </form>
    </main>
  );
}

export default App;
