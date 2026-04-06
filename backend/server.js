import "dotenv/config";
import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";

const app = express();
const port = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
    "https://truongvd05.github.io",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        } else {
            callback(new Error("Not allow by cors"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "demo",
    waitForConnections: true,
    connectionLimit: 10,
});

// Tạo bảng nếu chưa có
async function initDB() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log("DB initialized");
}

// GET / - kiểm tra server
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
});

// GET /health - kiểm tra kết nối DB
app.get("/health", async (req, res) => {
    try {
        await pool.execute("SELECT 1");
        res.json({ status: "ok", db: "connected" });
    } catch (err) {
        res.status(500).json({
            status: "error",
            db: "disconnected",
            error: err.message,
        });
    }
});

// GET /items - lấy danh sách items
app.get("/items", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM items ORDER BY created_at DESC",
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /items - thêm item mới
app.post("/items", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    try {
        const [result] = await pool.execute(
            "INSERT INTO items (name) VALUES (?)",
            [name],
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Khởi động
async function startServer(retries = 10, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            await initDB();
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });
            return;
        } catch (err) {
            console.error(
                `Failed to init DB (attempt ${i + 1}/${retries}):`,
                err.message,
            );
            if (i < retries - 1) {
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }
    process.exit(1);
}

startServer();
