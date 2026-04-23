export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#4b5563",
              }}
            >
              Enrique&apos;s
            </div>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 36,
                color: "#0f172a",
              }}
            >
              Host Stand Starter
            </h1>
            <p style={{ marginTop: 8, color: "#64748b" }}>
              Your Vercel deployment is working.
            </p>
          </div>

          <div
            style={{
              background: "#0f172a",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Live
          </div>
        </div>
      </div>
    </main>
  );
}
