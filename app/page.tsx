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

const T = (id: string, seats: number, x: number, y: number, w: number, h: number): Table => ({
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
    T("P1", 4, 55, 22, 52, 56),
    T("P2", 4, 135, 22, 52, 56),
    T("P3", 4, 310, 22, 52, 56),
    T("P4", 4, 395, 22, 52, 56),
    T("P5", 4, 565, 22, 52, 56),
    T("P6", 4, 645, 22, 52, 56),
    T("P7", 4, 805, 22, 52, 56),
    T("P8", 6, 885, 22, 52, 56),

    T("19", 5, 35, 135, 56, 105),
    T("20", 4, 175, 135, 78, 42),
    T("21", 4, 260, 135, 78, 42),
    T("22", 4, 380, 125, 45, 82),
    T("23", 4, 440, 125, 45, 82),
    T("24", 4, 500, 125, 45, 82),

    T("18", 5, 45, 290, 78, 42),
    T("17", 4, 130, 290, 78, 42),
    T("16", 4, 215, 290, 78, 42),

    T("15", 4, 345, 255, 78, 42),
    T("14", 4, 430, 255, 78, 42),
    T("13", 4, 515, 255, 78, 42),
    T("9", 4, 345, 330, 78, 42),
    T("10", 4, 430, 330, 78, 42),
    T("11", 4, 515, 330, 78, 42),
    T("12", 7, 610, 250, 58, 125),

    T("7", 4, 370, 435, 48, 82),
    T("6", 4, 465, 435, 48, 82),

    T("3", 2, 340, 540, 55, 38),
    T("4", 2, 430, 540, 55, 38),
    T("5", 2, 520, 540, 55, 38),

    T("26", 4, 675, 135, 78, 42),
    T("27", 4, 760, 135, 78, 42),
    T("28", 4, 850, 135, 70, 42),
    T("29", 4, 925, 135, 70, 42),

    T("32", 4, 730, 235, 48, 90),
    T("33", 4, 730, 340, 48, 90),
    T("31", 5, 825, 300, 90, 48),
    T("30", 5, 915, 300, 90, 48),

    T("34", 6, 730, 455, 48, 90),
    T("35", 6, 815, 455, 48, 90),
    T("36", 6, 900, 455, 48, 90),

    T("38", 7, 1015, 225, 52, 105),
    T("37", 5, 1015, 410, 52, 90),

    T("2", 4, 135, 565, 78, 42),
    T("1", 4, 135, 640, 70, 42),

    T("DL4", 4, 40, 760, 75, 42),
    T("DL3", 4, 40, 840, 75, 42),
    T("DL2", 4, 40, 920, 75, 42),
    T("DL1", 4, 145, 920, 70, 58),

    T("L10", 6, 240, 800, 92, 42),
    T("L9", 2, 240, 870, 55, 42),

    T("L1", 4, 385, 760, 78, 42),
    T("L2", 4, 485, 760, 78, 42),
    T("L3", 4, 585, 760, 78, 42),
    T("L4", 6, 690, 835, 72, 42),
    T("L11", 0, 420, 850, 48, 44),
    T("L12", 0, 505, 850, 48, 44),
    T("L8", 4, 380, 920, 50, 75),
    T("L7", 4, 465, 920, 50, 75),
    T("L6", 4, 550, 920, 50, 75),
    T("L5", 8, 675, 920, 82, 70),

    T("Casa 8", 4, 830, 775, 50, 82),
    T("Casa 1", 4, 950, 775, 50, 82),
    T("Casa 2", 4, 1035, 775, 50, 82),
    T("Casa 7", 4, 820, 875, 80, 42),
    T("Casa 9", 4, 905, 875, 80, 42),
    T("Casa 10", 4, 995, 875, 80, 42),
    T("Casa 3", 4, 1075, 875, 50, 42),
    T("Casa 6", 4, 845, 960, 50, 42),
    T("Casa 5", 4, 935, 960, 50, 42),
    T("Casa 4", 4, 1025, 960, 50, 42),

    T("San Miguel 1", 12, 1160, 270, 180, 80),
    T("San Miguel 2", 12, 1160, 390, 180, 80),
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

  function updateTable(index: number) {
    setTables((prev) =>
      prev.map((table, i) =>
        i === index ? { ...table, status: nextStatus(table.status) } : table
      )
    );
  }

  return (
    <main style={{ padding: 8 }}>
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1400,
            height: 1030,
            background: "#fbfaf5",
            border: "4px solid #111827",
            transform: "scale(0.72)",
            transformOrigin: "top left",
          }}
        >
          {/* BAR */}
          <div style={{
            position: "absolute",
            left: 300,
            top: 625,
            width: 330,
            height: 85,
            borderRadius: 20,
            border: "5px solid #64748b",
            background: "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: "bold",
          }}>
            BAR
          </div>

          {/* BUFFET */}
          <div style={{
            position: "absolute",
            left: 780,
            top: 560,
            width: 270,
            height: 55,
            border: "3px solid black",
            textAlign: "center",
            paddingTop: 8,
            fontWeight: "bold"
          }}>
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
                background: color(table.status),
                border: "2px solid #334155",
                borderRadius: 8,
                color: "#006ee6",
                fontWeight: "bold",
                fontSize: 11,
              }}
            >
              {table.id}
              <br />
              {table.seats > 0 ? table.seats : "Couch"}
              <br />
              {table.status}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
