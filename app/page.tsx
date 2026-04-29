"use client";

import { useEffect, useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Section = "Main" | "Patio" | "Lounge" | "Casa" | "San Miguel";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  status: Status;

  section: Section;

  guest?: string;

  partySize?: string;

  seatedAt?: number;

  server?: string;

  combinedId?: string;

  combinedLabel?: string;

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

const STORAGE_TABLES = "hostTables_v4";

const STORAGE_WAITLIST = "hostWaitlist_v4";

const STORAGE_ROTATION = "hostRotation_v4";

const STORAGE_SERVERS = "hostServers_v4";

const defaultServers: Record<Section, string[]> = {

  Main: ["Server 1", "Server 2", "Server 3"],

  Patio: ["Patio 1", "Patio 2"],

  Lounge: ["Lounge 1", "Lounge 2"],

  Casa: ["Casa 1", "Casa 2"],

  "San Miguel": ["SM 1", "SM 2"],

};

const defaultRotation: Record<Section, number> = {

  Main: 0,

  Patio: 0,

  Lounge: 0,

  Casa: 0,

  "San Miguel": 0,

};

function makeTable(

  id: string,

  seats: string,

  x: number,

  y: number,

  w = 62,

  h = 48,

  section: Section = "Main"

): TableItem {

  return {

    id,

    seats,

    x: snap(x),

    y: snap(y),

    w: snap(w),

    h: snap(h),

    status: "Open",

    section,

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

  const [combineMode, setCombineMode] = useState(false);

  const [selectedCombineIds, setSelectedCombineIds] = useState<string[]>([]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [partySize, setPartySize] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  const [servers, setServers] = useState<Record<Section, string[]>>(defaultServers);

  const [rotation, setRotation] = useState<Record<Section, number>>(defaultRotation);

  const [, setTick] = useState(0);

  const selectedParty = waitlist.find((p) => p.id === selectedPartyId);

  const selectedSize = selectedParty ? parseInt(selectedParty.size, 10) : 0;

  const bestTable =

    selectedParty && !Number.isNaN(selectedSize)

      ? tables

          .filter((t) => t.status === "Open" && availableSeats(t, tables) >= selectedSize)

          .sort(

            (a, b) =>

              availableSeats(a, tables) -

              selectedSize -

              (availableSeats(b, tables) - selectedSize)

          )[0]

      : undefined;

  function availableSeats(table: TableItem, allTables: TableItem[]) {

    if (!table.combinedId) return seatNumber(table.seats);

    return allTables

      .filter((t) => t.combinedId === table.combinedId)

      .reduce((sum, t) => sum + seatNumber(t.seats), 0);

  }

  function estimatedWait(size: string) {

    const party = parseInt(size, 10);

    if (Number.isNaN(party)) return "~?";

    const openFit = tables.some(

      (t) => t.status === "Open" && availableSeats(t, tables) >= party

    );

    if (openFit) return "now";

    const seatedFits = tables

      .filter((t) => t.status === "Seated" && availableSeats(t, tables) >= party)

      .map((t) => {

        const minsSat = t.seatedAt

          ? Math.floor((Date.now() - t.seatedAt) / 60000)

          : 0;

        return Math.max(10, 80 - minsSat);

      });

    if (seatedFits.length > 0) return `~${Math.min(...seatedFits)} min`;

    const dirtyFit = tables.some(

      (t) => t.status === "Dirty" && availableSeats(t, tables) >= party

    );

    if (dirtyFit) return "~10 min";

    const boxedFit = tables.some(

      (t) => t.status === "Boxed" && availableSeats(t, tables) >= party

    );

    if (boxedFit) return "~20 min";

    return "no fit";

  }

  useEffect(() => {

    try {

      const savedTables = localStorage.getItem(STORAGE_TABLES);

      const savedWaitlist = localStorage.getItem(STORAGE_WAITLIST);

      const savedRotation = localStorage.getItem(STORAGE_ROTATION);

      const savedServers = localStorage.getItem(STORAGE_SERVERS);

      if (savedTables) {

        const parsed = JSON.parse(savedTables);

        if (Array.isArray(parsed) && parsed.length === defaultTables.length) {

          setTables(parsed);

        }

      }

      if (savedWaitlist) setWaitlist(JSON.parse(savedWaitlist));

      if (savedRotation) setRotation(JSON.parse(savedRotation));

      if (savedServers) setServers(JSON.parse(savedServers));

    } catch {

      localStorage.removeItem(STORAGE_TABLES);

      localStorage.removeItem(STORAGE_WAITLIST);

      localStorage.removeItem(STORAGE_ROTATION);

      localStorage.removeItem(STORAGE_SERVERS);

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(STORAGE_TABLES, JSON.stringify(tables));

  }, [tables]);

  useEffect(() => {

    localStorage.setItem(STORAGE_WAITLIST, JSON.stringify(waitlist));

  }, [waitlist]);

  useEffect(() => {

    localStorage.setItem(STORAGE_ROTATION, JSON.stringify(rotation));

  }, [rotation]);

  useEffect(() => {

    localStorage.setItem(STORAGE_SERVERS, JSON.stringify(servers));

  }, [servers]);

  useEffect(() => {

    const timer = setInterval(() => setTick((n) => n + 1), 60000);

    return () => clearInterval(timer);

  }, []);

  function getNextServer(section: Section) {

    const list = servers[section]?.filter(Boolean) || [];

    if (list.length === 0) return "";

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

    if (combineMode) {

      const id = tables[index].id;

      setSelectedCombineIds((prev) =>

        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]

      );

      return;

    }

    if (selectedParty && tables[index].status === "Open") {

      const server = getNextServer(tables[index].section);

      const combinedId = tables[index].combinedId;

      setTables((prev) =>

        prev.map((table, i) => {

          const sameCombo = combinedId && table.combinedId === combinedId;

          if (i === index || sameCombo) {

            return {

              ...table,

              status: "Seated",

              guest: selectedParty.name,

              partySize: selectedParty.size,

              seatedAt: Date.now(),

              server,

            };

          }

          return table;

        })

      );

      setWaitlist((prev) => prev.filter((p) => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      return;

    }

    setTables((prev) =>

      prev.map((table, i) => {

        if (i !== index) return table;

        const nextStatus = cycle[(cycle.indexOf(table.status) + 1) % cycle.length];

        return {

          ...table,

          status: nextStatus,

          seatedAt: nextStatus === "Seated" ? Date.now() : undefined,

          guest: nextStatus === "Open" ? undefined : table.guest,

          partySize: nextStatus === "Open" ? undefined : table.partySize,

          server:

            nextStatus === "Seated"

              ? getNextServer(table.section)

              : nextStatus === "Open"

              ? undefined

              : table.server,

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

    const combinedId = tables[index].combinedId;

    setTables((prev) =>

      prev.map((table, i) => {

        const sameCombo = combinedId && table.combinedId === combinedId;

        if (i === index || sameCombo) {

          return {

            ...table,

            status: "Open",

            guest: undefined,

            partySize: undefined,

            seatedAt: undefined,

            server: undefined,

          };

        }

        return table;

      })

    );

  }

  function combineSelectedTables() {

    if (selectedCombineIds.length < 2) return;

    const comboId = `combo-${Date.now()}`;

    const selectedTables = tables.filter((t) => selectedCombineIds.includes(t.id));

    const totalSeats = selectedTables.reduce((sum, t) => sum + seatNumber(t.seats), 0);

    const label = `${selectedCombineIds.join("+")} = ${totalSeats}`;

    setTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? {

              ...table,

              combinedId: comboId,

              combinedLabel: label,

            }

          : table

      )

    );

    setSelectedCombineIds([]);

  }

  function uncombineSelectedTables() {

    setTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? {

              ...table,

              combinedId: undefined,

              combinedLabel: undefined,

            }

          : table

      )

    );

    setSelectedCombineIds([]);

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

      (e.clientX - map.left) / scale - tables[draggingIndex].w / 2

    );

    const y = snap(

      (e.clientY - map.top) / scale - tables[draggingIndex].h / 2

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

  function resetAll() {

    localStorage.removeItem(STORAGE_TABLES);

    localStorage.removeItem(STORAGE_WAITLIST);

    localStorage.removeItem(STORAGE_ROTATION);

    localStorage.removeItem(STORAGE_SERVERS);

    setTables(defaultTables);

    setWaitlist([]);

    setRotation(defaultRotation);

    setServers(defaultServers);

    setSelectedPartyId(null);

    setSelectedCombineIds([]);

  }

  function updateServerList(section: Section, value: string) {

    setServers((prev) => ({

      ...prev,

      [section]: value

        .split(",")

        .map((s) => s.trim())

        .filter(Boolean),

    }));

  }

  const wall = (x: number, y: number, w: number, h: number) => (

  const sectionBackground = (

  x: number,

  y: number,

  w: number,

  h: number,

  color: string

) => (

  <div

    style={{

      position: "absolute",

      left: x,

      top: y,

      width: w,

      height: h,

      background: color,

      borderRadius: 12,

      zIndex: 0,

      pointerEvents: "none",

    }}

  />

);
  
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

          gap: 8,

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

          onClick={() => setCombineMode(!combineMode)}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: combineMode ? "#c4b5fd" : "white",

            fontWeight: "bold",

          }}

        >

          {combineMode ? "Combining ON" : "Combine Tables"}

        </button>

        {combineMode && (

          <>

            <button onClick={combineSelectedTables} style={{ padding: "8px 12px" }}>

              Combine Selected

            </button>

            <button onClick={uncombineSelectedTables} style={{ padding: "8px 12px" }}>

              Uncombine Selected

            </button>

            <button

              onClick={() => setSelectedCombineIds([])}

              style={{ padding: "8px 12px" }}

            >

              Clear Selection

            </button>

          </>

        )}

        <button

          onClick={resetAll}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: "#fee2e2",

            fontWeight: "bold",

          }}

        >

          Reset All

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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>

        {(Object.keys(servers) as Section[]).map((section) => (

          <label key={section} style={{ fontSize: 12 }}>

            {section}:{" "}

            <input

              value={servers[section].join(", ")}

              onChange={(e) => updateServerList(section, e.target.value)}

              style={{ padding: 4, width: 180 }}

            />

          </label>

        ))}

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

              {party.name} - {party.size} ({minutesSince(party.createdAt)}) | Wait{" "}

              {estimatedWait(party.size)}

            </button>

            <button onClick={() => removeFromWaitlist(party.id)}>X</button>

          </div>

        ))}

      </div>

      {combineMode && (

        <div style={{ marginBottom: 8, fontWeight: "bold" }}>

          Selected to combine:{" "}

          {selectedCombineIds.length > 0 ? selectedCombineIds.join(", ") : "none"}

        </div>

      )}

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

          {sectionBackground(20, 15, 1160, 95, "rgba(34,197,94,0.08)")}   // Patio

          {sectionBackground(20, 120, 1180, 470, "rgba(59,130,246,0.06)")} // Main

          {sectionBackground(250, 600, 520, 150, "rgba(14,165,233,0.08)")} // Bar

          {sectionBackground(20, 760, 760, 270, "rgba(168,85,247,0.07)")} // Lounge

          {sectionBackground(790, 760, 420, 270, "rgba(249,115,22,0.08)")} // Casa

          {sectionBackground(1240, 120, 250, 520, "rgba(239,68,68,0.07)")} // San Miguel
         
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

            <div style={{ height: 110, padding: 14, fontWeight: "bold", fontSize: 18 }}>

              PODIUM:<br />

              SEATER 1:<br />

              SEATER 2:<br />

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

              GUEST NAME:<br /><br />

              ARRIVAL TIME:<br /><br />

              GUESTS:<br /><br />

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

              GUEST NAME:<br /><br />

              ARRIVAL TIME:<br /><br />

              GUEST COUNT:<br /><br />

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

              availableSeats(table, tables) >= selectedSize;

            const isBestTable = bestTable?.id === table.id;

            const isSelectedForCombine = selectedCombineIds.includes(table.id);

            return (

              <button

                key={table.id}

                onPointerDown={(e) => {

                  e.preventDefault();

                  startDrag(index);

                }}

                onDoubleClick={() => clearTable(index)}

                onClick={() => updateTable(index)}

                title={table.combinedLabel || ""}

                style={{

                  position: "absolute",

                  left: table.x,

                  top: table.y,

                  width: table.w,

                  height: table.h,

                  background: isSelectedForCombine

                    ? "#ddd6fe"

                    : fitsSelectedParty

                    ? isBestTable

                      ? "#86efac"

                      : "#dcfce7"

                    : statusColor(table.status),

                  border:

                    isSelectedForCombine

                      ? "4px solid #7c3aed"

                      : table.combinedId

                      ? "4px solid #a855f7"

                      : table.status === "Boxed"

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

                {table.guest

                  ? `${table.guest} ${table.partySize}`

                  : table.combinedId

                  ? `${availableSeats(table, tables)} seats`

                  : table.seats}

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

        Combine Mode: select 2+ tables, then tap Combine Selected. Waitlist shows

        estimated wait. Green tables fit selected party. Purple border = combined

        tables.

      </p>

    </main>

  );

}
