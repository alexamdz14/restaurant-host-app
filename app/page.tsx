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

  server?: string;

  section?: string;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const makeTable = (

  id: string,

  seats: string,

  x: number,

  y: number,

  section = "Main",

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

  section,

});

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  if (status === "Dirty") return "#f87171"; // 🔴 RED

}

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // 👇 SERVERS + ROTATION

  const [servers] = useState({

    Main: ["Alex", "Sam", "Jordan"],

    Bar: ["Chris"],

    Casa: ["Maria", "Luis"],

  });

  const [rotationIndex, setRotationIndex] = useState({

    Main: 0,

    Bar: 0,

    Casa: 0,

  });

  const nextServer = (section: string) => {

    const list = servers[section as keyof typeof servers];

    if (!list) return "";

    const index = rotationIndex[section as keyof typeof rotationIndex];

    const server = list[index];

    setRotationIndex((prev) => ({

      ...prev,

      [section]: (index + 1) % list.length,

    }));

    return server;

  };

  const [tables, setTables] = useState<TableItem[]>([

    makeTable("P1", "4", 55, 35),

    makeTable("P2", "4", 145, 35),

    makeTable("P3", "4", 380, 35),

    makeTable("P4", "4", 470, 35),

    makeTable("P5", "4", 665, 35),

    makeTable("P6", "4", 755, 35),

    makeTable("P7", "4", 965, 35),

    makeTable("P8", "6", 1055, 35),

    makeTable("19", "5", 38, 150),

    makeTable("20", "4", 175, 145),

    makeTable("21", "4", 275, 145),

    makeTable("22", "4", 420, 135),

    makeTable("23", "4", 495, 135),

    makeTable("24", "4", 570, 135),

    makeTable("26", "4", 760, 145),

    makeTable("27", "4", 860, 145),

    makeTable("28", "4", 960, 145),

    makeTable("29", "4", 1060, 145),

    makeTable("18", "5", 45, 305),

    makeTable("17", "4", 140, 305),

    makeTable("16", "4", 235, 305),

    makeTable("15", "4", 395, 265),

    makeTable("14", "4", 500, 265),

    makeTable("13", "4", 605, 265),

    makeTable("9", "4", 395, 365),

    makeTable("10", "4", 500, 365),

    makeTable("11", "4", 605, 365),

    makeTable("12", "7", 720, 285),

    makeTable("32", "4", 825, 250),

    makeTable("33", "4", 825, 365),

    makeTable("31", "5", 960, 350),

    makeTable("30", "5", 1060, 350),

    makeTable("38", "7", 1165, 245),

    makeTable("37", "5", 1165, 445),

    makeTable("7", "4", 420, 440),

    makeTable("6", "4", 525, 440),

    makeTable("3", "2", 380, 580),

    makeTable("4", "2", 475, 580),

    makeTable("5", "2", 570, 580),

    makeTable("34", "6", 865, 455),

    makeTable("35", "6", 960, 455),

    makeTable("36", "6", 1055, 455),

  ]);

  function updateTable(index: number) {

    if (editMode) return;

    setTables((prev) =>

      prev.map((table, i) => {

        if (i !== index) return table;

        const newStatus =

          cycle[(cycle.indexOf(table.status) + 1) % cycle.length];

        return {

          ...table,

          status: newStatus,

          server:

            newStatus === "Seated"

              ? nextServer(table.section || "Main")

              : table.server,

        };

      })

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

    const x = snap(

      (e.clientX - map.left) / scale -

        (tables[draggingIndex].w || 62) / 2

    );

    const y = snap(

      (e.clientY - map.top) / scale -

        (tables[draggingIndex].h || 48) / 2

    );

    setTables((prev) =>

      prev.map((t, i) =>

        i === draggingIndex ? { ...t, x, y } : t

      )

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

          height: 900,

          border: "3px solid black",

          transform: "scale(0.7)",

          transformOrigin: "top left",

        }}

      >

        {tables.map((table, index) => (

          <button

            key={table.id}

            onPointerDown={() => startDrag(index)}

            onClick={() => updateTable(index)}

            style={{

              position: "absolute",

              left: table.x,

              top: table.y,

              width: table.w,

              height: table.h,

              background: statusColor(table.status),

              border: "2px solid #1e3a8a",

              borderRadius: 8,

              fontSize: 10,

              zIndex: draggingIndex === index ? 20 : 5,

            }}

          >

            {table.id}

            <br />

            {table.seats}

            <br />

            {table.status}

            {table.server && (

              <>

                <br />

                👤 {table.server}

              </>

            )}

          </button>

        ))}

      </div>

    </main>

  );

}
