"use client";

import { useEffect, useRef, useState } from "react";

import { supabase } from "./supabaseClient";

import { ENRIQUES_TABLES } from "./data/enriquesLayout";

import { STATUS_COLORS, TableItem, TableStatus,WaitParty,ServerInfo,} from "./types/host";

const STATUS_ORDER: TableStatus[] = ["Open", "Seated", "Boxed", "Dirty"];

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

export default function Home() {

  const [tables, setTables] = useState<TableItem[]>(ENRIQUES_TABLES);

  const [loaded, setLoaded] = useState(false);

  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const [pin, setPin] = useState("");

  const [floorLocked, setFloorLocked] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const lastLocalSaveRef = useRef(0);

  async function saveTablesNow(nextTables: TableItem[]) {

    const updatedAt = Date.now();

    lastLocalSaveRef.current = updatedAt;

    await supabase.from("host_tables").upsert({

    id: "main",

    data: {

      tables: nextTables,

      updatedAt,

    },

  });

}

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [guestSize, setGuestSize] = useState("");

  const [guestPhone, setGuestPhone] = useState("");

  const [guestNotes, setGuestNotes] = useState("");

  const [quotedWait, setQuotedWait] = useState("");

  const openCount = tables.filter((t) => t.status === "Open").length;

  const seatedCount = tables.filter((t) => t.status === "Seated").length;

  const boxedCount = tables.filter((t) => t.status === "Boxed").length;

  const dirtyCount = tables.filter((t) => t.status === "Dirty").length;

  useEffect(() => {

  async function loadData() {

    const { data: tableData } = await supabase

      .from("host_tables")

      .select("data")

      .eq("id", "main")

      .maybeSingle();

    if (tableData?.data?.tables) {

      setTables(tableData.data.tables);

    } else {

      await supabase.from("host_tables").upsert({

        id: "main",

        data: { tables: ENRIQUES_TABLES },

      });

    }

    const { data: waitData } = await supabase

      .from("host_waitlist")

      .select("data")

      .order("id", { ascending: true });

    if (waitData) {

      setWaitlist(waitData.map((row) => row.data as WaitParty));

    }

    setLoaded(true);

  }

  loadData();

  const channel = supabase

    .channel("host-v2-sync")

    .on(

      "postgres_changes",

      { event: "*", schema: "public", table: "host_tables" },

      async () => {

        const { data } = await supabase

          .from("host_tables")

          .select("data")

          .eq("id", "main")

          .maybeSingle();

        if (data?.data?.tables) {

          const cloudUpdatedAt = data.data.updatedAt || 0;

          if (cloudUpdatedAt >= lastLocalSaveRef.current) {

          setTables(data.data.tables);

          }

        }

      }

    )

    .on(

      "postgres_changes",

      { event: "*", schema: "public", table: "host_waitlist" },

      async () => {

        const { data } = await supabase

          .from("host_waitlist")

          .select("data")

          .order("id", { ascending: true });

        if (data) {

          setWaitlist(data.map((row) => row.data as WaitParty));

        }

      }

    )

    .subscribe();

  return () => {

    supabase.removeChannel(channel);

  };

}, []);

  useEffect(() => {

    if (!loaded) return;

    const timer = setTimeout(() => {

      saveTablesNow(tables);

    }, 500);

    return () => clearTimeout(timer);

  }, [tables, loaded]);

  function unlockManager() {

    if (pin.trim() === "1884") {

      setManagerUnlocked(true);

      setPin("");

    } else {

      alert("Wrong manager PIN");

    }

  }

  async function cycleTable(id: string) {

  if (editMode) return;

  const nextTables = tables.map((table) => {

    if (table.id !== id) return table;

    const currentIndex = STATUS_ORDER.indexOf(table.status);

    const nextStatus =

      STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

    return {

      ...table,

      status: nextStatus,

      seatedAt: nextStatus === "Seated" ? Date.now() : table.seatedAt,

      guest: nextStatus === "Open" ? undefined : table.guest,

      partySize: nextStatus === "Open" ? undefined : table.partySize,

      server: nextStatus === "Open" ? undefined : table.server,

    };

  });

  setTables(nextTables);

  await saveTablesNow(nextTables);

}

  function clearBoard() {

    if (!managerUnlocked) {

      alert("Manager must unlock first.");

      return;

    }

    const okay = confirm("Clear all tables for end of night?");

    if (!okay) return;

    setTables((prev) =>

      prev.map((table) => ({

        ...table,

        status: "Open",

        guest: undefined,

        partySize: undefined,

        server: undefined,

        seatedAt: undefined,

      }))

    );

  }

  function startDrag(id: string) {

    if (!editMode || floorLocked) return;

    setDraggingId(id);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (!draggingId || !editMode || floorLocked) return;

    const map = e.currentTarget.getBoundingClientRect();

    const scale = map.width / 1500;

    const x = snap((e.clientX - map.left) / scale);

    const y = snap((e.clientY - map.top) / scale);

    setTables((prev) =>

      prev.map((table) =>

        table.id === draggingId

          ? {

              ...table,

              x: snap(x - table.w / 2),

              y: snap(y - table.h / 2),

            }

          : table

      )

    );

  }

  function stopDrag() {

    setDraggingId(null);

  }

  const wall = (x: number, y: number, w: number, h: number) => (

    <div

      key={`${x}-${y}-${w}-${h}`}

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

    <main

      style={{

        minHeight: "100vh",

        background: "#f4f1e8",

        padding: 16,

        fontFamily: "Arial",

      }}

    >

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          alignItems: "center",

          marginBottom: 12,

        }}

      >

        <h1 style={{ margin: 0 }}>

  Enrique’s OS

  <div style={{ fontSize: 13, color: "#475569", fontWeight: "normal" }}>

    Host • Reservations • Waitlist • Manager

  </div>

