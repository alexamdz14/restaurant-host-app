"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Guest = {
  name: string;
  guests: number;
  type: "Reservation" | "Waitlist";
};

type Table = {
  number: string;
  seats: number;
  section: string;
  status: TableStatus;
  guest?: string;
  server?: string;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"map" | "book">("map");

  const [reservations, setReservations] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [name, setName] = useState("");
  const [guests, setGuests] = useState("");

  const [tables, setTables] = useState<Table[]>([
    { number: "L1", seats: 4, section: "Lounge", status: "Open" },
    { number: "L2", seats: 4, section: "Lounge", status: "Open" },
    { number: "L3", seats: 4, section: "Lounge", status: "Open" },
    { number: "L4", seats: 6, section: "Lounge", status: "Open" },

    { number: "1", seats: 4, section: "Dining", status: "Open" },
    { number: "2", seats: 4, section: "Dining", status: "Open" },
    { number: "3", seats: 2, section: "Dining", status: "Open" },
    { number: "4", seats: 2, section: "Dining", status: "Open" },

    { number: "Patio 1", seats: 4, section: "Patio", status: "Open" },
    { number: "Patio 2", seats: 4, section: "Patio", status: "Open" },

    { number: "Casa 1", seats: 4, section: "Casa", status: "Open" },
    { number: "Casa 2", seats: 4, section: "Casa", status: "Open" },

    { number: "San Miguel 1", seats: 12, section: "San Miguel", status: "Open" },
  ]);

  function addReservation() {
    if (!name || !guests) return;

    setReservations([
      ...reservations,
      { name, guests: Number(guests), type: "Reservation" },
    ]);

    setName("");
    setGuests("");
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

    setReservations(reservations.filter((r) => r !== selectedGuest));
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

  function renderSection(section: string) {
    return (
      <div style={{ marginBottom: 20 }}>
        <h3>{section}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {tables
            .filter((t) => t.section === section)
            .map((table, i) => {
              const index = tables.indexOf(table);
              return (
                <button
                  key={table.number}
                  onClick={() => updateTable(index)}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: statusColor(table.status),
                    border: "1px solid #ccc",
                  }}
                >
                  <strong>{table.number}</strong>
                  <br />
                  {table.seats} seats
                  <br />
                  {table.status}
                  {table.guest && <div>👤 {table.guest}</div>}
                </button>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Enrique’s Host Stand</h1>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("map")}>Host Map</button>
        <button onClick={() => setActiveTab("book")}>Reservation Book</button>
      </div>

      {/* Reservation Book */}
      {activeTab === "book" && (
        <>
          <h2>Reservation Book</h2>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
          <button onClick={addReservation}>Add</button>

          <div style={{ marginTop: 20 }}>
            {reservations.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedGuest(r);
                  setActiveTab("map");
                }}
                style={{
                  display: "block",
                  marginBottom: 10,
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 10,
                }}
              >
                {r.name} — {r.guests}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Host Map */}
      {activeTab === "map" && (
        <>
          <h2>Host Map</h2>
          <p>Tap reservation → tap table to seat</p>

          {renderSection("Lounge")}
          {renderSection("Dining")}
          {renderSection("Patio")}
          {renderSection("Casa")}
          {renderSection("San Miguel")}
        </>
      )}
    </main>
  );
}
