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
    // Patio - top row
    { number: "P1", seats: 4, section: "Patio", status: "Open", x: 5, y: 2, w: 7, h: 6 },
    { number: "P2", seats: 4, section: "Patio", status: "Open", x: 14, y: 2, w: 7, h: 6 },
    { number: "P3", seats: 4, section: "Patio", status: "Open", x: 30, y: 2, w: 7, h: 6 },
    { number: "P4", seats: 4, section: "Patio", status: "Open", x: 39, y: 2, w: 7, h: 6 },
    { number: "P5", seats: 4, section: "Patio", status: "Open", x: 55, y: 2, w: 7, h: 6 },
    { number: "P6", seats: 4, section: "Patio", status: "Open", x: 64, y: 2, w: 7, h: 6 },
    { number: "P7", seats: 4, section: "Patio", status: "Open", x: 78, y: 2, w: 7, h: 6 },
    { number: "P8", seats: 6, section: "Patio", status: "Open", x: 87, y: 2, w: 8, h: 6 },

    // Upper left / take-out side
    { number: "19", seats: 5, section: "Dining", status: "Open", x: 3, y: 12, w: 8, h: 10 },
    { number: "18", seats: 5, section: "Dining", status: "Open", x: 4, y: 27, w: 9, h: 6 },
    { number: "17", seats: 4, section: "Dining", status: "Open", x: 15, y: 27, w: 8, h: 6 },
    { number: "16", seats: 4, section: "Dining", status: "Open", x: 24, y: 27, w: 8, h: 6 },

    // Upper center
    { number: "20", seats: 4, section: "Dining", status: "Open", x: 16, y: 12, w: 7, h: 5 },
    { number: "21", seats: 4, section: "Dining", status: "Open", x: 24, y: 12, w: 7, h: 5 },
    { number: "22", seats: 4, section: "Dining", status: "Open", x: 34, y: 11, w: 6, h: 6 },
    { number: "23", seats: 4, section: "Dining", status: "Open", x: 42, y: 11, w: 6, h: 6 },
    { number: "24", seats: 4, section: "Dining", status: "Open", x: 50, y: 11, w: 6, h: 6 },

    { number: "15", seats: 4, section: "Dining", status: "Open", x: 33, y: 25, w: 8, h: 6 },
    { number: "14", seats: 4, section: "Dining", status: "Open", x: 43, y: 25, w: 8, h: 6 },
    { number: "13", seats: 4, section: "Dining", status: "Open", x: 53, y: 25, w: 8, h: 6 },
    { number: "9", seats: 4, section: "Dining", status: "Open", x: 33, y: 34, w: 8, h: 6 },
    { number: "10", seats: 4, section: "Dining", status: "Open", x: 43, y: 34, w: 8, h: 6 },
    { number: "11", seats: 4, section: "Dining", status: "Open", x: 53, y: 34, w: 8, h: 6 },

    { number: "7", seats: 4, section: "Dining", status: "Open", x: 35, y: 43, w: 7, h: 7 },
    { number: "6", seats: 4, section: "Dining", status: "Open", x: 47, y: 43, w: 7, h: 7 },

    // Center/right upper
    { number: "26", seats: 4, section: "Dining", status: "Open", x: 63, y: 12, w: 8, h: 5 },
    { number: "27", seats: 4, section: "Dining", status: "Open", x: 73, y: 12, w: 8, h: 5 },
    { number: "28", seats: 4, section: "Dining", status: "Open", x: 83, y: 12, w: 6, h: 5 },
    { number: "29", seats: 4, section: "Dining", status: "Open", x: 91, y: 12, w: 6, h: 5 },

    { number: "32", seats: 4, section: "Dining", status: "Open", x: 67, y: 23, w: 6, h: 10 },
    { number: "31", seats: 5, section: "Dining", status: "Open", x: 77, y: 33, w: 10, h: 7 },
    { number: "30", seats: 5, section: "Dining", status: "Open", x: 88, y: 33, w: 10, h: 7 },
    { number: "33", seats: 4, section: "Dining", status: "Open", x: 67, y: 37, w: 6, h: 10 },

    { number: "34", seats: 6, section: "Dining", status: "Open", x: 70, y: 55, w: 7, h: 10 },
    { number: "35", seats: 6, section: "Dining", status: "Open", x: 80, y: 55, w: 7, h: 10 },
    { number: "36", seats: 6, section: "Dining", status: "Open", x: 90, y: 55, w: 7, h: 10 },
    { number: "37", seats: 5, section: "Dining", status: "Open", x: 95, y: 45, w: 5, h: 8 },
    { number: "38", seats: 7, section: "Dining", status: "Open", x: 95, y: 25, w: 5, h: 10 },

    // Near bar / entrance
    { number: "1", seats: 4, section: "Dining", status: "Open", x: 9, y: 50, w: 9, h: 5 },
    { number: "2", seats: 4, section: "Dining", status: "Open", x: 9, y: 43, w: 9, h: 5 },
    { number: "3", seats: 2, section: "Dining", status: "Open", x: 30, y: 50, w: 7, h: 5 },
    { number: "4", seats: 2, section: "Dining", status: "Open", x: 39, y: 50, w: 7, h: 5 },

    // Lounge / Diamante bottom left
    { number: "L1", seats: 4, section: "Lounge", status: "Open", x: 35, y: 70, w: 8, h: 5 },
    { number: "L2", seats: 4, section: "Lounge", status: "Open", x: 46, y: 70, w: 8, h: 5 },
    { number: "L3", seats: 4, section: "Lounge", status: "Open", x: 57, y: 70, w: 8, h: 5 },
    { number: "L4", seats: 6, section: "Lounge", status: "Open", x: 62, y: 81, w: 8, h: 7 },
    { number: "L5", seats: 8, section: "Lounge", status: "Open", x: 55, y: 91, w: 9, h: 8 },
    { number: "L6", seats: 4, section: "Lounge", status: "Open", x: 47, y: 91, w: 7, h: 7 },
    { number: "L7", seats: 4, section: "Lounge", status: "Open", x: 38, y: 91, w: 7, h: 7 },
    { number: "L8", seats: 4, section: "Lounge", status: "Open", x: 29, y: 91, w: 7, h: 7 },
    { number: "L9", seats: 2, section: "Lounge", status: "Open", x: 22, y: 82, w: 6, h: 6 },
    { number: "L10", seats: 6, section: "Lounge", status: "Open", x: 20, y: 76, w: 10, h: 5 },

    // Casa bottom right
    { number: "Casa 1", seats: 4, section: "Casa", status: "Open", x: 75, y: 74, w: 7, h: 7 },
    { number: "Casa 2", seats: 4, section: "Casa", status: "Open", x: 88, y: 74, w: 7, h: 7 },
    { number: "Casa 3", seats: 4, section: "Casa", status: "Open", x: 87, y: 86, w: 10, h: 5 },
    { number: "Casa 4", seats: 4, section: "Casa", status: "Open", x: 90, y: 95, w: 7, h: 5 },
    { number: "Casa 5", seats: 4, section: "Casa", status: "Open", x: 78, y: 95, w: 7, h: 5 },
    { number: "Casa 6", seats: 4, section: "Casa", status: "Open", x: 67, y: 95, w: 7, h: 5 },
    { number: "Casa 7", seats: 4, section: "Casa", status: "Open", x: 70, y: 86, w: 8, h: 5 },
    { number: "Casa 9", seats: 4, section: "Casa", status: "Open", x: 78, y: 86, w: 8, h: 5 },

    // San Miguel right side
    { number: "San Miguel 1", seats: 12, section: "San Miguel", status: "Open", x: 80, y: 16, w: 18, h: 8 },
    { number: "San Miguel 2", seats: 12, section: "San Miguel", status: "Open", x: 80, y: 29, w: 18, h: 8 },
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
              border: "4px solid #111827",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* Area labels */}
            <div style={{ position: "absolute", left: "5%", top: "0.5%", fontWeight: "bold" }}>Patio</div>
            <div style={{ position: "absolute", left: "4%", top: "36%", fontWeight: "bold" }}>Waiting Area</div>
            <div style={{ position: "absolute", left: "33%", top: "67%", fontWeight: "bold" }}>Diamante Lounge</div>
            <div style={{ position: "absolute", left: "78%", top: "68%", fontWeight: "bold" }}>Casa</div>
            <div style={{ position: "absolute", left: "82%", top: "12%", fontWeight: "bold" }}>San Miguel</div>

            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: "29%",
                top: "56%",
                width: "36%",
                height: "8%",
                borderRadius: 22,
                border: "4px solid #64748b",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 22,
                color: "#334155",
              }}
            >
              BAR
            </div>

            {/* Walkways / walls */}
            <div
              style={{
                position: "absolute",
                left: "31%",
                top: "18%",
                width: "33%",
                height: "5%",
                background: "rgba(255,255,255,0.55)",
                border: "2px dashed #9ca3af",
                textAlign: "center",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              DO NOT BLOCK
            </div>

            <div
              style={{
                position: "absolute",
                left: "30%",
                top: "42%",
                width: "33%",
                height: "5%",
                background: "rgba(255,255,255,0.55)",
                border: "2px dashed #9ca3af",
                textAlign: "center",
                fontWeight: "bold",
                color: "#6b7280",
              }}
            >
              DO NOT BLOCK
            </div>

            <div
              style={{
                position: "absolute",
                left: "66%",
                top: "48%",
                width: "30%",
                height: "4%",
                background: "white",
                border: "1px solid #94a3b8",
                textAlign: "center",
                fontSize: 11,
              }}
            >
              Buffet
            </div>

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
                  borderRadius: 10,
                  fontSize: 10,
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