</h1>

        {!managerUnlocked ? (

          <>

            <input

              type="password"

              value={pin}

              onChange={(e) => setPin(e.target.value)}

              placeholder="Manager PIN"

              style={{

                padding: 8,

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            />

            <button onClick={unlockManager}>Unlock</button>

          </>

        ) : (

          <button onClick={() => setManagerUnlocked(false)}>

            Manager Unlocked

          </button>

        )}

        <button

          onClick={() => setEditMode((prev) => !prev)}

          disabled={!managerUnlocked}

        >

          {editMode ? "Editing ON" : "Service Mode"}

        </button>

        <button

          onClick={() => setFloorLocked((prev) => !prev)}

          disabled={!managerUnlocked}

        >

          {floorLocked ? "Floor Locked" : "Floor Unlocked"}

        </button>

        <button onClick={clearBoard}>Clear Host Board</button>

      </div>

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          marginBottom: 12,

        }}

      >

        <Summary label="Open" value={openCount} color={STATUS_COLORS.Open} />

        <Summary label="Seated" value={seatedCount} color={STATUS_COLORS.Seated} />

        <Summary label="Boxed" value={boxedCount} color={STATUS_COLORS.Boxed} />

        <Summary label="Dirty" value={dirtyCount} color={STATUS_COLORS.Dirty} />

      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>

        <div

          onPointerMove={dragTable}

          onPointerUp={stopDrag}

          onPointerCancel={stopDrag}

          style={{

            position: "relative",

            width: 1500,

            height: 1040,

            background: "#fbfaf5",

            border: "4px solid #111827",

            overflow: "hidden",

            touchAction: editMode && !floorLocked ? "none" : "auto",

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

          <Label x={810} y={600} w={275} h={48} text="Buffet" />

          <Label x={310} y={625} w={335} h={85} text="BAR" blue />

          <Label x={95} y={520} w={150} h={38} text="Take-Out" />

          <Label x={1225} y={735} w={255} h={290} text="Casa 1884" />

          <Label x={1240} y={120} w={245} h={300} text="San Miguel" />

          {tables.map((table) => (

            <div

              key={table.id}

              onPointerDown={() => startDrag(table.id)}

              onClick={() => cycleTable(table.id)}

              style={{

                position: "absolute",

                left: table.x,

                top: table.y,

                width: table.w,

                height: table.h,

                background: STATUS_COLORS[table.status],

                border: "3px solid #111827",

                borderRadius: table.seats === "Couch" ? 16 : 8,

                zIndex: 5,

                display: "flex",

                flexDirection: "column",

                justifyContent: "center",

                alignItems: "center",

                fontWeight: "bold",

                cursor: editMode && !floorLocked ? "grab" : "pointer",

                userSelect: "none",

                textAlign: "center",

                fontSize: 13,

              }}

            >

              <div>{table.id}</div>

              <div style={{ fontSize: 11 }}>{table.seats}</div>

              <div style={{ fontSize: 10 }}>{table.status}</div>

            </div>

          ))}

        </div>

      </div>

      <p style={{ fontSize: 13, color: "#475569" }}>

        Dirty tables are red. Manager PIN is 1884. Floor must be unlocked to move

        tables.

      </p>

<section

  style={{

    marginTop: 16,

    background: "white",

    border: "3px solid #111827",

    borderRadius: 10,

    padding: 12,

  }}

>

  <h2 style={{ marginTop: 0 }}>Waitlist</h2>

  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" />

    <input value={guestSize} onChange={(e) => setGuestSize(e.target.value)} placeholder="Party size" />

    <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone" />

    <input value={quotedWait} onChange={(e) => setQuotedWait(e.target.value)} placeholder="Quoted wait" />

    <input value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} placeholder="Notes" />

    <button

      onClick={async () => {

        if (!guestName.trim() || !guestSize.trim()) return;

        const party: WaitParty = {

          id: Date.now(),

          name: guestName.trim(),

          size: guestSize.trim(),

          phone: guestPhone.trim(),

          notes: guestNotes.trim(),

          quotedWait: quotedWait.trim() || "15-20",

          status: "Waiting",

          createdAt: Date.now(),

        };

        await supabase.from("host_waitlist").insert({

          id: party.id,

          data: party,

        });

        setGuestName("");

        setGuestSize("");

        setGuestPhone("");

        setGuestNotes("");

        setQuotedWait("");

      }}

    >

      Add Wait

    </button>

  </div>

  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>

    {waitlist.map((party) => (

      <div

        key={party.id}

        style={{

          border: "2px solid #111827",

          borderRadius: 8,

          padding: 10,

          background: party.status === "Paged" ? "#fde68a" : "#f8fafc",

          minWidth: 220,

        }}

      >

        <b>{party.name}</b> — {party.size}

        <br />

        Phone: {party.phone || "N/A"}

        <br />

        Wait: {party.quotedWait}

        <br />

        Status: {party.status}

        <br />

        {party.notes && <>Notes: {party.notes}<br /></>}

        <button

          onClick={async () => {

            await supabase.from("host_waitlist").update({

              data: { ...party, status: "Paged" },

            }).eq("id", party.id);

          }}

        >

          Page

        </button>{" "}

        <button

          onClick={async () => {

            await supabase.from("host_waitlist").delete().eq("id", party.id);

          }}

        >

          Remove

        </button>

      </div>

    ))}

  </div>

</section>
      
    </main>

  );

}

function Summary({

  label,

  value,

  color,

}: {

  label: string;

  value: number;

  color: string;

}) {

  return (

    <div

      style={{

        background: color,

        border: "2px solid #111827",

        borderRadius: 8,

        padding: 10,

        minWidth: 130,

      }}

    >

      <b>{label}</b>

      <div style={{ fontSize: 28 }}>{value}</div>

    </div>

  );

}

function Label({

  x,

  y,

  w,

  h,

  text,

  blue,

}: {

  x: number;

  y: number;

  w: number;

  h: number;

  text: string;

  blue?: boolean;

}) {

  return (

    <div

      style={{

        position: "absolute",

        left: x,

        top: y,

        width: w,

        height: h,

        background: blue ? "#dbeafe" : "#fffdf7",

        border: "4px solid #111827",

        zIndex: 2,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontWeight: "bold",

        fontSize: 22,

        textAlign: "center",

      }}

    >

      {text}

    </div>

  );

}
