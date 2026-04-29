"use client";

import { useState, useEffect } from "react";

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

  if (status === "Dirty") return "#fca5a5"; // RED for dirty ✅

  return "#e5e7eb";

}

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>([

    makeTable("P1", "4", 55, 35),

    makeTable("P2", "4", 145, 35),

    makeTable("P3", "4", 380, 35),

    makeTable("P4", "4", 470, 35),

    makeTable("P5", "4", 665, 35),

    makeTable("P6", "4", 755, 35),

    makeTable("P7", "4", 965, 35),

    makeTable("P8", "6", 1055, 35),

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

  ]);

  // ✅ FIX FOR CRASH (TEMPORARY)

  useEffect(() => {

    localStorage.removeItem("floorTables");

    localStorage.removeItem("waitlist");

    localStorage.removeItem("serverRotation");

  }, []);

  function updateTable(index: number) {

    if (editMode) return;

    setTables((prev) =>

      prev.map((t, i) =>

        i === index

          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % cycle.length] }

          : t

      )

    );

  }

  function startDrag(index: number) {

    if (!editMode) return;

    setDraggingIndex(index);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (draggingIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const scale = rect.width / 1500;

    const x = snap((e.clientX - rect.left) / scale - 30);

    const y = snap((e.clientY - rect.top) / scale - 20);

    setTables((prev) =>

      prev.map((t, i) => (i === draggingIndex ? { ...t, x, y } : t))

    );

  }

  function stopDrag() {

    setDraggingIndex(null);

  }

  return (

    <main style={{ padding: 10, fontFamily: "Arial" }}>

      <h1>Host Map</h1>

      <button onClick={() => setEditMode(!editMode)}>

        {editMode ? "Editing ON" : "Move Tables"}

      </button>

      <div

        onPointerMove={dragTable}

        onPointerUp={stopDrag}

        style={{

          position: "relative",

          width: 1500,

          height: 1000,

          border: "3px solid black",

          marginTop: 10,

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

    </main>

  );

}
