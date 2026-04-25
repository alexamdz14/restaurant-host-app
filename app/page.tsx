"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Guest = {
  name: string;
  guests: number;
  type: "Reservation" | "Waitlist";
  pager?: string;
};

type Table = {
  number: string;
  seats: number;
  status: TableStatus;
  guest?: string;
};

export default function HomePage() {
  const [reservations, setReservations] = useState<Guest[]>([
    { name: "Smith", guests: 2, type: "Reservation" },
    { name: "Garcia", guests: 4, type: "Reservation" },
  ]);

  const [waitlist, setWaitlist] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [newName, setNewName] = useState("");
  const [newGuests, setNewGuests] = useState("");

  const [waitName, setWaitName] = useState("");
  const [waitGuests, setWaitGuests] = useState("");
  const [waitPager, setWaitPager] = useState("");

  const [tables, setTables] = useState<Table[]>([
    { number: "L1", seats: 4, status: "Open" },
    { number: "L2", seats: 4, status: "Open" },
    { number: "L3", seats: 4, status: "Open" },
    { number: "L4", seats: 6, status: "Open" },
    { number: "L5", seats: 8, status: "Open" },
    { number: "L6", seats: 4, status: "Open" },
    { number: "L7", seats: 4, status: "Open" },
    { number: "L8", seats: 4, status: "Open" },
    { number: "L9", seats: 2, status: "Open" },
    { number: "L10", seats: 6, status: "Open" },

    { number: "1", seats: 4, status: "Open" },
    { number: "2", seats: 4, status: "Open" },
    { number: "3", seats: 2, status: "Open" },
    { number: "4", seats: 2, status: "Open" },
    { number: "5", seats: 2, status: "Open" },
    { number: "6", seats: 4, status: "Open" },
    { number: "7", seats: 4, status: "Open" },
    { number: "9", seats: 4, status: "Open" },
    { number: "10", seats: 4, status: "Open" },
    { number: "11", seats: 4, status: "Open" },
    { number: "12", seats: 7, status: "Open" },
    { number: "13", seats: 4, status: "Open" },
    { number: "14", seats: 4, status: "Open" },
    { number: "15", seats: 4, status: "Open" },
    { number: "16", seats: 4, status: "Open" },
    { number: "17", seats: 4, status: "Open" },
    { number: "18", seats: 5, status: "Open" },
    { number: "19", seats: 5, status: "Open" },
    { number: "20", seats: 4, status: "Open" },
    { number: "21", seats: 4, status: "Open" },
    { number: "22", seats: 4, status: "Open" },
    { number: "23", seats: 4, status: "Open" },
    { number: "24", seats: 4, status: "Open" },
    { number: "26", seats: 4, status: "Open" },
    { number: "27", seats: 4, status: "Open" },
    { number: "28", seats: 4, status: "Open" },
    { number: "29", seats: 4, status: "Open" },
    { number: "30", seats: 5, status: "Open" },
    { number: "31", seats: 5, status: "Open" },
    { number: "32", seats: 4, status: "Open" },
    { number: "33", seats: 4, status: "Open" },
    { number: "34", seats: 6, status: "Open" },
    { number: "35", seats: 6, status: "Open" },
    { number: "36", seats: 6, status: "Open" },
    { number: "37", seats: 5, status: "Open" },
    { number: "38", seats: 7, status: "Open" },

    { number: "Casa 1", seats: 4, status: "Open" },
    { number: "Casa 2", seats: 4, status: "Open" },
    { number: "Casa 3", seats: 4, status: "Open" },
    { number: "Casa 4", seats: 4, status: "Open" },
    { number: "Casa 5", seats: 4, status: "Open" },
    { number: "Casa 6", seats: 4, status: "Open" },
    { number: "Casa 7", seats: 4, status: "Open" },
    { number: "Casa 8", seats: 4, status: "Open" },
    { number: "Casa 9", seats: 4, status: "Open" },
    { number: "Casa 10", seats: 4, status: "Open" },

    { number: "San Miguel 1", seats: 12, status: "Open" },
    { number: "San Miguel 2", seats: 12, status: "Open" },

    { number: "Patio 1", seats: 4, status: "Open" },
    { number: "Patio 2", seats: 4, status: "Open" },
    { number: "Patio 3", seats: 4, status: "Open" },
    { number: "Patio 4", seats: 4, status: "Open" },
    { number: "Patio 5", seats: 4, status: "Open" },
    { number: "Patio 6", seats: 4, status: "Open" },
    { number: "Patio 7", seats: 4, status: "Open" },
    { number: "Patio 8", seats: 6, status: "Open" },
  ]);

  function addReservation() {
    if (!newName || !newGuests) return;

    setReservations([
      ...reservations,
      { name: newName, guests: Number(newGuests), type: "Reservation" },
    ]);

    setNewName("");
    setNewGuests("");
  }

  function addWaitlistGuest() {
    if (!waitName || !waitGuests) return;

    setWaitlist([
      ...waitlist,
      {
        name: waitName,
        guests: Number(waitGuests),
        pager: waitPager,
        type: "Waitlist",
      },
    ]);

    setWaitName("");
    setWaitGuests("");
    setWaitPager("");
  }

  function seatGuest(index: number) {
    if (!selectedGuest) return;

    setTables(
      tables.map((t, i) =>
        i === index
          ? { ...t, status: "Seated", guest: selectedGuest.name }
          : t
      )
    );

    if (selectedGuest.type === "Reservation") {
      setReservations(reservations.filter((r) => r !== selectedGuest));
    } else {
      setWaitlist(waitlist.filter((w) => w !== selectedGuest));
    }

    setSelectedGuest(null);
  }

  function nextStatus(status: TableStatus): TableStatus {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function updateTable(index: number) {
    if (selectedGuest) {
      seatGuest(index);
      return;
    }

    setTables(
      tables.map((t, i) =>
        i === index
          ? { ...t, status: nextStatus(t.status), guest: undefined }
          : t
      )
    );
  }

  function statusColor(status: TableStatus) {
    if (status === "Open") return "#d4edda";
    if (status === "Seated") return "#f8d7da";
    if (status === "Dirty") return "#e5e7eb";
    return "#dbeafe";
  }

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Enrique’s Host Stand</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>Add Reservation</h2>
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          placeholder="Guests"
          value={newGuests}
          onChange={(e) => setNewGuests(e.target.value)}
        />
        <button onClick={addReservation}>Add Reservation</button>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Reservations</h2>
        {reservations.map((r, i) => (
          <button
            key={i}
            onClick={() => setSelectedGuest(r)}
            style={{
              margin: 5,
              padding: 10,
              background: selectedGuest === r ? "#93c5fd" : "#fff",
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          >
            {r.name} ({r.guests})
          </button>
        ))}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Add Waitlist Guest</h2>
        <input
          placeholder="Name"
          value={waitName}
          onChange={(e) => setWaitName(e.target.value)}
        />
        <input
          placeholder="Guests"
          value={waitGuests}
          onChange={(e) => setWaitGuests(e.target.value)}
        />
        <input
          placeholder="Pager #"
          value={waitPager}
          onChange={(e) => setWaitPager(e.target.value)}
        />
        <button onClick={addWaitlistGuest}>Add to Waitlist</button>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Waitlist</h2>
        {waitlist.length === 0 && <p>No guests waiting.</p>}
        {waitlist.map((w, i) => (
          <button
            key={i}
            onClick={() => setSelectedGuest(w)}
            style={{
              display: "block",
              marginBottom: 8,
              padding: 10,
              background: selectedGuest === w ? "#93c5fd" : "#fff",
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          >
            {w.name} ({w.guests}) {w.pager ? `— Pager ${w.pager}` : ""}
          </button>
        ))}
      </section>

      <h2>Table Map</h2>
      <p>
        Tap a reservation or waitlist guest, then tap a table to seat them.
        Without a selected guest, tapping cycles table status.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        {tables.map((table, i) => (
          <button
            key={i}
            onClick={() => updateTable(i)}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 10,
              background: statusColor(table.status),
            }}
          >
            <h3>{table.number}</h3>
            <p>{table.seats} seats</p>
            <strong>{table.status}</strong>
            {table.guest && <p>👤 {table.guest}</p>}
          </button>
        ))}
      </div>
    </main>
  );
}
