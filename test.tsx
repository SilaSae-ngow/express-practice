// type Skill = {
//   id: number;
//   name: string;
//   category: string | null;
// };

// function formatSkill(skill: Skill): string {
//     const category = skill.category ?? "ไม่ระบุหมวดหมู่";
//     return `${skill.name} (${category})`
// }

// type RequestStatus = "idle" | "loading" | "success" | "error";

// let requestStatus: RequestStatus = "loading";
// requestStatus = "success"; // ใช้ได้

// interface Skill {
//   id: number;
//   name: string;
//   category: string | null;
// }

// async function loadSkills(): Promise<Skill[]> {
//   return [{ id: 1, name: "React", category: "Frontend" }];
// }

// console.log(loadSkills());

// try {
//     throw new Error("โหลดข้อมูลไม่สำเร็จ")
// } catch(error: unknown) {
//     if (error instanceof Error) {
//         console.error(error.message);
//     } else {
//         console.log("เกิดข้อผิดพลาดที่ไม่ทราบชนิด");
//     }
// }
