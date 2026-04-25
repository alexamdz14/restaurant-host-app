"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Reservation = {
  name: string;
  guests: number;
};

type Table = {
  number: string;
  seats: number;
  status: TableStatus;
  guest?: string;
};

export default function HomePage() {
  const [reservations, setReservations] = useState<Reservation[]>([
    { name: "Smith", guests: 2 },
    { name: "Garcia", guests: 4 },
  ]);

  const [selectedGuest, setSelectedGuest] = useState<Reservation | null>(null);

  const [tables, setTables] = useState<Table[]>([
    { number: "1", seats: 4, status: "Open" },
    { number: "2", seats: 4, status: "Open" },
    { number: "3", seats: 2, status: "Open" },
    { number: "4", seats: 2, status: "Open" },
    { number: "5", seats: 2, status: "Open" },
    { number: "6", seats: 4, status: "Open" },
    { number: "7", seats: 4, status: "Open" },

    { number: "Patio 1", seats: 4, status: "Open" },
    { number: "Patio 2", seats: 4, status: "Open" },
    { number: "Patio 3", seats: 4, status: "Open" },
    { number: "Patio 4", seats: 4, status: "Open" },
    { number: "Patio 5", seats: 4, status: "Open" },
    { number: "Patio 6", seats: 4, status: "Open" },
    { number: "Patio 7", seats: 4, status: "Open" },
    { number: "Patio 8", seats: 6, status: "Open" },
  ]);

  function seatGuest(tableIndex: number) {
    if (!selectedGuest) return;

    setTables(
      tables.map((t, i) =>
        i === tableIndex
          ? {
              ...t,
              status: "Seated",
              guest: selectedGuest.name,
            }
          : t
      )
    );

    setReservations(reservations.filter(r => r !== selectedGuest));
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
      tables.map((table, i) =>
        i === index
          ? { ...table, status: nextStatus(table.status), guest: undefined }
          : table
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
    <main style={{ padding: 20 }}>
      <h1>Enrique’s Host Stand</h1>

      {/* Reservations */}
      <section style={{ marginBottom: 20 }}>
        <h2>Reservations (tap to select)</h2>
        {reservations.map((r, i) => (
          <button
            key={i}
            onClick={() => setSelectedGuest(r)}
            style={{
              margin: 5,
              padding: 10,
              borderRadius: 10,
              background:
                selectedGuest?.name === r.name ? "#93c5fd" : "#fff",
              border: "1px solid #ccc",
            }}
          >
            {r.name} ({r.guests})
          </button>
        ))}
      </section>

      {/* Table Map */}
      <section>
        <h2>Tap table to seat or change status</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
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
      </section>
    </main>
  );
}
