"use client";

import { useState, useEffect } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  status: Status;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  if (status === "Dirty") return "#fca5a5"; // red

  return "#e5e7eb";

}

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [dragging, setDragging] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>([

    { id: "P1", seats: "4", x: 60, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P2", seats: "4", x: 150, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P3", seats: "4", x: 380, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P4", seats: "4", x: 470, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P5", seats: "4", x: 660, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P6", seats: "4", x: 750, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P7", seats: "4", x: 960, y: 40, w: 60, h: 60, status: "Open" },

    { id: "P8", seats: "6", x: 1050, y: 40, w: 60, h: 60, status: "Open" },

    { id: "19", seats: "5", x: 40, y: 150, w: 60, h: 110, status: "Open" },

    { id: "20", seats: "4", x: 170, y: 145, w: 80, h: 40, status: "Open" },

    { id: "21", seats: "4", x: 270, y: 145, w: 80, h: 40, status: "Open" },

    { id: "22", seats: "4", x: 420, y: 140, w: 55, h: 85, status: "Open" },

    { id: "23", seats: "4", x: 495, y: 140, w: 55, h: 85, status: "Open" },

    { id: "24", seats: "4", x: 570, y: 140, w: 55, h: 85, status: "Open" },

    { id: "26", seats: "4", x: 760, y: 145, w: 80, h: 40, status: "Open" },

    { id: "27", seats: "4", x: 860, y: 145, w: 80, h: 40, status: "Open" },

    { id: "28", seats: "4", x: 960, y: 145, w: 80, h: 40, status: "Open" },

    { id: "29", seats: "4", x: 1060, y: 145, w: 80, h: 40, status: "Open" },

    { id: "18", seats: "5", x: 50, y: 305, w: 80, h: 40, status: "Open" },

    { id: "17", seats: "4", x: 145, y: 305, w: 80, h: 40, status: "Open" },

    { id: "16", seats: "4", x: 240, y: 305, w: 80, h: 40, status: "Open" },

    { id: "15", seats: "4", x: 400, y: 265, w: 80, h: 40, status: "Open" },

    { id: "14", seats: "4", x: 505, y: 265, w: 80, h: 40, status: "Open" },

    { id: "13", seats: "4", x: 610, y: 265, w: 80, h: 40, status: "Open" },

    { id: "9", seats: "4", x: 400, y: 365, w: 80, h: 40, status: "Open" },

    { id: "10", seats: "4", x: 505, y: 365, w: 80, h: 40, status: "Open" },

    { id: "11", seats: "4", x: 610, y: 365, w: 80, h: 40, status: "Open" },

    { id: "12", seats: "7", x: 720, y: 285, w: 60, h: 130, status: "Open" },

    { id: "32", seats: "4", x: 825, y: 250, w: 60, h: 90, status: "Open" },

    { id: "33", seats: "4", x: 825, y: 365, w: 60, h: 90, status: "Open" },

    { id: "31", seats: "5", x: 960, y: 350, w: 80, h: 50, status: "Open" },

    { id: "30", seats: "5", x: 1060, y: 350, w: 80, h: 50, status: "Open" },

    { id: "38", seats: "7", x: 1165, y: 245, w: 60, h: 100, status: "Open" },

    { id: "37", seats: "5", x: 1165, y: 445, w: 60, h: 90, status: "Open" },

    { id: "34", seats: "6", x: 865, y: 455, w: 60, h: 90, status: "Open" },

    { id: "35", seats: "6", x: 960, y: 455, w: 60, h: 90, status: "Open" },

    { id: "36", seats: "6", x: 1055, y: 455, w: 60, h: 90, status: "Open" },

  ]);

  function updateTable(i: number) {

    if (editMode) return;

    setTables((prev) =>

      prev.map((t, idx) =>

        idx === i

          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % 4] }

          : t

      )

    );

  }

  function startDrag(i: number) {

    if (!editMode) return;

    setDragging(i);

  }

  function drag(e: any) {

    if (dragging === null) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const scale = rect.width / 1500;

    const x = snap((e.clientX - rect.left) / scale - 30);

    const y = snap((e.clientY - rect.top) / scale - 20);

    setTables((prev) =>

      prev.map((t, i) => (i === dragging ? { ...t, x, y } : t))

    );

  }

  return (

    <main style={{ padding: 10 }}>

      <h1>Host Map</h1>

      <button onClick={() => setEditMode(!editMode)}>

        {editMode ? "Editing ON" : "Move Tables"}

      </button>

      <div

        onPointerMove={drag}

        onPointerUp={() => setDragging(null)}

        style={{

          width: "100%",

          overflow: "auto",

        }}

      >

        <div

          style={{

            position: "relative",

            width: 1500,

            height: 1000,

            border: "4px solid black",

            transform: "scale(0.75)",

            transformOrigin: "top left",

            background: "#fbfaf5",

          }}

        >

          {tables.map((t, i) => (

            <button

              key={t.id}

              onPointerDown={() => startDrag(i)}

              onClick={() => updateTable(i)}

              style={{

                position: "absolute",

                left: t.x,

                top: t.y,

                width: t.w,

                height: t.h,

                background: statusColor(t.status),

                border: "2px solid #1e3a8a",

                borderRadius: 8,

                fontSize: 11,

                fontWeight: "bold",

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

      </div>

    </main>

  );

}
