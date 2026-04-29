"use client";

import { useEffect, useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Section = "Main" | "Patio" | "Lounge" | "Casa" | "San Miguel";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w?: number;

  h?: number;

  status: Status;

  guest?: string;

  partySize?: string;

  seatedAt?: number;

  server?: string;

  section: Section;

};

type WaitParty = {

  id: number;

  name: string;

  size: string;

  createdAt: number;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const serversBySection: Record<Section, string[]> = {

  Main: ["Server 1", "Server 2", "Server 3"],

  Patio: ["Patio 1", "Patio 2"],

  Lounge: ["Lounge 1", "Lounge 2"],

  Casa: ["Casa 1", "Casa 2"],

  "San Miguel": ["SM 1", "SM 2"],

};

const makeTable = (

  id: string,

  seats: string,

  x: number,

  y: number,

  w = 62,

  h = 48,

  section: Section = "Main"

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

  if (status === "Dirty") return "#f87171";

  return "#e5e7eb";

}

function minutesSince(time?: number) {

  if (!time) return "";

  const mins = Math.floor((Date.now() - time) / 60000);

  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

}

function seatNumber(seats: string) {

  const n = parseInt(seats, 10);

  return Number.isNaN(n) ? 0 : n;

}

const defaultTables: TableItem[] = [

  makeTable("P1", "4", 55, 35, 55, 58, "Patio"),

  makeTable("P2", "4", 145, 35, 55, 58, "Patio"),

  makeTable("P3", "4", 380, 35, 55, 58, "Patio"),

  makeTable("P4", "4", 470, 35, 55, 58, "Patio"),

  makeTable("P5", "4", 665, 35, 55, 58, "Patio"),

  makeTable("P6", "4", 755, 35, 55, 58, "Patio"),

  makeTable("P7", "4", 965, 35, 55, 58, "Patio"),

  makeTable("P8", "6", 1055, 35, 55, 58, "Patio"),

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

  makeTable("DL4", "4", 45, 775, 75, 42, "Lounge"),

  makeTable("DL3", "4", 45, 860, 75, 42, "Lounge"),

  makeTable("DL2", "4", 45, 945, 75, 42, "Lounge"),

  makeTable("DL1", "4", 145, 940, 70, 58, "Lounge"),

  makeTable("L10", "6", 250, 815, 92, 42, "Lounge"),

  makeTable("L9", "2", 250, 885, 58, 42, "Lounge"),

  makeTable("L1", "4", 390, 775, 78, 42, "Lounge"),

  makeTable("L2", "4", 490, 775, 78, 42, "Lounge"),

  makeTable("L3", "4", 590, 775, 78, 42, "Lounge"),

  makeTable("L4", "6", 670, 860, 75, 42, "Lounge"),

  makeTable("L11", "Couch", 435, 855, 58, 46, "Lounge"),

  makeTable("L12", "Couch", 520, 855, 58, 46, "Lounge"),

  makeTable("L8", "4", 385, 930, 52, 75, "Lounge"),

  makeTable("L7", "4", 475, 930, 52, 75, "Lounge"),

  makeTable("L6", "4", 565, 930, 52, 75, "Lounge"),

  makeTable("L5", "8", 670, 930, 82, 70, "Lounge"),

  makeTable("Casa 8", "4", 840, 790, 55, 82, "Casa"),

  makeTable("Casa 1", "4", 955, 790, 55, 82, "Casa"),

  makeTable("Casa 2", "4", 1070, 790, 55, 82, "Casa"),

  makeTable("Casa 7", "4", 800, 885, 80, 42, "Casa"),

  makeTable("Casa 9", "4", 910, 885, 80, 42, "Casa"),

  makeTable("Casa 10", "4", 1020, 885, 80, 42, "Casa"),

  makeTable("Casa 3", "4", 1110, 885, 65, 42, "Casa"),

  makeTable("Casa 6", "4", 850, 960, 60, 42, "Casa"),

  makeTable("Casa 5", "4", 960, 960, 60, 42, "Casa"),

  makeTable("Casa 4", "4", 1070, 960, 60, 42, "Casa"),

  makeTable("San Miguel 1", "12", 1310, 410, 145, 60, "San Miguel"),

  makeTable("San Miguel 2", "12", 1310, 510, 145, 60, "San Miguel"),

];

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [partySize, setPartySize] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  const [rotation, setRotation] = useState<Record<Section, number>>({

    Main: 0,

    Patio: 0,

    Lounge: 0,

    Casa: 0,

    "San Miguel": 0,

  });

  const [, setTick] = useState(0);

  const selectedParty = waitlist.find((p) => p.id === selectedPartyId);

  const selectedSize = selectedParty ? parseInt(selectedParty.size, 10) : 0;

  const bestTable =

    selectedParty && !Number.isNaN(selectedSize)

      ? tables

          .filter((t) => t.status === "Open" && seatNumber(t.seats) >= selectedSize)

          .sort(

            (a, b) =>

              seatNumber(a.seats) -

              selectedSize -

              (seatNumber(b.seats) - selectedSize)

          )[0]

      : undefined;

  useEffect(() => {

    const savedTables = localStorage.getItem("floorTables");

    const savedWaitlist = localStorage.getItem("waitlist");

    const savedRotation = localStorage.getItem("serverRotation");

    if (savedTables) setTables(JSON.parse(savedTables));

    if (savedWaitlist) setWaitlist(JSON.parse(savedWaitlist));

    if (savedRotation) setRotation(JSON.parse(savedRotation));

  }, []);

  useEffect(() => {

    localStorage.setItem("floorTables", JSON.stringify(tables));

  }, [tables]);

  useEffect(() => {

    localStorage.setItem("waitlist", JSON.stringify(waitlist));

  }, [waitlist]);

  useEffect(() => {

    localStorage.setItem("serverRotation", JSON.stringify(rotation));

  }, [rotation]);

  useEffect(() => {

    const timer = setInterval(() => setTick((n) => n + 1), 60000);

    return () => clearInterval(timer);

  }, []);

  function getNextServer(section: Section) {

    const list = serversBySection[section];

    const index = rotation[section] ?? 0;

    const server = list[index % list.length];

    setRotation((prev) => ({

      ...prev,

      [section]: (index + 1) % list.length,

    }));

    return server;

  }

  function updateTable(index: number) {

    if (editMode) return;

    if (selectedParty && tables[index].status === "Open") {

      const server = getNextServer(tables[index].section);

      setTables((prev) =>

        prev.map((table, i) =>

          i === index

            ? {

                ...table,

                status: "Seated",

                guest: selectedParty.name,

                partySize: selectedParty.size,

                seatedAt: Date.now(),

                server,

              }

            : table

        )

      );

      setWaitlist((prev) => prev.filter((p) => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      return;

    }

    setTables((prev) =>

      prev.map((table, i) => {

        if (i !== index) return table;

        const nextStatus = cycle[(cycle.indexOf(table.status) + 1) % cycle.length];

        const server =

          nextStatus === "Seated" ? getNextServer(table.section) : table.server;

        return {

          ...table,

          status: nextStatus,

          seatedAt: nextStatus === "Seated" ? Date.now() : undefined,

          guest: nextStatus === "Seated" ? table.guest : undefined,

          partySize: nextStatus === "Seated" ? table.partySize : undefined,

          server: nextStatus === "Open" ? undefined : server,

        };

      })

    );

  }

  function addToWaitlist() {

    if (!guestName.trim() || !partySize.trim()) return;

    setWaitlist((prev) => [

      ...prev,

      {

        id: Date.now(),

        name: guestName.trim(),

        size: partySize.trim(),

        createdAt: Date.now(),

      },

    ]);

    setGuestName("");

    setPartySize("");

  }

  function removeFromWaitlist(id: number) {

    setWaitlist((prev) => prev.filter((p) => p.id !== id));

    if (selectedPartyId === id) setSelectedPartyId(null);

  }

  function clearTable(index: number) {

    setTables((prev) =>

      prev.map((table, i) =>

        i === index

          ? {

              ...table,

              status: "Open",

              guest: undefined,

              partySize: undefined,

              seatedAt: undefined,

              server: undefined,

            }

          : table

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

    const x = snap(

      (e.clientX - map.left) / scale - (tables[draggingIndex].w || 62) / 2

    );

    const y = snap(

      (e.clientY - map.top) / scale - (tables[draggingIndex].h || 48) / 2

    );

    setTables((prev) =>

      prev.map((table, i) =>

        i === draggingIndex ? { ...table, x, y } : table

      )

    );

  }

  function stopDrag() {

    setDraggingIndex(null);

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

      <div

        style={{

          display: "flex",

          alignItems: "center",

          gap: 10,

          marginBottom: 8,

          flexWrap: "wrap",

        }}

      >

        <h1 style={{ margin: 0, fontSize: 34 }}>Host Map</h1>

        <button

          onClick={() => setEditMode(!editMode)}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: editMode ? "#fde68a" : "white",

            fontWeight: "bold",

          }}

        >

          {editMode ? "Editing ON" : "Service Mode"}

        </button>

        <button

          onClick={() => {

            localStorage.removeItem("floorTables");

            setTables(defaultTables);

          }}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: "#fee2e2",

            fontWeight: "bold",

          }}

        >

          Reset Layout

        </button>

        <input

          value={guestName}

          onChange={(e) => setGuestName(e.target.value)}

          placeholder="Guest name"

          style={{ padding: 8 }}

        />

        <input

          value={partySize}

          onChange={(e) => setPartySize(e.target.value)}

          placeholder="#"

          style={{ padding: 8, width: 55 }}

        />

        <button onClick={addToWaitlist} style={{ padding: "8px 12px" }}>

          Add Wait

        </button>

      </div>

      {selectedParty && (

        <div

          style={{

            marginBottom: 8,

            padding: 8,

            background: "#fde68a",

            border: "2px solid #111827",

            borderRadius: 8,

            fontWeight: "bold",

            display: "inline-block",

          }}

        >

          Selected: {selectedParty.name} - {selectedParty.size}

          {bestTable ? ` | Best table: ${bestTable.id}` : " | No open table fits"}

        </div>

      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>

        {waitlist.map((party) => (

          <div

            key={party.id}

            style={{

              display: "flex",

              gap: 4,

              alignItems: "center",

              padding: 6,

              borderRadius: 8,

              border:

                selectedPartyId === party.id

                  ? "3px solid #f59e0b"

                  : "2px solid #111827",

              background: selectedPartyId === party.id ? "#fde68a" : "white",

              fontWeight: "bold",

            }}

          >

            <button

              onClick={() => setSelectedPartyId(party.id)}

              style={{

                border: "none",

                background: "transparent",

                fontWeight: "bold",

              }}

            >

              {party.name} - {party.size} ({minutesSince(party.createdAt)})

            </button>

            <button onClick={() => removeFromWaitlist(party.id)}>X</button>

          </div>

        ))}

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

            transform: "scale(0.74)",

            transformOrigin: "top left",

            marginBottom: -270,

            touchAction: editMode ? "none" : "auto",

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

          {tables.map((table, index) => {

            const fitsSelectedParty =

              selectedParty &&

              table.status === "Open" &&

              seatNumber(table.seats) >= selectedSize;

            const isBestTable = bestTable?.id === table.id;

            return (

              <button

                key={table.id}

                onPointerDown={(e) => {

                  e.preventDefault();

                  startDrag(index);

                }}

                onDoubleClick={() => clearTable(index)}

                onClick={() => updateTable(index)}

                style={{

                  position: "absolute",

                  left: table.x,

                  top: table.y,

                  width: table.w,

                  height: table.h,

                  background: fitsSelectedParty

                    ? isBestTable

                      ? "#86efac"

                      : "#dcfce7"

                    : statusColor(table.status),

                  border:

                    table.status === "Boxed"

                      ? "4px solid #f59e0b"

                      : isBestTable

                      ? "4px solid #16a34a"

                      : editMode

                      ? "3px dashed #111827"

                      : "2px solid #1e3a8a",

                  borderRadius: 8,

                  color: "#006ee6",

                  fontWeight: "bold",

                  fontSize: 10,

                  lineHeight: 1.05,

                  overflow: "hidden",

                  zIndex: draggingIndex === index ? 20 : 5,

                  touchAction: "none",

                  cursor: editMode ? "grab" : "pointer",

                }}

              >

                {table.id}

                <br />

                {table.guest ? `${table.guest} ${table.partySize}` : table.seats}

                <br />

                {table.status === "Seated" ? minutesSince(table.seatedAt) : table.status}

                {table.server && (

                  <>

                    <br />

                    {table.server}

                  </>

                )}

              </button>

            );

          })}

        </div>

      </div>

      <p style={{ marginTop: 8, fontSize: 14 }}>

        Service Mode: tap table to cycle status. Select a waitlist guest, then tap

        an open table to seat them. Dirty tables are red. Green tables fit the

        selected party. Dark green border = best table. Double tap table to clear.

        Editing ON: drag tables.

      </p>

    </main>

  );

}
