"use client";

import { useState } from "react";

export default function HomePage() {
  const [reservations, setReservations] = useState([
    { name: "Smith", time: "6:00 PM", guests: 2 },
    { name: "Garcia", time: "6:15 PM", guests: 4 },
  ]);

  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");

  const addReservation = () => {
    if (!name || !time || !guests) return;

    setReservations([
      ...reservations,
      { name, time, guests: Number(guests) },
    ]);

    setName("");
    setTime("");
    setGuests("");
  };

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Enrique’s Host Stand</h1>

      {/* Add Reservation */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          placeholder="Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
        <button onClick={addReservation}>Add</button>
      </div>

      {/* Reservation List */}
      <div>
        {reservations.map((r, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              marginBottom: 10,
              border: "1px solid #ccc",
              borderRadius: 10,
            }}
          >
            <strong>{r.name}</strong> — {r.time} — {r.guests} guests
          </div>
        ))}
      </div>
    </main>
  );
}
