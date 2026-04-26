"use client";

import { useState } from "react";

type Status = "Open" | "Seated" | "Dirty" | "Ready";

type Table = {
  id: string;
  seats: number;
  x: number;
  y: number;
  w: number;
  h: number;
  status: Status;
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
  x,
  y,
  w,
  h,
  status: "Open",
});

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([
    T("P1", 4, 40, 24, 52, 56),
    T("P2", 4, 115, 24, 52, 56),
    T("P3", 4, 280, 24, 52, 56),
    T("P4", 4, 355, 24, 52, 56),
    T("P5", 4, 515, 24, 52, 56),
    T("P6", 4, 590, 24, 52, 56),
    T("P7", 4, 720, 24, 52, 56),
    T("P8", 6, 790, 24, 52, 56),

    T("19", 5, 35, 135, 56, 105),
    T("20", 4, 175, 135, 78, 42),
    T("21", 4, 260, 135, 78, 42),

    T("22", 4, 360, 125, 45, 82),
    T("23", 4, 415, 125, 45, 82),
    T("24", 4, 470, 125, 45, 82),

    T("26", 4, 610, 135, 78, 42),
    T("27", 4, 690, 135, 78, 42),
    T("28", 4, 770, 135, 70, 42),
    T("29", 4, 845, 135, 70, 42),

    T("18", 5, 45, 290, 78, 42),
    T("17", 4, 130, 290, 78, 42),
    T("16", 4, 215, 290, 78, 42),

    T("15", 4, 345, 255, 78, 42),
    T("14", 4, 430, 255, 78, 42),
    T("13", 4, 515, 255, 78, 42),

    T("9", 4, 345, 330, 78, 42),
    T("10", 4, 430, 330, 78, 42),
    T("11", 4, 515, 330, 78, 42),

    T("12", 7, 600, 250, 58, 125),

    T("32", 4, 650, 235, 48, 90),
    T("33", 4, 650, 340, 48, 90),

    T("31", 5, 700, 300, 90, 48),
    T("30", 5, 785, 300, 90, 48),

    T("34", 6, 650, 455, 48, 90),
    T("35", 6, 735, 455, 48, 90),
    T("36", 6, 820, 455, 48, 90),

    T("38", 7, 900, 225, 52, 105),
    T("37", 5, 900, 410, 52, 90),

    T("7", 4, 370, 435, 48, 82),
    T("6", 4, 465, 435, 48, 82),

    T("3", 2, 340, 540, 55, 38),
    T("4", 2, 430, 540, 55, 38),
    T("5", 2, 520, 540, 55, 38),

    T("2", 4, 135, 565, 78, 42),
    T("1", 4, 135, 640, 70, 42),

    T("San Miguel 1", 12, 910, 240, 140, 80),
    T("San Miguel 2", 12, 910, 350, 140, 80),
  ]);

  function nextStatus(status: Status): Status {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function color(status: Status) {
    if (status === "Open") return "#d8f5df";
    if (status === "Seated") return "#f8caca";
    if (status === "Dirty") return "#e5e7eb";
    return "#bfdbfe";
  }

  return (
    <main style={{ padding: 8, fontFamily: "Arial" }}>
      <div
        style={{
          position: "relative",
          width: 1100,
          height: 850,
          background: "#fbfaf5",
          border: "4px solid #111827",
          overflow: "hidden",
        }}
      >
        {/* TOP WALL */}
        <div style={{ position: "absolute", top: 100, left: 0, width: 820, height: 5, background: "#111827" }} />

        {/* RIGHT PANEL FIXED */}
        <div
          style={{
            position: "absolute",
            left: 820,
            top: 0,
            width: 280,
            height: 550,
            borderLeft: "5px solid #111827",
            background: "#fffdf7",
          }}
        >
          <div style={{ padding: 10, fontWeight: "bold" }}>
            PODIUM:
            <br />
            SEATER 1:
            <br />
            SEATER 2:
            <br />
            SEATER 3:
          </div>

          <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 6 }}>
            San Miguel
          </div>

          <div style={{ padding: 10 }}>
            GUEST NAME:
            <br />
            ARRIVAL TIME:
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
            width: 300,
            height: 80,
            borderRadius: 20,
            border: "4px solid #64748b",
            background: "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          BAR
        </div>

        {/* TABLES */}
        {tables.map((t, i) => (
          <button
            key={t.id}
            onClick={() =>
              setTables((prev) =>
                prev.map((x, idx) =>
                  idx === i ? { ...x, status: nextStatus(x.status) } : x
                )
              )
            }
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.h,
              background: color(t.status),
              border: "2px solid #334155",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: "bold",
              color: "#006ee6",
            }}
          >
            {t.id}
            <br />
            {t.seats}
            <br />
            {t.status}
          </button>
        ))}
      </div>
    </main>
  );
}
