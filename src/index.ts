import { Elysia } from "elysia";
import mysql from "mysql2/promise";
import { rateLimit } from "elysia-rate-limit"; // 1. Import plugin

let connect: mysql.Connection | null = null;

/*const initMySQL = async () => {
    connect = await mysql.createConnection({
        host: "db",
        user: "root",
        password: process.env.DB_ROOT_PASSWORD,
        database: process.env.DB_NAME,
    });
};*/

const initMySQL = async () => {
    connect = await mysql.createConnection(process.env.DATABASE_URL as string);
};

// retry เผื่อ db ยังไม่พร้อม
let connected = false;
for (let i = 0; i < 5; i++) {
    try {
        await initMySQL();
        connected = true;
        break;
    } catch {
        console.log(`MySQL not ready, retrying... (${i + 1}/5)`);
        await new Promise((r) => setTimeout(r, 3000));
    }
}
if (!connected) {
    console.error("Cannot connect to MySQL after 5 retries. Exiting.");
    process.exit(1);
}

const app = new Elysia()

    .use(
        rateLimit({
            duration: 60000, // กำหนดกรอบเวลา 60 วินาที
            max: 10, // ให้ยิงได้สูงสุดแค่ 10 ครั้งต่อ 1 IP
            errorResponse: "ใจเย็นวัยรุ่น ยิง API เร็วไปแล้ว!", // ข้อความด่ากลับ
        }),
    )
    // path = GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
    .get("/users", async () => {
        const [results] = await connect!.query("SELECT * FROM users");
        return results;
    })
    //listen server
    .get("/hello", () => "Hello Elysia")
    .listen(process.env.APP_PORT || 8000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
