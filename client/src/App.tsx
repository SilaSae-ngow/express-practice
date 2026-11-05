import { useState, useEffect } from "react";
import type {
  Skill,
  SkillResponse,
  CreateSkillInput,
  LoginResponse,
  AuthCredentials,
} from "./skillTypes";
import type { SubmitEvent } from "react";
import "./App.css";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router";

function App() {
  const [totalSkills, setTotalSkills] = useState(0);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const searchText = searchParams.get("search") ?? "";
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = 3;

  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadSkills() {
      setLoading(true);

      try {
        const response = await fetch(
          "/api/db-skills?search=" +
            encodeURIComponent(searchText) +
            "&page=" +
            page +
            "&limit=2",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("โหลดทักษะไม่สำเร็จ");
        }

        const data: SkillResponse = await response.json();
        setSkills(data.items);
        setTotalSkills(data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, [searchText, page, token]);

  async function handleLogin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const credentials: AuthCredentials = { email, password };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        alert(data.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPassword("");
    } catch (e) {
      console.error(e);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองอีกครั้ง");
    }
  }

  async function handleRegister(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const credentials: AuthCredentials = { email, password };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }

      alert("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      setPassword("");
      setIsRegistering(false);
    } catch (e) {
      console.error(e);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองอีกครั้ง");
    }
  }

  async function handleAddSkill(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const newSkillData: CreateSkillInput = {
      name: newSkill,
      category: newCategory,
    };

    try {
      const response = await fetch("/api/db-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSkillData),
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data: SkillResponse = await listResponse.json();

      setSkills(data.items);
      setTotalSkills(data.total);
      setNewSkill("");
      setNewCategory("");
    } catch (e) {
      console.error(e);
      alert("เพิ่มทักษะไม่สำเร็จ");
    }
  }

  async function handleDeleteSkill(id: number) {
    try {
      const response = await fetch("/api/db-skills/" + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("ลบทักษะไม่สำเร็จ");
      }

      setSkills((currentSkills) =>
        currentSkills.filter((skill) => skill.id !== id),
      );

      setTotalSkills((currentTotal) => Math.max(currentTotal - 1, 0));
    } catch (e) {
      console.error(e);
      alert("ลบทักษะไม่สำเร็จ หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

  async function handleEditSkill(skill: Skill) {
    const newName = prompt("ชื่อทักษะ", skill.name);
    if (newName === null || newName.trim() === "") return;

    const newCategory = prompt("หมวดหมู่", skill.category ?? "");
    if (newCategory === null || newCategory.trim() === "") return;

    try {
      const response = await fetch("/api/db-skills/" + skill.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: newName,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        alert("แก้ไขทักษะไม่สำเร็จ");
        return;
      }

      const updatedSkills: Skill = await response.json();
      setSkills((currentSkills) =>
        currentSkills.map((item) =>
          item.id === updatedSkills.id ? updatedSkills : item,
        ),
      );
    } catch (e) {
      console.error(e);
      alert("แก้ไขทักษะไม่สำเร็จ หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setSkills([]);
    setTotalSkills(0);
  }

  {
    loading && <p>กำลังโหลด...</p>;
  }
  {
    !token && <p>กรุณาเข้าสู่ระบบเพื่อดูทักษะ</p>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            <Link to="/about">เกี่ยวกับเรา</Link>
            <div>
              {!token && (
                <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                  <input
                    type="email"
                    placeholder="อีเมล์"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit">
                    {isRegistering ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegistering((current) => !current)}
                  >
                    {isRegistering
                      ? "มีบัญชีแล้ว? เข้าสู่ระบบ"
                      : "ยังไม่มีบัญชี? สมัครสมาชิก"}
                  </button>
                </form>
              )}
              {token && (
                <button type="button" onClick={handleLogout}>
                  ออกจากระบบ
                </button>
              )}
            </div>
            {token && (
              <>
                <h1>ทักษะของฉัน</h1>
                <input
                  placeholder="ค้นหาทักษะ"
                  value={searchText}
                  onChange={(e) =>
                    setSearchParams(
                      {
                        search: e.target.value,
                        page: "1",
                        limit: String(limit),
                      },
                      { replace: true },
                    )
                  }
                />
                <button
                  style={{
                    margin: 10,
                    padding: "0 10px 0 10px",
                    color: "black",
                  }}
                  disabled={page === 1}
                  onClick={() =>
                    setSearchParams({
                      search: searchText,
                      page: String(page - 1),
                      limit: String(limit),
                    })
                  }
                >
                  ก่อนหน้า
                </button>
                <span> หน้า {page} </span>
                <button
                  style={{
                    margin: 10,
                    padding: "0 10px 0 10px",
                    color: "black",
                  }}
                  disabled={page * 2 >= totalSkills}
                  onClick={() =>
                    setSearchParams({
                      search: searchText,
                      page: String(page + 1),
                      limit: String(limit),
                    })
                  }
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
                        style={{
                          margin: 10,
                          padding: "0 10px 0 10px",
                          color: "black",
                        }}
                      >
                        ลบ
                      </button>
                      <button
                        style={{
                          margin: 10,
                          padding: "0 10px 0 10px",
                          color: "black",
                        }}
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
                    style={{
                      margin: 10,
                      padding: "0 10px 0 10px",
                      color: "black",
                    }}
                    type="submit"
                  >
                    เพิ่มทักษะ
                  </button>
                </form>
              </>
            )}
          </main>
        }
      />
      <Route
        path="/about"
        element={
          <main>
            <h1>เกี่ยวกับเรา</h1>
            <Link to="/">กลับหน้าหลัก</Link>
          </main>
        }
      />
      <Route path="/skills/:id" element={<SkillDetail />} />
      <Route
        path="*"
        element={
          <main>
            <h1>ไม่พบหน้านี้</h1>
            <Link to="/">กลับหน้าหลัก</Link>
          </main>
        }
      />
    </Routes>
  );
}

function SkillDetail() {
  const { id } = useParams();

  return (
    <main>
      <h1>ทักษะ ID: {id}</h1>
      <Link to="/">กลับหน้าหลัก</Link>
    </main>
  );
}

export default App;
