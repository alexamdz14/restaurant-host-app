"use client";

import { useEffect, useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w?: number;

  h?: number;

  status: Status;

  server?: string;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const servers = [

  { name: "A", color: "#60a5fa" },

  { name: "B", color: "#f87171" },

  { name: "C", color: "#34d399" },

  { name: "D", color: "#fbbf24" },

];

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

  server: "",

});

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  return "#e5e7eb";

}

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const defaultTables: TableItem[] = [

    makeTable("34", "6", 865, 455, 55, 88),

    makeTable("35", "6", 960, 455, 55, 88),

    makeTable("36", "6", 1055, 455, 55, 88),

    makeTable("37", "5", 1165, 445, 55, 90),

    makeTable("38", "7", 1165, 245, 55, 105),

  ];

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  // 💾 LOAD saved layout

  useEffect(() => {

    const saved = localStorage.getItem("floorTables");

    if (saved) setTables(JSON.parse(saved));

  }, []);

  // 💾 SAVE layout

  useEffect(() => {

    localStorage.setItem("floorTables", JSON.stringify(tables));

  }, [tables]);

  function updateTable(index: number) {

    if (editMode) return;

    setTables((prev) =>

      prev.map((t, i) =>

        i === index

          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % 4] }

          : t

      )

    );

  }

  function assignServer(index: number) {

    const current = tables[index].server || "";

    const nextIndex =

      (servers.findIndex((s) => s.name === current) + 1) % (servers.length + 1);

    const newServer = nextIndex === servers.length ? "" : servers[nextIndex].name;

    setTables((prev) =>

      prev.map((t, i) =>

        i === index ? { ...t, server: newServer } : t

      )

    );

  }

  function startDrag(index: number) {

    if (!editMode) return;

    setDraggingIndex(index);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (!editMode || draggingIndex === null) return;

    const map = e.currentTarget.getBoundingClientRect();

    const scale = map.width / 1500;

    const x = snap((e.clientX - map.left) / scale);

    const y = snap((e.clientY - map.top) / scale);

    setTables((prev) =>

      prev.map((t, i) =>

        i === draggingIndex ? { ...t, x, y } : t

      )

    );

  }

  function stopDrag() {

    setDraggingIndex(null);

  }

  function resetLayout() {

    localStorage.removeItem("floorTables");

    setTables(defaultTables);

  }

  return (

    <main style={{ padding: 10, fontFamily: "Arial" }}>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>

        <button onClick={() => setEditMode(!editMode)}>

          {editMode ? "Editing ON" : "Move Tables"}

        </button>

        <button onClick={resetLayout}>Reset Layout</button>

      </div>

      <div

        onPointerMove={dragTable}

        onPointerUp={stopDrag}

        style={{

          position: "relative",

          width: 1500,

          height: 900,

          border: "3px solid black",

        }}

      >

        {tables.map((table, index) => {

          const serverColor =

            servers.find((s) => s.name === table.server)?.color || "#1e3a8a";

          return (

            <button

              key={table.id}

              onPointerDown={(e) => {

                e.preventDefault();

                startDrag(index);

              }}

              onDoubleClick={() => assignServer(index)}

              onClick={() => updateTable(index)}

              style={{

                position: "absolute",

                left: table.x,

                top: table.y,

                width: table.w,

                height: table.h,

                background: statusColor(table.status),

                border: `3px solid ${serverColor}`,

                borderRadius: 8,

                fontSize: 10,

                fontWeight: "bold",

              }}

            >

              {table.id}

              <br />

              {table.server || "-"}

              <br />

              {table.status}

            </button>

          );

        })}

      </div>

    </main>

  );

}
