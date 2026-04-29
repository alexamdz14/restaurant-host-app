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

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

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

  x: snap(x),

  y: snap(y),

  w: snap(w),

  h: snap(h),

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

    makeTable("18", "5", 45, 305, 82, 42),

    makeTable("17", "4", 140, 305, 82, 42),

    makeTable("16", "4", 235, 305, 82, 42),

    makeTable("15", "4", 395, 265, 82, 42),

    makeTable("14", "4", 500, 265, 82, 42),

    makeTable("13", "4", 605, 265, 82, 42),

    makeTable("9", "4", 395, 365, 82, 42),

    makeTable("10", "4", 500, 365, 82, 42),

    makeTable("11", "4", 605, 365, 82, 42),

    makeTable("12", "7", 720, 285, 60, 130),

    makeTable("32", "4", 825, 250, 55, 92),

    makeTable("33", "4", 825, 365, 55, 92),

    makeTable("31", "5", 960, 350, 82, 48),

    makeTable("30", "5", 1060, 350, 82, 48),

    makeTable("38", "7", 1165, 245, 55, 105),

    makeTable("37", "5", 1165, 445, 55, 90),

    makeTable("7", "4", 420, 440, 52, 82),

    makeTable("6", "4", 525, 440, 52, 82),

    makeTable("3", "2", 380, 580, 62, 40),

    makeTable("4", "2", 475, 580, 62, 40),

    makeTable("5", "2", 570, 580, 62, 40),

    makeTable("34", "6", 865, 455, 55, 88),

    makeTable("35", "6", 960, 455, 55, 88),

    makeTable("36", "6", 1055, 455, 55, 88),

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

    makeTable("L4", "6", 670, 860, 75, 42),

    makeTable("L11", "Couch", 435, 855, 58, 46),

    makeTable("L12", "Couch", 520, 855, 58, 46),

    makeTable("L8", "4", 385, 930, 52, 75),

    makeTable("L7", "4", 475, 930, 52, 75),

    makeTable("L6", "4", 565, 930, 52, 75),

    makeTable("L5", "8", 670, 930, 82, 70),

    makeTable("Casa 8", "4", 840, 790, 55, 82),

    makeTable("Casa 1", "4", 955, 790, 55, 82),

    makeTable("Casa 2", "4", 1070, 790, 55, 82),

    makeTable("Casa 7", "4", 800, 885, 80, 42),

    makeTable("Casa 9", "4", 910, 885, 80, 42),

    makeTable("Casa 10", "4", 1020, 885, 80, 42),

    makeTable("Casa 3", "4", 1110, 885, 65, 42),

    makeTable("Casa 6", "4", 850, 960, 60, 42),

    makeTable("Casa 5", "4", 960, 960, 60, 42),

    makeTable("Casa 4", "4", 1070, 960, 60, 42),

    makeTable("San Miguel 1", "12", 1310, 410, 145, 60),

    makeTable("San Miguel 2", "12", 1310, 510, 145, 60),

  ]);

  function updateTable(index: number) {

    setTables((prev) =>

      prev.map((table, i) =>

        i === index

          ? {

              ...table,

              status: cycle[(cycle.indexOf(table.status) + 1) % cycle.length],

            }

          : table

      )

    );

  }

  const wall = (x: number, y: number, w: number, h: number) => (

    <div

      style={{

        position: "absolute",

        left: snap(x),

        top: snap(y),

        width: snap(w),

        height: snap(h),

        background: "#111827",

        zIndex: 1,

      }}

    />

  );

  return (

    <main style={{ padding: 4, fontFamily: "Arial", background: "#f3f4f6" }}>

      <h1 style={{ margin: "0 0 8px 0", fontSize: 34 }}>Host Map</h1>

      <div style={{ width: "100%", overflowX: "auto" }}>

        <div

          style={{

            position: "relative",

            width: 1500,

            height: 1040,

            background: "#fbfaf5",

            border: "4px solid #111827",

            overflow: "hidden",

            transform: "scale(0.74)",

            transformOrigin: "top left",

            marginBottom: -270,

          }}

        >

          {wall(0, 105, 1240, 6)}

          {wall(0, 360, 270, 7)}

          {wall(380, 325, 320, 7)}

          {wall(380, 540, 290, 7)}

          {wall(0, 560, 250, 8)}

          {wall(300, 755, 460, 8)}

          {wall(780, 755, 430, 8)}

          {wall(220, 815, 8, 225)}

          {wall(760, 755, 8, 285)}

          {wall(1210, 755, 8, 285)}

          {wall(800, 575, 360, 8)}

          <div

            style={{

              position: "absolute",

              left: 1240,

              top: 0,

              width: 260,

              height: 650,

              borderLeft: "5px solid #111827",

              borderBottom: "5px solid #111827",

              background: "#fffdf7",

              zIndex: 2,

            }}

          >

            <div

              style={{

                height: 110,

                padding: 14,

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

                margin: "0 20px",

              }}

            >

              San Miguel

            </div>

            <div

              style={{

                margin: "14px 22px",

                padding: 12,

                height: 165,

                border: "3px solid #111827",

                fontSize: 15,

              }}

            >

              GUEST NAME:

              <br />

              <br />

              ARRIVAL TIME:

              <br />

              <br />

              GUESTS:

              <br />

              <br />

              SERVER:

            </div>

          </div>

          <div

            style={{

              position: "absolute",

              left: 1225,

              top: 735,

              width: 255,

              height: 290,

              border: "4px solid #111827",

              background: "#fffdf7",

              zIndex: 2,

            }}

          >

            <div

              style={{

                background: "#111827",

                color: "white",

                textAlign: "center",

                padding: 8,

                fontSize: 20,

                fontWeight: "bold",

              }}

            >

              Casa 1884

            </div>

            <div style={{ padding: 16, fontSize: 16 }}>

              GUEST NAME:

              <br />

              <br />

              ARRIVAL TIME:

              <br />

              <br />

              GUEST COUNT:

              <br />

              <br />

              SERVER:

            </div>

          </div>

          <div

            style={{

              position: "absolute",

              left: 120,

              top: 405,

              fontSize: 25,

              fontStyle: "italic",

              fontWeight: "bold",

              zIndex: 2,

            }}

          >

            Take-Out

          </div>

          <div

            style={{

              position: "absolute",

              left: 310,

              top: 625,

              width: 335,

              height: 85,

              borderRadius: 20,

              border: "5px solid #64748b",

              background: "#dbeafe",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              fontSize: 36,

              fontWeight: "bold",

              zIndex: 2,

            }}

          >

            BAR

          </div>

          <div

            style={{

              position: "absolute",

              left: 810,

              top: 600,

              width: 275,

              height: 48,

              background: "white",

              border: "3px solid #111827",

              textAlign: "center",

              paddingTop: 10,

              fontWeight: "bold",

              fontSize: 18,

              zIndex: 2,

            }}

          >

            Buffet

          </div>

          <div

            style={{

              position: "absolute",

              left: 835,

              top: 675,

              width: 220,

              height: 45,

              background: "#dbeafe",

              border: "1px solid #64748b",

              textAlign: "center",

              paddingTop: 10,

              fontSize: 13,

              zIndex: 2,

            }}

          >

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

                zIndex: 5,

              }}

            >

              {table.id}

              <br />

              {table.seats}

              <br />

              {table.status === "Boxed" ? "📦 Boxed" : table.status}

            </button>

          ))}

        </div>

      </div>

      <p style={{ marginTop: 8, fontSize: 14 }}>

        Tap table to cycle: Seated → Boxed 📦 → Dirty → Open

      </p>

    </main>

  );

}
