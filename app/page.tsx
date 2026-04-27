"use client";
import { useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";
const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

function color(s: Status) {
  if (s === "Open") return "#d8f5df";
  if (s === "Seated") return "#bfdbfe";
  if (s === "Boxed") return "#fde68a";
  return "#e5e7eb";
}

export default function Page() {
  const [tables, setTables] = useState([
    { id: "P1", x: 90, y: 70 },
    { id: "P2", x: 170, y: 70 },
    { id: "P3", x: 350, y: 70 },
    { id: "P4", x: 430, y: 70 },
    { id: "P5", x: 600, y: 70 },
    { id: "P6", x: 680, y: 70 },
    { id: "P7", x: 830, y: 70 },
    { id: "P8", x: 910, y: 70 },

    { id: "15", x: 380, y: 300 },
    { id: "14", x: 450, y: 300 },
    { id: "13", x: 520, y: 300 },

    { id: "9", x: 380, y: 380 },
    { id: "10", x: 450, y: 380 },
    { id: "11", x: 520, y: 380 },

    { id: "31", x: 780, y: 350 },
    { id: "30", x: 860, y: 350 },

    { id: "San Miguel 1", x: 1150, y: 320, w: 150, h: 60 },
    { id: "San Miguel 2", x: 1150, y: 420, w: 150, h: 60 },
  ].map(t => ({ ...t, status: "Open" as Status })));

  function click(i: number) {
    setTables(prev =>
      prev.map((t, idx) =>
        idx === i
          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % cycle.length] }
          : t
      )
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Host Map</h1>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1400,
            height: 1000,
          }}
        >

          {/* 🔥 YOUR REAL MAP IMAGE */}
          <img
            src="/floorplan.png"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          {/* 🔵 INTERACTIVE TABLES ON TOP */}
          {tables.map((t, i) => (
            <div
              key={i}
              onClick={() => click(i)}
              style={{
                position: "absolute",
                left: t.x,
                top: t.y,
                width: t.w || 60,
                height: t.h || 50,
                background: color(t.status),
                border: t.status === "Boxed" ? "3px solid orange" : "2px solid #1e3a8a",
                borderRadius: 10,
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <b>{t.id}</b>
              <div>{t.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        Tap: Seated → Boxed 📦 → Dirty → Open
      </div>
    </div>
  );
}
