import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [health, setHealth] = useState(null); // null | "connected" | "disconnected"
  const [loading, setLoading] = useState(false);

  // Kiểm tra health
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setHealth(d.db === "connected" ? "connected" : "disconnected"))
      .catch(() => setHealth("disconnected"));
  }, []);

  // Lấy danh sách items
  useEffect(() => {
    fetch(`${API}/items`)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  // Thêm item
  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      setName("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Items</h1>
          <span style={{ ...styles.badge, background: health === "connected" ? "#22c55e" : "#ef4444" }}>
            DB {health ?? "checking..."}
          </span>
        </div>

        <form onSubmit={handleAdd} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Tên item..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? "..." : "Thêm"}
          </button>
        </form>

        <ul style={styles.list}>
          {items.length === 0 && <li style={styles.empty}>Chưa có item nào</li>}
          {items.map((item) => (
            <li key={item.id} style={styles.item}>
              <span style={styles.itemName}>{item.name}</span>
              <span style={styles.itemId}>#{item.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "monospace",
    padding: "24px",
    marginRight: "auto",
    boxSizing: "border-box",
  },
  card: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    color: "#f1f5f9",
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
  },
  badge: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "999px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  form: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
  },
  input: {
    flex: 1,
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f1f5f9",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
  },
  btn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  empty: {
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    padding: "24px 0",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0f172a",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  itemName: { color: "#f1f5f9", fontSize: "14px" },
  itemId: { color: "#475569", fontSize: "12px" },
};