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

  guest?: string;

  partySize?: string;

  seatedAt?: number;

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

function minutesSince(time?: number) {

  if (!time) return "";

  const mins = Math.floor((Date.now() - time) / 60000);

  return mins >= 60

    ? `${Math.floor(mins / 60)}h ${mins % 60}m`

    : `${mins}m`;

}

function seatNumber(seats: string) {

  const n = parseInt(seats, 10);

  return Number.isNaN(n) ? 0 : n;

}

// 🔥 your full floor layout preserved

const defaultTables: TableItem[] = [

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

];

export default function Home() {

  const [editMode, setEditMode] = useState(false);

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [partySize, setPartySize] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  const [, setTick] = useState(0);

  const selectedParty = waitlist.find(p => p.id === selectedPartyId);

  const selectedSize = selectedParty ? parseInt(selectedParty.size) : 0;

  const bestTable = tables.find(

    t => t.status === "Open" && seatNumber(t.seats) >= selectedSize

  );

  useEffect(() => {

    const t = setInterval(() => setTick(n => n + 1), 60000);

    return () => clearInterval(t);

  }, []);

  function addToWaitlist() {

    if (!guestName || !partySize) return;

    setWaitlist(prev => [

      ...prev,

      { id: Date.now(), name: guestName, size: partySize, createdAt: Date.now() }

    ]);

    setGuestName("");

    setPartySize("");

  }

  function updateTable(index: number) {

    if (selectedParty && tables[index].status === "Open") {

      setTables(prev =>

        prev.map((t, i) =>

          i === index

            ? { ...t, status: "Seated", guest: selectedParty.name, partySize: selectedParty.size, seatedAt: Date.now() }

            : t

        )

      );

      setWaitlist(prev => prev.filter(p => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      return;

    }

  }

  return (

    <main style={{ padding: 10 }}>

      <h1>Host Map</h1>

      <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Name" />

      <input value={partySize} onChange={e => setPartySize(e.target.value)} placeholder="#" />

      <button onClick={addToWaitlist}>Add</button>

      <div>

        {waitlist.map(p => (

          <button key={p.id} onClick={() => setSelectedPartyId(p.id)}>

            {p.name} ({p.size}) - {minutesSince(p.createdAt)}

          </button>

        ))}

      </div>

      <div style={{ position: "relative", width: 1500, height: 1000 }}>

        {tables.map((t, i) => (

          <button

            key={t.id}

            onClick={() => updateTable(i)}

            style={{

              position: "absolute",

              left: t.x,

              top: t.y,

              width: t.w,

              height: t.h,

              background:

                selectedParty && seatNumber(t.seats) >= selectedSize

                  ? t.id === bestTable?.id

                    ? "#4ade80"

                    : "#bbf7d0"

                  : statusColor(t.status)

            }}

          >

            {t.id}

            <br />

            {t.guest || t.seats}

            <br />

            {t.status === "Seated" ? minutesSince(t.seatedAt) : t.status}

          </button>

        ))}

      </div>

    </main>

  );

}
