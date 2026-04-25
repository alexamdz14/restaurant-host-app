"use client";

import { useState } from "react";

type Reservation = {
  name: string;
  time: string;
  guests: number;
};

type WaitlistGuest = {
  name: string;
  guests: number;
  phone: string;
  pager: string;
  quotedWait: string;
};

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type RestaurantTable = {
  number: string;
  seats: number;
  status: TableStatus;
};

export default function HomePage() {
  const [reservations, setReservations] = useState<Reservation[]>([
    { name: "Smith", time: "6:00 PM", guests: 2 },
    { name: "Garcia", time: "6:15 PM", guests: 4 },
  ]);

  const [waitlist, setWaitlist] = useState<WaitlistGuest[]>([]);

  const [tables, setTables] = useState<RestaurantTable[]>([
    { number: "1", seats: 4, status: "Open" },
    { number: "2", seats: 4, status: "Open" },
    { number: "3", seats: 2, status: "Open" },
    { number: "4", seats: 2, status: "Open" },
    { number: "5", seats: 2, status: "Open" },
    { number: "6", seats: 4, status: "Open" },
    { number: "7", seats: 4, status: "Open" },
    { number: "8", seats: 4, status: "Open" },
    { number: "9", seats: 4, status: "Open" },
    { number: "10", seats: 4, status: "Open" },
    { number: "11", seats: 4, status: "Open" },
    { number: "12", seats: 7, status: "Open" },
    { number: "L1", seats: 4, status: "Open" },
    { number: "L2", seats: 4, status: "Open" },
    { number: "L3", seats: 4, status: "Open" },
    { number: "L4", seats: 6, status: "Open" },
    { number: "L5", seats: 8, status: "Open" },
    { number: "L9", seats: 2, status: "Open" },
    { number: "L10", seats: 6, status: "Open" },
  ]);

  const [reservationName, setReservationName] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [reservationGuests, setReservationGuests] = useState("");

  const [waitName, setWaitName] = useState("");
  const [waitGuests, setWaitGuests] = useState("");
  const [waitPhone, setWaitPhone] = useState("");
  const [waitPager, setWaitPager] = useState("");
  const [quotedWait, setQuotedWait] = useState("");

  function addReservation() {
    if (!reservationName || !reservationTime || !reservationGuests) return;

    setReservations([
      ...reservations,
      {
        name: reservationName,
        time: reservationTime,
        guests: Number(reservationGuests),
      },
    ]);

    setReservationName("");
    setReservationTime("");
    setReservationGuests("");
  }

  function addWaitlistGuest() {
    if (!waitName || !waitGuests) return;

    setWaitlist([
      ...waitlist,
      {
        name: waitName,
        guests: Number(waitGuests),
        phone: waitPhone,
        pager: waitPager,
        quotedWait,
      },
    ]);

    setWaitName("");
    setWaitGuests("");
    setWaitPhone("");
    setWaitPager("");
    setQuotedWait("");
  }

  function removeWaitlistGuest(index: number) {
    setWaitlist(waitlist.filter((_, i) => i !== index));
  }

  function nextTableStatus(status: TableStatus): TableStatus {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function updateTableStatus(index: number) {
    setTables(
      tables.map((table, i) =>
        i === index
          ? { ...table, status: nextTableStatus(table.status) }
          : table
      )
    );
  }

  function statusColor(status: TableStatus) {
    if (status === "Open") return "#dcfce7";
    if (status === "Seated") return "#fecaca";
    if (status === "Dirty") return "#e5e7eb";
    return "#dbeafe";
  }

  return (
    <main
      style={{
        padding: 20,
        fontFamily: "Arial",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <h1>Enrique’s Host Stand</h1>

      <section style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <h2>Add Reservation</h2>

        <input placeholder="Name" value={reservationName} onChange={(e) => setReservationName(e.target.value)} />
        <input placeholder="Time" value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} />
        <input placeholder="Guests" value={reservationGuests} onChange={(e) => setReservationGuests(e.target.value)} />

        <button onClick={addReservation}>Add Reservation</button>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <h2>Add Walk-In / Waitlist</h2>

        <input placeholder="Guest Name" value={waitName} onChange={(e) => setWaitName(e.target.value)} />
        <input placeholder="Guests" value={waitGuests} onChange={(e) => setWaitGuests(e.target.value)} />
        <input placeholder="Phone Number" value={waitPhone} onChange={(e) => setWaitPhone(e.target.value)} />
        <input placeholder="Pager Number" value={waitPager} onChange={(e) => setWaitPager(e.target.value)} />
        <input placeholder="Quoted Wait ex: 25 min" value={quotedWait} onChange={(e) => setQuotedWait(e.target.value)} />

        <button onClick={addWaitlistGuest}>Add to Waitlist</button>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <h2>Table Map</h2>
        <p>Tap a table to change status: Open → Seated → Dirty → Ready → Open</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 10,
          }}
        >
          {tables.map((table, i) => (
            <button
              key={table.number}
              onClick={() => updateTableStatus(i)}
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                background: statusColor(table.status),
                minHeight: 80,
                cursor: "pointer",
              }}
            >
              <strong>Table {table.number}</strong>
              <br />
              {table.seats} seats
              <br />
              <span>{table.status}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <h2>Reservations</h2>

        {reservations.map((r, i) => (
          <div key={i} style={{ padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 10 }}>
            <strong>{r.name}</strong> — {r.time} — {r.guests} guests
          </div>
        ))}
      </section>

      <section style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <h2>Waitlist</h2>

        {waitlist.length === 0 && <p>No guests waiting.</p>}

        {waitlist.map((w, i) => (
          <div key={i} style={{ padding: 10, marginBottom: 10, border: "1px solid #ccc", borderRadius: 10 }}>
            <strong>{w.name}</strong> — {w.guests} guests
            <br />
            Phone: {w.phone || "N/A"}
            <br />
            Pager: {w.pager || "N/A"}
            <br />
            Quoted Wait: {w.quotedWait || "N/A"}
            <br />
            <button onClick={() => removeWaitlistGuest(i)}>Seat / Remove</button>
          </div>
        ))}
      </section>
    </main>
  );
}
