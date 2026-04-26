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
  boxes: boolean;
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
  boxes: false,
});

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([
    T("P1", 4, 55, 25, 50, 55),
    T("P2", 4, 135, 25, 50, 55),
    T("P3", 4, 305, 25, 50, 55),
    T("P4", 4, 390, 25, 50, 55),
    T("P5", 4, 560, 25, 50, 55),
    T("P6", 4, 640, 25, 50, 55),
    T("P7", 4, 785, 25, 50, 55),
    T("P8", 6, 865, 25, 50, 55),

    T("19", 5, 35, 135, 55, 105),
    T("20", 4, 165, 130, 78, 42),
    T("21", 4, 250, 130, 78, 42),
    T("22", 4, 370, 125, 45, 82),
    T("23", 4, 425, 125, 45, 82),
    T("24", 4, 480, 125, 45, 82),

    T("26", 4, 610, 130, 78, 42),
    T("27", 4, 695, 130, 78, 42),
    T("28", 4, 780, 130, 70, 42),
    T("29", 4, 855, 130, 70, 42),

    T("18", 5, 45, 285, 78, 42),
    T("17", 4, 130, 285, 78, 42),
    T("16", 4, 215, 285, 78, 42),

    T("15", 4, 335, 255, 78, 42),
    T("14", 4, 420, 255, 78, 42),
    T("13", 4, 505, 255, 78, 42),
    T("9", 4, 335, 330, 78, 42),
    T("10", 4, 420, 330, 78, 42),
    T("11", 4, 505, 330, 78, 42),
    T("12", 7, 595, 250, 58, 125),

    T("32", 4, 690, 235, 48, 90),
    T("33", 4, 690, 340, 48, 90),
    T("31", 5, 790, 295, 90, 48),
    T("30", 5, 875, 295, 90, 48),

    T("34", 6, 690, 455, 48, 90),
    T("35", 6, 775, 455, 48, 90),
    T("36", 6, 860, 455, 48, 90),
    T("38", 7, 1005, 225, 52, 105),
    T("37", 5, 1005, 410, 52, 90),

    T("7", 4, 365, 435, 48, 82),
    T("6", 4, 455, 435, 48, 82),
    T("3", 2, 330, 540, 55, 38),
    T("4", 2, 420, 540, 55, 38),
    T("5", 2, 510, 540, 55, 38),

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
    T("Casa 3", 4, 1070, 875, 50, 42),
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

  function toggleBoxes(index: number) {
    setTables((prev) =>
      prev.map((table, i) =>
        i === index ? { ...table, boxes: !table.boxes } : table
      )
    );
  }

  return (
    <main style={{ padding: 8, fontFamily: "Arial", background: "#f3f4f6" }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div
          style={{
            position: "relative",
            width: 1400,
            height: 1030,
            background: "#fbfaf5",
            border: "4px solid #111827",
            overflow: "hidden",
            transform: "scale(0.72)",
            transformOrigin: "top left",
            marginBottom: -285,
          }}
        >
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
            }}
          >
            <div
              style={{
                height: 110,
                padding: 12,
                borderBottom: "5px solid #111827",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              PODIUM:
              <br />
              SEATER 1:
              <br />
              SEATER 2:
              <br />
              SEATER 3:
            </div>

            <div
              style={{
                background: "#111827",
                color: "white",
                textAlign: "center",
                padding: 8,
                fontSize: 22,
                fontWeight: "bold",
              }}
            >
              San Miguel
            </div>

            <div
              style={{
                height: 320,
                padding: 12,
                borderBottom: "4px solid #111827",
                fontSize: 17,
              }}
            >
              GUEST NAME:
              <br />
              <br />
              ARRIVAL TIME:
              <br />
              <br />
              GUESTS:
            </div>

            <div style={{ height: 150, padding: 12, fontSize: 17 }}>
              GUEST NAME:
              <br />
              <br />
              ARRIVAL TIME:
              <br />
              GUEST COUNT:
            </div>
          </div>

          <div style={{ position: "absolute", left: 0, top: 105, width: 1080, height: 5, background: "#111827" }} />
          <div style={{ position: "absolute", left: 0, top: 330, width: 255, height: 7, background: "#111827" }} />
          <div style={{ position: "absolute", left: 310, top: 330, width: 330, height: 7, background: "#111827" }} />
          <div style={{ position: "absolute", left: 760, top: 330, width: 320, height: 7, background: "#111827" }} />

          <div style={{ position: "absolute", left: 0, top: 555, width: 255, height: 8, background: "#111827" }} />
          <div style={{ position: "absolute", left: 305, top: 555, width: 340, height: 8, background: "#111827" }} />
          <div style={{ position: "absolute", left: 760, top: 555, width: 320, height: 8, background: "#111827" }} />

          <div style={{ position: "absolute", left: 300, top: 740, width: 475, height: 8, background: "#111827" }} />
          <div style={{ position: "absolute", left: 800, top: 740, width: 280, height: 8, background: "#111827" }} />
          <div style={{ position: "absolute", left: 775, top: 740, width: 8, height: 290, background: "#111827" }} />
          <div style={{ position: "absolute", left: 1080, top: 740, width: 8, height: 290, background: "#111827" }} />

          <div style={{ position: "absolute", left: 0, top: 0, width: 5, height: 1030, background: "#111827" }} />
          <div style={{ position: "absolute", left: 0, top: 1025, width: 1400, height: 5, background: "#111827" }} />

          <div style={{ position: "absolute", left: 120, top: 600, fontSize: 24, fontStyle: "italic", fontWeight: "bold" }}>
            Waiting Area
          </div>

          <div style={{ position: "absolute", left: 210, top: 360, fontSize: 22, fontStyle: "italic", fontWeight: "bold" }}>
            Take-Out
          </div>

          <div style={{ position: "absolute", left: 145, top: 760, fontSize: 16 }}>Diamante</div>

          <div style={{ position: "absolute", left: 155, top: 815, fontSize: 16, writingMode: "vertical-rl" }}>
            Lounge Furniture
          </div>

          <div
            style={{
              position: "absolute",
              left: 1140,
              top: 705,
              height: 280,
              width: 35,
              background: "#111827",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              writingMode: "vertical-rl",
              letterSpacing: 8,
              fontSize: 22,
            }}
          >
            CASA 1884
          </div>

          <div style={{ position: "absolute", left: 410, top: 215, color: "#9a3412", fontSize: 22, fontWeight: "bold" }}>
            DO NOT BLOCK
          </div>

          <div style={{ position: "absolute", left: 400, top: 375, color: "#9a3412", fontSize: 22, fontWeight: "bold" }}>
            DO NOT BLOCK
          </div>

          <div style={{ position: "absolute", left: 420, top: 595, color: "#9a3412", fontSize: 22, fontWeight: "bold" }}>
            DO NOT BLOCK
          </div>

          <div
            style={{
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
            }}
          >
            BAR
          </div>

          <div
            style={{
              position: "absolute",
              left: 780,
              top: 560,
              width: 270,
              height: 55,
              background: "white",
              border: "3px solid #111827",
              textAlign: "center",
              paddingTop: 8,
              fontWeight: "bold",
            }}
          >
            Buffet
          </div>

          <div
            style={{
              position: "absolute",
              left: 810,
              top: 675,
              width: 220,
              height: 45,
              background: "#dbeafe",
              border: "1px solid #64748b",
              textAlign: "center",
              paddingTop: 8,
              fontSize: 13,
            }}
          >
            Friday Lunch Buffet 11 - 2 pm
          </div>

          {tables.map((table, index) => (
            <button
              key={table.id}
              onClick={() => updateTable(index)}
              onDoubleClick={(e) => {
                e.preventDefault();
                toggleBoxes(index);
              }}
              style={{
                position: "absolute",
                left: table.x,
                top: table.y,
                width: table.w,
                height: table.h,
                background: color(table.status),
                border: table.boxes ? "4px solid #f59e0b" : "2px solid #334155",
                borderRadius: 8,
                color: "#006ee6",
                fontWeight: "bold",
                fontSize: 11,
                lineHeight: 1.05,
                overflow: "hidden",
              }}
            >
              {table.boxes && <div style={{ fontSize: 13 }}>📦</div>}
              {table.id}
              <br />
              {table.seats > 0 ? table.seats : "Couch"}
              <br />
              {table.status}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 14 }}>
        Tap a table to change status. Double-tap a table to mark/unmark boxes 📦.
      </div>
    </main>
  );
}
