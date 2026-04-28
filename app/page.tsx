"use client";

import { useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Table = {
  id: string;
  seats: number;
  x: number;
  y: number;
  w: number;
  h: number;
  status: Status;
};

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const T = (
  id: string,
  seats: number,
  x: number,
  y: number,
  w = 54,
  h = 46
): Table => ({
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

export default function Page() {
  const [tables, setTables] = useState<Table[]>([
    T("P1", 4, 105, 42, 44, 58),
    T("P2", 4, 185, 42, 44, 58),
    T("P3", 4, 405, 42, 44, 58),
    T("P4", 4, 485, 42, 44, 58),
    T("P5", 4, 645, 42, 44, 58),
    T("P6", 4, 725, 42, 44, 58),
    T("P7", 4, 900, 42, 44, 58),
    T("P8", 6, 980, 42, 44, 58),

    T("19", 5, 60, 160, 52, 110),
    T("20", 4, 185, 145, 78, 40),
    T("21", 4, 270, 145, 78, 40),
    T("22", 4, 405, 135, 44, 82),
    T("23", 4, 465, 135, 44, 82),
    T("24", 4, 525, 135, 44, 82),

    T("26", 4, 680, 145, 78, 40),
    T("27", 4, 765, 145, 78, 40),
    T("28", 4, 850, 145, 70, 40),
    T("29", 4, 925, 145, 70, 40),

    T("18", 5, 60, 320, 78, 40),
    T("17", 4, 145, 320, 78, 40),
    T("16", 4, 230, 320, 78, 40),

    T("15", 4, 385, 290, 78, 40),
    T("14", 4, 470, 290, 78, 40),
    T("13", 4, 555, 290, 78, 40),

    T("9", 4, 385, 365, 78, 40),
    T("10", 4, 470, 365, 78, 40),
    T("11", 4, 555, 365, 78, 40),
    T("12", 7, 660, 285, 58, 125),

    T("32", 4, 760, 255, 48, 88),
    T("33", 4, 760, 365, 48, 88),
    T("31", 5, 870, 335, 90, 48),
    T("30", 5, 960, 335, 90, 48),

    T("34", 6, 760, 485, 48, 88),
    T("35", 6, 850, 485, 48, 88),
    T("36", 6, 940, 485, 48, 88),

    T("38", 7, 1065, 245, 52, 105),
    T("37", 5, 1065, 440, 52, 90),

    T("7", 4, 420, 475, 48, 82),
    T("6", 4, 515, 475, 48, 82),

    T("3", 2, 385, 585, 55, 38),
    T("4", 2, 475, 585, 55, 38),
    T("5", 2, 565, 585, 55, 38),

    T("2", 4, 145, 615, 78, 42),
    T("1", 4, 145, 690, 70, 42),

    T("DL4", 4, 55, 795, 75, 42),
    T("DL3", 4, 55, 875, 75, 42),
    T("DL2", 4, 55, 955, 75, 42),
    T("DL1", 4, 160, 955, 70, 58),

    T("L10", 6, 275, 835, 92, 42),
    T("L9", 2, 275, 905, 55, 42),

    T("L1", 4, 425, 795, 78, 42),
    T("L2", 4, 525, 795, 78, 42),
    T("L3", 4, 625, 795, 78, 42),
    T("L4", 6, 745, 875, 72, 42),

    T("L11", 0, 465, 880, 48, 44),
    T("L12", 0, 550, 880, 48, 44),

    T("L8", 4, 420, 950, 50, 75),
    T("L7", 4, 510, 950, 50, 75),
    T("L6", 4, 600, 950, 50, 75),
    T("L5", 8, 720, 950, 82, 70),

    T("Casa 8", 4, 875, 815, 50, 82),
    T("Casa 1", 4, 990, 815, 50, 82),
    T("Casa 2", 4, 1085, 815, 50, 82),

    T("Casa 7", 4, 850, 915, 80, 42),
    T("Casa 9", 4, 940, 915, 80, 42),
    T("Casa 10", 4, 1030, 915, 80, 42),
    T("Casa 3", 4, 1120, 915, 50, 42),

    T("Casa 6", 4, 875, 995, 50, 42),
    T("Casa 5", 4, 970, 995, 50, 42),
    T("Casa 4", 4, 1065, 995, 50, 42),

    T("San Miguel 1", 12, 1200, 355, 150, 60),
    T("San Miguel 2", 12, 1200, 465, 150, 60),
  ]);

  function updateTable(index: number) {
    setTables((prev) =>
      prev.map((table, i) =>
        i === index
          ? {
              ...table,
              status:
                cycle[(cycle.indexOf(table.status) + 1) % cycle.length],
            }
          : table
      )
    );
  }

  return (
    <main style={{ padding: 8, fontFamily: "Arial", background: "#f3f4f6" }}>
      <h1 style={{ marginBottom: 8 }}>Host Map</h1>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1400,
            height: 1050,
            background: "#fbfaf5",
            border: "4px solid #111827",
            overflow: "hidden",
          }}
        >
          <img
            src="/floorplan.png"
            alt="Restaurant floor plan"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              zIndex: 0,
            }}
          />

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
                border:
                  table.status === "Boxed"
                    ? "4px solid #f59e0b"
                    : "2px solid #1e3a8a",
                borderRadius: 8,
                color: "#006ee6",
                fontWeight: "bold",
                fontSize: 10,
                lineHeight: 1.05,
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              {table.id}
              <br />
              {table.seats > 0 ? table.seats : "Couch"}
              <br />
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
