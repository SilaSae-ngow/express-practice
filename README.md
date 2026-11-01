# Skills Manager

เว็บแอปสำหรับจัดการรายการทักษะ

## Features

- เพิ่ม แก้ไข และลบทักษะ
- ค้นหาทักษะตามชื่อหรือหมวดหมู่
- แบ่งหน้ารายการทักษะ

## Tech Stack

- React และ Vite
- Node.js และ Express
- PostgreSQL

## Run locally

Requirements: Node.js and PostgreSQL

1. Install backend dependencies from the project root:

   ```bash
   npm install
2. Install frontend dependencies:
   npm install --prefix client
3. Create a .env file in the project root and configure your PostgreSQL connection:
   PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD.
   Do not commit the .env file.
4. Start the backend from the project root:
   node app.js
5. In another terminal, start the frontend:
   cd client
   npm run dev