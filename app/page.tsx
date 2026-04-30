"use client";

import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  status: Status;

  guest?: string;

  partySize?: string;

  seatedAt?: number;

  server?: string;

  combinedId?: string;

};

type WaitParty = {

  id: number;

  name: string;

  size: string;

  pager?: string;

  createdAt: number;

};

/* ---------------- HELPERS ---------------- */

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

function makeTable(

  id: string,

  seats: string,

  x: number,

  y: number,

  w = 62,

  h = 48

): TableItem {

  return {

    id,

    seats,

    x: snap(x),

    y: snap(y),

    w,

    h,

    status: "Open",

  };

}

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  if (status === "Dirty") return "#f87171";

  return "#e5e7eb";

}

function minutesSince(time?: number) {

  if (!time) return "";

  const mins = Math.floor((Date.now() - time) / 60000);

  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

}

/* ---------------- SERVER COLORS ---------------- */

const serverColors = [

  "#2563eb",

  "#16a34a",

  "#dc2626",

  "#9333ea",

  "#ea580c",

  "#0891b2",

];

function getServerColor(name: string) {

  let hash = 0;

  for (let i = 0; i < name.length; i++) {

    hash = name.charCodeAt(i) + ((hash << 5) - hash);

  }

  return serverColors[Math.abs(hash) % serverColors.length];

}

/* ---------------- DEFAULT TABLES ---------------- */

const defaultTables: TableItem[] = [

  makeTable("1","4",135,665),

  makeTable("2","4",135,590),

  makeTable("13","4",605,265),

  makeTable("14","4",500,265),

  makeTable("15","4",395,265),

  makeTable("16","4",235,305),

  makeTable("17","4",140,305),

  makeTable("18","5",45,305),

  makeTable("34","6",865,455),

  makeTable("35","6",960,455),

  makeTable("36","6",1055,455),

];

/* ---------------- MAIN ---------------- */

export default function Home() {

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [editMode, setEditMode] = useState(false);

  const [dragging, setDragging] = useState<number | null>(null);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guest, setGuest] = useState("");

  const [size, setSize] = useState("");

  const [pager, setPager] = useState("");

  /* NEW */

  const [serverAssignments, setServerAssignments] = useState("");

  const [hostInfo, setHostInfo] = useState("");

  const [takeout, setTakeout] = useState("");

  const [casaInfo, setCasaInfo] = useState("");

  const [sanMiguelInfo, setSanMiguelInfo] = useState("");

  /* -------- SERVER PARSER -------- */

  function parseAssignments() {

    const map: Record<string, string> = {};

    serverAssignments.split("\n").forEach(line => {

      const [name, tables] = line.split(":");

      if (!name || !tables) return;

      tables.split(",").forEach(t => {

        map[t.trim()] = name.trim();

      });

    });

    return map;

  }

  const serverMap = parseAssignments();

  /* -------- TABLE CLICK -------- */

  function updateTable(i: number) {

    if (editMode) return;

    setTables(prev =>

      prev.map((t, idx) => {

        if (idx !== i) return t;

        const next = cycle[(cycle.indexOf(t.status)+1)%cycle.length];

        return {

          ...t,

          status: next,

          seatedAt: next === "Seated" ? Date.now() : undefined

        };

      })

    );

  }

  /* -------- DRAG -------- */

  function drag(e:any) {

    if (!editMode || dragging === null) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = snap(e.clientX - rect.left);

    const y = snap(e.clientY - rect.top);

    setTables(prev =>

      prev.map((t,i)=> i===dragging ? {...t,x,y}:t)

    );

  }

  /* -------- WAITLIST -------- */

  function addWait() {

    if (!guest || !size) return;

    setWaitlist(p => [...p,{

      id: Date.now(),

      name: guest,

      size,

      pager,

      createdAt: Date.now()

    }]);

    setGuest(""); setSize(""); setPager("");

  }

  /* ---------------- UI ---------------- */

  return (

    <main style={{padding:10}}>

      <h1>Host Map</h1>

      {/* CONTROLS */}

      <button onClick={()=>setEditMode(!editMode)}>

        {editMode ? "Editing" : "Service"}

      </button>

      <h3>Server Assignments</h3>

      <textarea

        value={serverAssignments}

        onChange={(e)=>setServerAssignments(e.target.value)}

        placeholder={`Maria: 1,2,3\nJohn: 13,14`}

        style={{width:300,height:100}}

      />

      <h3>Host / Podium</h3>

      <input value={hostInfo} onChange={e=>setHostInfo(e.target.value)} />

      <h3>Takeout</h3>

      <input value={takeout} onChange={e=>setTakeout(e.target.value)} />

      <h3>Casa</h3>

      <input value={casaInfo} onChange={e=>setCasaInfo(e.target.value)} />

      <h3>San Miguel</h3>

      <input value={sanMiguelInfo} onChange={e=>setSanMiguelInfo(e.target.value)} />

      <h3>Waitlist</h3>

      <input placeholder="Name" value={guest} onChange={e=>setGuest(e.target.value)} />

      <input placeholder="#" value={size} onChange={e=>setSize(e.target.value)} />

      <input placeholder="Pager" value={pager} onChange={e=>setPager(e.target.value)} />

      <button onClick={addWait}>Add</button>

      {/* MAP */}

      <div

        onPointerMove={drag}

        onPointerUp={()=>setDragging(null)}

        style={{position:"relative",width:1200,height:700,border:"3px solid black"}}

      >

        {tables.map((t,i)=>{

          const server = serverMap[t.id];

          const color = server ? getServerColor(server) : "#1e3a8a";

          return (

            <button

              key={t.id}

              onPointerDown={()=>setDragging(i)}

              onClick={()=>updateTable(i)}

              style={{

                position:"absolute",

                left:t.x,

                top:t.y,

                width:t.w,

                height:t.h,

                background: statusColor(t.status),

                border:`4px solid ${color}`

              }}

            >

              {t.id}<br/>

              {server && server}<br/>

              {t.status}

            </button>

          );

        })}

      </div>

      <div style={{marginTop:10}}>

        <b>Host:</b> {hostInfo}<br/>

        <b>Takeout:</b> {takeout}<br/>

        <b>Casa:</b> {casaInfo}<br/>

        <b>San Miguel:</b> {sanMiguelInfo}

      </div>

    </main>

  );

}
