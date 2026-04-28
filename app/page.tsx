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

    // Patio

    makeTable("P1", "4", 55, 35, 55, 58),

    makeTable("P2", "4", 145, 35, 55, 58),

    makeTable("P3", "4", 380, 35, 55, 58),

    makeTable("P4", "4", 470, 35, 55, 58),

    makeTable("P5", "4", 665, 35, 55, 58),

    makeTable("P6", "4", 755, 35, 55, 58),

    makeTable("P7", "4", 965, 35, 55, 58),

    makeTable("P8", "6", 1055, 35, 55, 58),

    makeTable("19", "5", 38, 150, 58, 110),

    makeTable("20", "4", 175, 145, 82, 42),

    makeTable("21", "4", 275, 145, 82, 42),

    makeTable("22", "4", 420, 135, 52, 84),

    makeTable("23", "4", 495, 135, 52, 84),

    makeTable("24", "4", 570, 135, 52, 84),

    makeTable("26", "4", 760, 145, 82, 42),

    makeTable("27", "4", 860, 145, 82, 42),

    makeTable("28", "4", 960, 145, 82, 42),

    makeTable("29", "4", 1060, 145, 82, 42),

    makeTable("18", "5", 45, 325, 82, 42),

    makeTable("17", "4", 140, 325, 82, 42),

    makeTable("16", "4", 235, 325, 82, 42),

    makeTable("15", "4", 395, 285, 82, 42),

    makeTable("14", "4", 500, 285, 82, 42),

    makeTable("13", "4", 605, 285, 82, 42),

    makeTable("9", "4", 395, 365, 82, 42),

    makeTable("10", "4", 500, 365, 82, 42),

    makeTable("11", "4", 605, 365, 82, 42),

    makeTable("12", "7", 720, 285, 60, 130),

    makeTable("32", "4", 825, 250, 55, 92),

    makeTable("33", "4", 825, 365, 55, 92),

    makeTable("31", "5", 960, 350, 82, 48),

    makeTable("30", "5", 1060, 350, 82, 48),

    makeTable("38", "7", 1195, 245, 55, 105),

    makeTable("37", "5", 1195, 445, 55, 90),

    // Center

    makeTable("7", "4", 420, 465, 52, 82),

    makeTable("6", "4", 525, 465, 52, 82),

    makeTable("3", "2", 380, 575, 62, 40),

    makeTable("4", "2", 475, 575, 62, 40),

    makeTable("5", "2", 570, 575, 62, 40),

    // 🔥 FIXED TABLES (back in place)

    makeTable("34", "6", 825, 505, 55, 88),

    makeTable("35", "6", 920, 505, 55, 88),

    makeTable("36", "6", 1015, 505, 55, 88),

    // Bar area

    makeTable("2", "4", 135, 590, 78, 42),

    makeTable("1", "4", 135, 665, 78, 42),

    makeTable("DL4", "4", 45, 775, 75, 42),

    makeTable("DL3", "4", 45, 860, 75, 42),

    makeTable("DL2", "4", 45, 945, 75, 42),

    makeTable("DL1", "4", 145, 940, 70, 58),

    makeTable("L10", "6", 250, 815, 92, 42),

    makeTable("L9", "2", 250, 885, 58, 42),

    makeTable("L1", "4", 390, 775, 78, 42),

    makeTable("L2", "4", 490, 775, 78, 42),

    makeTable("L3", "4", 590, 775, 78, 42),

    makeTable("L4", "6", 700, 860, 75, 42),

    makeTable("L11", "Couch", 435, 855, 58, 46),

    makeTable("L12", "Couch", 520, 855, 58, 46),

    makeTable("L8", "4", 385, 930, 52, 75),

    makeTable("L7", "4", 475, 930, 52, 75),

    makeTable("L6", "4", 565, 930, 52, 75),

    makeTable("L5", "8", 670, 930, 82, 70),

    // Casa

    makeTable("Casa 8", "4", 840, 790, 55, 82),

    makeTable("Casa 1", "4", 955, 790, 55, 82),

    makeTable("Casa 2", "4", 1070, 790, 55, 82),

    makeTable("Casa 7", "4", 800, 885, 80, 42),

    makeTable("Casa 9", "4", 910, 885, 80, 42),

    makeTable("Casa 10", "4", 1020, 885, 80, 42),

    makeTable("Casa 3", "4", 1130, 885, 65, 42),

    makeTable("Casa 6", "4", 850, 960, 60, 42),

    makeTable("Casa 5", "4", 960, 960, 60, 42),

    makeTable("Casa 4", "4", 1070, 960, 60, 42),

    makeTable("San Miguel 1", "12", 1310, 410, 145, 60),

    makeTable("San Miguel 2", "12", 1310, 510, 145, 60),

  ]);

  function updateTable(index: number) {

    setTables((prev) =>

      prev.map((t, i) =>

        i === index

          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % 4] }

          : t

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

    <main style={{ padding: 4, fontFamily: "Arial", background: "#f3f4f6" }}>

      <h1 style={{ margin: "0 0 8px 0", fontSize: 34 }}>Host Map</h1>

      <div style={{ overflowX: "auto" }}>

        <div

          style={{

            position: "relative",

            width: 1500,

            height: 1040,

            background: "#fbfaf5",

            border: "4px solid #111827",

          }}

        >

          {/* WALLS (fixed + visible) */}

          {wall(0, 105, 1240, 6)}

          {wall(0, 360, 270, 7)}

          {wall(380, 325, 320, 7)}

          {wall(380, 540, 290, 7)}

          {wall(0, 560, 250, 8)}

          {wall(300, 755, 460, 8)}

          {wall(780, 755, 400, 8)}

          {wall(220, 815, 8, 225)}

          {wall(760, 755, 8, 285)}

          {wall(1180, 755, 8, 285)}

          {/* 🔥 Buffet / 34-36 wall */}

          {wall(800, 585, 360, 8)}

          {/* Everything else unchanged */}

          {tables.map((table, i) => (

            <button

              key={table.id}

              onClick={() => updateTable(i)}

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

                zIndex: 5,

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
