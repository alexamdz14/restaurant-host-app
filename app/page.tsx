"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Table = {
  id: string;
  seats: number;
  status: TableStatus;
  x: number;
  y: number;
  w: number;
  h: number;
};

const T = (
  id: string,
  seats: number,
  x: number,
  y: number,
  w: number,
  h: number
): Table => ({
  id,
  seats,
  status: "Open",
  x,
  y,
  w,
  h,
});

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([
    T("P1", 4, 35, 24, 54, 54),
    T("P2", 4, 115, 24, 54, 54),
    T("P3", 4, 295, 24, 54, 54),
    T("P4", 4, 375, 24, 54, 54),
    T("P5", 4, 560, 24, 54, 54),
    T("P6", 4, 640, 24, 54, 54),
    T("P7", 4, 760, 24, 54, 54),
    T("P8", 6, 840, 24, 54, 54),

    T("19", 5, 35, 125, 56, 110),
    T("20", 4, 165, 125, 76, 42),
    T("21", 4, 250, 125, 76, 42),

    T("18", 5, 35, 285, 76, 42),
    T("17", 4, 120, 285, 76, 42),
    T("16", 4, 205, 285, 76, 42),

    T("15", 4, 330, 260, 78, 42),
    T("14", 4, 420, 260, 78, 42),
    T("13", 4, 510, 260, 78, 42),

    T("9", 4, 330, 335, 78, 42),
    T("10", 4, 420, 335, 78, 42),
    T("11", 4, 510, 335, 78, 42),

    T("7", 4, 360, 440, 48, 80),
    T("6", 4, 450, 440, 48, 80),

    T("3", 2, 330, 555, 55, 40),
    T("4", 2, 420, 555, 55, 40),
    T("5", 2, 510, 555, 55, 40),

    T("26", 4, 610, 125, 78, 42),
    T("27", 4, 700, 125, 78, 42),
    T("28", 4, 790, 125, 62, 42),
    T("29", 4, 855, 125, 62, 42),

    T("32", 4, 690, 245, 48, 85),
    T("33", 4, 690, 355, 48, 85),

    T("31", 5, 790, 300, 86, 48),
    T("30", 5, 875, 300, 76, 48),

    T("34", 6, 690, 470, 48, 85),
    T("35", 6, 775, 470, 48, 85),
    T("36", 6, 860, 470, 48, 85),

    T("38", 7, 965, 230, 50, 100),
    T("37", 5, 965, 410, 50, 85),

    T("Casa 1", 4, 885, 780, 50, 80),
    T("Casa 2", 4, 965, 780, 50, 80),
    T("Casa 7", 4, 760, 880, 78, 42),
    T("Casa 9", 4, 845, 880, 78, 42),
    T("Casa 10", 4, 930, 880, 78, 42),
  ]);

  function nextStatus(status: TableStatus): TableStatus {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function statusColor(status: TableStatus) {
    if (status === "Open") return "#dcfce7";
    if (status === "Seated") return "#fecaca";
    if (status === "Dirty") return "#e5e7eb";
    return "#dbeafe";
  }

  function updateTable(index: number) {
    setTables(
      tables.map((t, i) =>
        i === index ? { ...t, status: nextStatus(t.status) } : t
      )
    );
  }

  return (
    <main style={{ padding: 10 }}>
      <h2>Host Map</h2>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1280,
            height: 900,
            background: "#f8f5ef",
            border: "4px solid black",
            transform: "scale(0.8)",
            transformOrigin: "top left",
          }}
        >
          {/* RIGHT PANEL (NO TO-DO) */}
          <div
            style={{
              position: "absolute",
              left: 1040,
              top: 0,
              width: 240,
              height: 420,
              background: "#fff",
              borderLeft: "4px solid black",
              borderBottom: "4px solid black",
            }}
          >
            <div style={{ padding: 8, fontWeight: "bold" }}>
              PODIUM
              <br />
              SEATER 1
              <br />
              SEATER 2
              <br />
              SEATER 3
            </div>

            <div
              style={{
                background: "#111",
                color: "white",
                textAlign: "center",
                padding: 6,
                fontWeight: "bold",
              }}
            >
              San Miguel
            </div>

            <div style={{ padding: 8 }}>
              GUEST NAME:
              <br />
              <br />
              ARRIVAL TIME:
              <br />
              <br />
              GUESTS:
            </div>
          </div>

          {/* BAR */}
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 600,
              width: 320,
              height: 80,
              background: "#dbeafe",
              border: "4px solid #64748b",
              borderRadius: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            BAR
          </div>

          {/* BUFFET */}
          <div
            style={{
              position: "absolute",
              left: 780,
              top: 550,
              width: 220,
              height: 50,
              border: "2px solid black",
              background: "white",
              textAlign: "center",
              paddingTop: 10,
            }}
          >
            Buffet
          </div>

          {/* TABLES */}
          {tables.map((table, index) => (
            <button
              key={table.id}
              onClick={() => updateTable(index)}
              style={{
                position: "absolute",
                left: table.x,
                top: table.y,
                width: table.w,
                height: table.h,
                background: statusColor(table.status),
                border: "2px solid #334155",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {table.id}
              <br />
              {table.seats}
              <br />
              {table.status}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
