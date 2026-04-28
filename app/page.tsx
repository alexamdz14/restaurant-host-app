"use client";

import { useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type TableItem = {
  id: string;
  seats: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  status: Status;
};

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const makeTable = (
  id: string,
  seats: string,
  x: number,
  y: number,
  w = 62,
  h = 48
): TableItem => ({
  id,
  seats,
  x,
  y,
  w,
  h,
  status: "Open",
});

function statusColor(status: Status) {
  if (status === "Open") return "#d8f5df";
  if (status === "Seated") return "#bfdbfe";
  if (status === "Boxed") return "#fde68a";
  return "#e5e7eb";
}

export default function Home() {
  const [tables, setTables] = useState<TableItem[]>([
    makeTable("P1", "4", 50, 30, 50, 56),
    makeTable("P2", "4", 130, 30, 50, 56),
    makeTable("P3", "4", 310, 30, 50, 56),
    makeTable("P4", "4", 395, 30, 50, 56),
    makeTable("P5", "4", 560, 30, 50, 56),
    makeTable("P6", "4", 645, 30, 50, 56),
    makeTable("P7", "4", 800, 30, 50, 56),
    makeTable("P8", "6", 880, 30, 50, 56),

    makeTable("19", "5", 35, 145, 55, 105),
    makeTable("20", "4", 165, 140, 80, 42),
    makeTable("21", "4", 255, 140, 80, 42),
    makeTable("22", "4", 375, 130, 45, 82),
    makeTable("23", "4", 430, 130, 45, 82),
    makeTable("24", "4", 485, 130, 45, 82),
    makeTable("26", "4", 625, 140, 80, 42),
    makeTable("27", "4", 710, 140, 80, 42),
    makeTable("28", "4", 795, 140, 75, 42),
    makeTable("29", "4", 875, 140, 75, 42),

    makeTable("18", "5", 45, 300, 80, 42),
    makeTable("17", "4", 135, 300, 80, 42),
    makeTable("16", "4", 225, 300, 80, 42),

    makeTable("15", "4", 345, 270, 80, 42),
    makeTable("14", "4", 435, 270, 80, 42),
    makeTable("13", "4", 525, 270, 80, 42),
    makeTable("9", "4", 345, 350, 80, 42),
    makeTable("10", "4", 435, 350, 80, 42),
    makeTable("11", "4", 525, 350, 80, 42),
    makeTable("12", "7", 620, 260, 58, 125),

    makeTable("32", "4", 725, 245, 50, 90),
    makeTable("33", "4", 725, 355, 50, 90),
    makeTable("31", "5", 820, 325, 90, 48),
    makeTable("30", "5", 915, 325, 90, 48),
    makeTable("38", "7", 1030, 250, 52, 105),
    makeTable("37", "5", 1030, 450, 52, 90),

    makeTable("34", "6", 725, 500, 50, 90),
    makeTable("35", "6", 815, 500, 50, 90),
    makeTable("36", "6", 905, 500, 50, 90),

    makeTable("7", "4", 375, 455, 48, 82),
    makeTable("6", "4", 470, 455, 48, 82),
    makeTable("3", "2", 340, 570, 58, 38),
    makeTable("4", "2", 430, 570, 58, 38),
    makeTable("5", "2", 520, 570, 58, 38),
    makeTable("2", "4", 135, 595, 78, 42),
    makeTable("1", "4", 135, 675, 70, 42),

    makeTable("DL4", "4", 45, 790, 75, 42),
    makeTable("DL3", "4", 45, 870, 75, 42),
    makeTable("DL2", "4", 45, 950, 75, 42),
    makeTable("DL1", "4", 155, 950, 70, 58),

    makeTable("L10", "6", 245, 830, 92, 42),
    makeTable("L9", "2", 245, 900, 58, 42),
    makeTable("L1", "4", 385, 790, 78, 42),
    makeTable("L2", "4", 485, 790, 78, 42),
    makeTable("L3", "4", 585, 790, 78, 42),
    makeTable("L4", "6", 685, 870, 75, 42),
    makeTable("L11", "Couch", 420, 875, 55, 45),
    makeTable("L12", "Couch", 505, 875, 55, 45),
    makeTable("L8", "4", 380, 950, 50, 75),
    makeTable("L7", "4", 465, 950, 50, 75),
    makeTable("L6", "4", 550, 950, 50, 75),
    makeTable("L5", "8", 670, 950, 82, 70),

    makeTable("Casa 8", "4", 840, 800, 55, 82),
    makeTable("Casa 1", "4", 950, 800, 55, 82),
    makeTable("Casa 2", "4", 1050, 800, 55, 82),
    makeTable("Casa 7", "4", 820, 900, 80, 42),
    makeTable("Casa 9", "4", 910, 900, 80, 42),
    makeTable("Casa 10", "4", 1000, 900, 80, 42),
    makeTable("Casa 3", "4", 1090, 900, 55, 42),
    makeTable("Casa 6", "4", 850, 980, 55, 42),
    makeTable("Casa 5", "4", 950, 980, 55, 42),
    makeTable("Casa 4", "4", 1050, 980, 55, 42),

    makeTable("San Miguel 1", "12", 1180, 310, 150, 60),
    makeTable("San Miguel 2", "12", 1180, 430, 150, 60),
  ]);

  function updateTable(index: number) {
    setTables((prev) =>
      prev.map((table, i) =>
        i === index
          ? { ...table, status: cycle[(cycle.indexOf(table.status) + 1) % cycle.length] }
          : table
      )
    );
  }

  const wall = (x: number, y: number, w: number, h: number) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: "#111827",
        zIndex: 1,
      }}
    />
  );

  return (
    <main style={{ padding: 8, fontFamily: "Arial", background: "#f3f4f6" }}>
      <h1 style={{ marginBottom: 8 }}>Host Map</h1>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1400,
            height: 1060,
            background: "#fbfaf5",
            border: "4px solid #111827",
            overflow: "hidden",
          }}
        >
          {wall(0, 105, 1080, 5)}
          {wall(0, 345, 250, 7)}
          {wall(300, 345, 310, 7)}
          {wall(750, 345, 330, 7)}
          {wall(345, 330, 250, 6)}
          {wall(0, 560, 250, 8)}
          {wall(300, 560, 330, 8)}
          {wall(750, 560, 330, 8)}
          {wall(300, 755, 480, 8)}
          {wall(800, 755, 360, 8)}
          {wall(780, 755, 8, 305)}
          {wall(1160, 755, 8, 305)}
          {wall(220, 830, 8, 230)}

          <div
            style={{
              position: "absolute",
              left: 1080,
              top: 0,
              width: 320,
              height: 640,
              borderLeft: "5px solid #111827",
              borderBottom: "5px solid #111827",
              background: "#fffdf7",
              zIndex: 2,
            }}
          >
            <div style={{ height: 110, padding: 12, borderBottom: "5px solid #111827", fontWeight: "bold", fontSize: 18 }}>
              PODIUM:<br />SEATER 1:<br />SEATER 2:<br />SEATER 3:
            </div>

            <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 8, fontSize: 22, fontWeight: "bold" }}>
              San Miguel
            </div>

            <div style={{ padding: 14, fontSize: 17 }}>
              GUEST NAME:<br /><br />
              ARRIVAL TIME:<br /><br />
              GUESTS:<br /><br />
              SERVER:
            </div>
          </div>

          <div style={{ position: "absolute", left: 1180, top: 755, width: 150, height: 280, border: "4px solid #111827", background: "#fffdf7", zIndex: 2 }}>
            <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 8, fontSize: 20, fontWeight: "bold" }}>
              Casa 1884
            </div>
            <div style={{ padding: 10, fontSize: 16 }}>
              GUEST NAME:<br /><br />
              ARRIVAL TIME:<br /><br />
              GUEST COUNT:<br /><br />
              SERVER:
            </div>
          </div>

          <div style={{ position: "absolute", left: 130, top: 375, fontSize: 22, fontStyle: "italic", fontWeight: "bold", zIndex: 2 }}>
            Take-Out
          </div>

          <div style={{ position: "absolute", left: 300, top: 640, width: 330, height: 85, borderRadius: 20, border: "5px solid #64748b", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: "bold", zIndex: 2 }}>
            BAR
          </div>

          <div style={{ position: "absolute", left: 780, top: 575, width: 270, height: 55, background: "white", border: "3px solid #111827", textAlign: "center", paddingTop: 8, fontWeight: "bold", zIndex: 2 }}>
            Buffet
          </div>

          <div style={{ position: "absolute", left: 810, top: 690, width: 220, height: 45, background: "#dbeafe", border: "1px solid #64748b", textAlign: "center", paddingTop: 8, fontSize: 13, zIndex: 2 }}>
            Friday Lunch Buffet 11 - 2 pm
          </div>

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
                border: table.status === "Boxed" ? "4px solid #f59e0b" : "2px solid #1e3a8a",
                borderRadius: 8,
                color: "#006ee6",
                fontWeight: "bold",
                fontSize: 10,
                lineHeight: 1.05,
                overflow: "hidden",
                zIndex: 5,
              }}
            >
              {table.id}<br />
              {table.seats}<br />
              {table.status === "Boxed" ? "📦 Boxed" : table.status}
            </button>
          ))}
        </div>
      </div>

      <p style={{ marginTop: 10, fontSize: 14 }}>
        Tap table to cycle: Seated → Boxed 📦 → Dirty → Open
      </p>
    </main>
  );
}
