require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT * FROM skills");
    console.log(result.rows);
  } catch (error) {
    console.log("เชื่อมต่อไม่สำเร็จ:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();