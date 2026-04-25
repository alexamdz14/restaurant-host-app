"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Guest = {
  name: string;
  guests: number;
  type: "Reservation";
};

type Table = {
  number: string;
  seats: number;
  section: string;
  status: TableStatus;
  x: number;
  y: number;
  w: number;
  h: number;
  guest?: string;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"map" | "book">("map");
  const [reservations, setReservations] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [name, setName] = useState("");
  const [guests, setGuests] = useState("");

  const [tables, setTables] = useState<Table[]>([
    // Lounge / Diamante
    { number: "L1", seats: 4, section: "Lounge", status: "Open", x: 4, y: 8, w: 9, h: 7 },
    { number: "L2", seats: 4, section: "Lounge", status: "Open", x: 15, y: 8, w: 9, h: 7 },
    { number: "L3", seats: 4, section: "Lounge", status: "Open", x: 26, y: 8, w: 9, h: 7 },
    { number: "L4", seats: 6, section: "Lounge", status: "Open", x: 4, y: 18, w: 13, h: 8 },
    { number: "L5", seats: 8, section: "Lounge", status: "Open", x: 19, y: 18, w: 16, h: 8 },
    { number: "L6", seats: 4, section: "Lounge", status: "Open", x: 4, y: 29, w: 9, h: 7 },
    { number: "L7", seats: 4, section: "Lounge", status: "Open", x: 15, y: 29, w: 9, h: 7 },
    { number: "L8", seats: 4, section: "Lounge", status: "Open", x: 26, y: 29, w: 9, h: 7 },
    { number: "L9", seats: 2, section: "Lounge", status: "Open", x: 4, y: 40, w: 8, h: 7 },
    { number: "L10", seats: 6, section: "Lounge", status: "Open", x: 15, y: 40, w: 14, h: 7 },

    // Main dining
    { number: "1", seats: 4, section: "Dining", status: "Open", x: 43, y: 8, w: 9, h: 7 },
    { number: "2", seats: 4, section: "Dining", status: "Open", x: 54, y: 8, w: 9, h: 7 },
    { number: "3", seats: 2, section: "Dining", status: "Open", x: 66, y: 8, w: 8, h: 7 },
    { number: "4", seats: 2, section: "Dining", status: "Open", x: 76, y: 8, w: 8, h: 7 },
    { number: "5", seats: 2, section: "Dining", status: "Open", x: 86, y: 8, w: 8, h: 7 },

    { number: "6", seats: 4, section: "Dining", status: "Open", x: 43, y: 20, w: 9, h: 7 },
    { number: "7", seats: 4, section: "Dining", status: "Open", x: 54, y: 20, w: 9, h: 7 },
    { number: "9", seats: 4, section: "Dining", status: "Open", x: 66, y: 20, w: 9, h: 7 },
    { number: "10", seats: 4, section: "Dining", status: "Open", x: 77, y: 20, w: 9, h: 7 },
    { number: "11", seats: 4, section: "Dining", status: "Open", x: 88, y: 20, w: 9, h: 7 },

    { number: "12", seats: 7, section: "Dining", status: "Open", x: 43, y: 32, w: 13, h: 8 },
    { number: "13", seats: 4, section: "Dining", status: "Open", x: 59, y: 32, w: 9, h: 7 },
    { number: "14", seats: 4, section: "Dining", status: "Open", x: 70, y: 32, w: 9, h: 7 },
    { number: "15", seats: 4, section: "Dining", status: "Open", x: 81, y: 32, w: 9, h: 7 },
    { number: "16", seats: 4, section: "Dining", status: "Open", x: 92, y: 32, w: 7, h: 7 },

    { number: "17", seats: 4, section: "Dining", status: "Open", x: 43, y: 44, w: 9, h: 7 },
    { number: "18", seats: 5, section: "Dining", status: "Open", x: 54, y: 44, w: 10, h: 7 },
    { number: "19", seats: 5, section: "Dining", status: "Open", x: 66, y: 44, w: 10, h: 7 },
    { number: "20", seats: 4, section: "Dining", status: "Open", x: 78, y: 44, w: 9, h: 7 },
    { number: "21", seats: 4, section: "Dining", status: "Open", x: 89, y: 44, w: 9, h: 7 },

    { number: "22", seats: 4, section: "Dining", status: "Open", x: 43, y: 56, w: 9, h: 7 },
    { number: "23", seats: 4, section: "Dining", status: "Open", x: 54, y: 56, w: 9, h: 7 },
    { number: "24", seats: 4, section: "Dining", status: "Open", x: 65, y: 56, w: 9, h: 7 },
    { number: "26", seats: 4, section: "Dining", status: "Open", x: 76, y: 56, w: 9, h: 7 },
    { number: "27", seats: 4, section: "Dining", status: "Open", x: 87, y: 56, w: 9, h: 7 },

    { number: "28", seats: 4, section: "Dining", status: "Open", x: 43, y: 68, w: 9, h: 7 },
    { number: "29", seats: 4, section: "Dining", status: "Open", x: 54, y: 68, w: 9, h: 7 },
    { number: "30", seats: 5, section: "Dining", status: "Open", x: 65, y: 68, w: 10, h: 7 },
    { number: "31", seats: 5, section: "Dining", status: "Open", x: 77, y: 68, w: 10, h: 7 },
    { number: "32", seats: 4, section: "Dining", status: "Open", x: 89, y: 68, w: 9, h: 7 },

    { number: "33", seats: 4, section: "Dining", status: "Open", x: 43, y: 80, w: 9, h: 7 },
    { number: "34", seats: 6, section: "Dining", status: "Open", x: 54, y: 80, w: 12, h: 8 },
    { number: "35", seats: 6, section: "Dining", status: "Open", x: 68, y: 80, w: 12, h: 8 },
    { number: "36", seats: 6, section: "Dining", status: "Open", x: 82, y: 80, w: 12, h: 8 },
    { number: "37", seats: 5, section: "Dining", status: "Open", x: 43, y: 91, w: 10, h: 7 },
    { number: "38", seats: 7, section: "Dining", status: "Open", x: 56, y: 91, w: 13, h: 7 },

    // Patio
    { number: "Patio 1", seats: 4, section: "Patio", status: "Open", x: 4, y: 55, w: 10, h: 7 },
    { number: "Patio 2", seats: 4, section: "Patio", status: "Open", x: 16, y: 55, w: 10, h: 7 },
    { number: "Patio 3", seats: 4, section: "Patio", status: "Open", x: 28, y: 55, w: 10, h: 7 },
    { number: "Patio 4", seats: 4, section: "Patio", status: "Open", x: 4, y: 65, w: 10, h: 7 },
    { number: "Patio 5", seats: 4, section: "Patio", status: "Open", x: 16, y: 65, w: 10, h: 7 },
    { number: "Patio 6", seats: 4, section: "Patio", status: "Open", x: 28, y: 65, w: 10, h: 7 },
    { number: "Patio 7", seats: 4, section: "Patio", status: "Open", x: 4, y: 75, w: 10, h: 7 },
    { number: "Patio 8", seats: 6, section: "Patio", status: "Open", x: 18, y: 75, w: 14, h: 8 },

    // Banquet rooms
    { number: "Casa 1", seats: 4, section: "Casa", status: "Open", x: 4, y: 88, w: 8, h: 6 },
    { number: "Casa 2", seats: 4, section: "Casa", status: "Open", x: 14, y: 88, w: 8, h: 6 },
    { number: "Casa 3", seats: 4, section: "Casa", status: "Open", x: 24, y: 88, w: 8, h: 6 },
    { number: "Casa 4", seats: 4, section: "Casa", status: "Open", x: 4, y: 95, w: 8, h: 5 },
    { number: "Casa 5", seats: 4, section: "Casa", status: "Open", x: 14, y: 95, w: 8, h: 5 },
    { number: "Casa 6", seats: 4, section: "Casa", status: "Open", x: 24, y: 95, w: 8, h: 5 },

    { number: "San Miguel 1", seats: 12, section: "San Miguel", status: "Open", x: 72, y: 91, w: 12, h: 8 },
    { number: "San Miguel 2", seats: 12, section: "San Miguel", status: "Open", x: 86, y: 91, w: 12, h: 8 },
  ]);

  function addReservation() {
    if (!name || !guests) return;

    setReservations([...reservations, { name, guests: Number(guests), type: "Reservation" }]);
    setName("");
    setGuests("");
  }

  function seatGuest(index: number) {
    if (!selectedGuest) return;

    setTables(
      tables.map((table, i) =>
        i === index ? { ...table, status: "Seated", guest: selectedGuest.name } : table
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
      tables.map((table, i) =>
        i === index
          ? { ...table, status: nextStatus(table.status), guest: undefined }
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
    <main style={{ padding: 20, fontFamily: "Arial", background: "#f5f7fb" }}>
      <h1>Enrique’s Host Stand</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("map")}>Host Map</button>
        <button onClick={() => setActiveTab("book")}>Reservation Book</button>
      </div>

      {activeTab === "book" && (
        <section style={{ background: "white", padding: 16, borderRadius: 16 }}>
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
          <button onClick={addReservation}>Add Reservation</button>

          <div style={{ marginTop: 20 }}>
            {reservations.length === 0 && <p>No reservations yet.</p>}
            {reservations.map((reservation, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedGuest(reservation);
                  setActiveTab("map");
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 10,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #ccc",
                  background: selectedGuest === reservation ? "#93c5fd" : "white",
                }}
              >
                <strong>{reservation.name}</strong> — {reservation.guests} guests
              </button>
            ))}
          </div>
        </section>
      )}

      {activeTab === "map" && (
        <section>
          <h2>Host Map</h2>
          <p>
            Tap a reservation in the Reservation Book, then tap a table to seat.
            Tap tables with no selected guest to cycle Open → Seated → Dirty → Ready.
          </p>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 900,
              background: "#f8f5ef",
              border: "3px solid #111827",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "38%",
                top: "38%",
                width: "18%",
                height: "18%",
                borderRadius: 24,
                border: "3px solid #94a3b8",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#334155",
              }}
            >
              BAR
            </div>

            <div style={{ position: "absolute", left: "4%", top: "3%", fontWeight: "bold" }}>Lounge</div>
            <div style={{ position: "absolute", left: "43%", top: "3%", fontWeight: "bold" }}>Main Dining</div>
            <div style={{ position: "absolute", left: "4%", top: "51%", fontWeight: "bold" }}>Patio</div>
            <div style={{ position: "absolute", left: "4%", top: "85%", fontWeight: "bold" }}>Casa</div>
            <div style={{ position: "absolute", left: "72%", top: "88%", fontWeight: "bold" }}>San Miguel</div>

            {tables.map((table, index) => (
              <button
                key={table.number}
                onClick={() => updateTable(index)}
                style={{
                  position: "absolute",
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  width: `${table.w}%`,
                  height: `${table.h}%`,
                  background: statusColor(table.status),
                  border: "2px solid #334155",
                  borderRadius: 12,
                  fontSize: 11,
                  padding: 2,
                  textAlign: "center",
                  overflow: "hidden",
                }}
              >
                <strong>{table.number}</strong>
                <br />
                {table.seats}
                <br />
                {table.status}
                {table.guest && (
                  <>
                    <br />
                    👤 {table.guest}
                  </>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
