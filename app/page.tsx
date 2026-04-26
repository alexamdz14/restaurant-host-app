"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Guest = {
  name: string;
  guests: number;
  type: "Reservation";
};

type Table = {
  id: string;
  seats: number;
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
    // PATIO TOP ROW
    { id: "P1", seats: 4, status: "Open", x: 4, y: 3, w: 6, h: 6 },
    { id: "P2", seats: 4, status: "Open", x: 12, y: 3, w: 6, h: 6 },
    { id: "P3", seats: 4, status: "Open", x: 27, y: 3, w: 6, h: 6 },
    { id: "P4", seats: 4, status: "Open", x: 35, y: 3, w: 6, h: 6 },
    { id: "P5", seats: 4, status: "Open", x: 51, y: 3, w: 6, h: 6 },
    { id: "P6", seats: 4, status: "Open", x: 59, y: 3, w: 6, h: 6 },
    { id: "P7", seats: 4, status: "Open", x: 73, y: 3, w: 6, h: 6 },
    { id: "P8", seats: 6, status: "Open", x: 81, y: 3, w: 6, h: 6 },

    // UPPER LEFT
    { id: "19", seats: 5, status: "Open", x: 2, y: 13, w: 6, h: 11 },
    { id: "20", seats: 4, status: "Open", x: 15, y: 12, w: 7, h: 5 },
    { id: "21", seats: 4, status: "Open", x: 23, y: 12, w: 7, h: 5 },
    { id: "18", seats: 5, status: "Open", x: 3, y: 27, w: 7, h: 5 },
    { id: "17", seats: 4, status: "Open", x: 11, y: 27, w: 7, h: 5 },
    { id: "16", seats: 4, status: "Open", x: 19, y: 27, w: 7, h: 5 },

    // MAIN CENTER LEFT
    { id: "22", seats: 4, status: "Open", x: 33, y: 12, w: 5, h: 7 },
    { id: "23", seats: 4, status: "Open", x: 39, y: 12, w: 5, h: 7 },
    { id: "24", seats: 4, status: "Open", x: 45, y: 12, w: 5, h: 7 },

    { id: "15", seats: 4, status: "Open", x: 28, y: 25, w: 7, h: 5 },
    { id: "14", seats: 4, status: "Open", x: 36, y: 25, w: 7, h: 5 },
    { id: "13", seats: 4, status: "Open", x: 44, y: 25, w: 7, h: 5 },

    { id: "9", seats: 4, status: "Open", x: 28, y: 33, w: 7, h: 5 },
    { id: "10", seats: 4, status: "Open", x: 36, y: 33, w: 7, h: 5 },
    { id: "11", seats: 4, status: "Open", x: 44, y: 33, w: 7, h: 5 },

    { id: "7", seats: 4, status: "Open", x: 31, y: 43, w: 5, h: 8 },
    { id: "6", seats: 4, status: "Open", x: 40, y: 43, w: 5, h: 8 },

    { id: "3", seats: 2, status: "Open", x: 28, y: 53, w: 5, h: 5 },
    { id: "4", seats: 2, status: "Open", x: 36, y: 53, w: 5, h: 5 },
    { id: "5", seats: 2, status: "Open", x: 44, y: 53, w: 5, h: 5 },

    // CENTER RIGHT
    { id: "26", seats: 4, status: "Open", x: 55, y: 12, w: 7, h: 5 },
    { id: "27", seats: 4, status: "Open", x: 64, y: 12, w: 7, h: 5 },
    { id: "28", seats: 4, status: "Open", x: 73, y: 12, w: 7, h: 5 },
    { id: "29", seats: 4, status: "Open", x: 82, y: 12, w: 7, h: 5 },

    { id: "32", seats: 4, status: "Open", x: 63, y: 23, w: 5, h: 9 },
    { id: "33", seats: 4, status: "Open", x: 63, y: 34, w: 5, h: 9 },

    { id: "31", seats: 5, status: "Open", x: 73, y: 28, w: 9, h: 6 },
    { id: "30", seats: 5, status: "Open", x: 82, y: 28, w: 9, h: 6 },

    { id: "34", seats: 6, status: "Open", x: 63, y: 45, w: 5, h: 9 },
    { id: "35", seats: 6, status: "Open", x: 72, y: 45, w: 5, h: 9 },
    { id: "36", seats: 6, status: "Open", x: 81, y: 45, w: 5, h: 9 },

    { id: "38", seats: 7, status: "Open", x: 91, y: 21, w: 5, h: 11 },
    { id: "37", seats: 5, status: "Open", x: 91, y: 38, w: 5, h: 10 },

    // BAR / ENTRANCE AREA
    { id: "2", seats: 4, status: "Open", x: 12, y: 55, w: 8, h: 5 },
    { id: "1", seats: 4, status: "Open", x: 12, y: 62, w: 7, h: 5 },

    // DIAMANTE / LOUNGE
    { id: "DL4", seats: 4, status: "Open", x: 4, y: 77, w: 7, h: 5 },
    { id: "DL3", seats: 4, status: "Open", x: 4, y: 86, w: 7, h: 5 },
    { id: "DL2", seats: 4, status: "Open", x: 4, y: 95, w: 7, h: 5 },
    { id: "DL1", seats: 4, status: "Open", x: 13, y: 94, w: 7, h: 6 },

    { id: "L10", seats: 6, status: "Open", x: 20, y: 80, w: 9, h: 5 },
    { id: "L9", seats: 2, status: "Open", x: 20, y: 87, w: 5, h: 5 },

    { id: "L1", seats: 4, status: "Open", x: 32, y: 77, w: 7, h: 5 },
    { id: "L2", seats: 4, status: "Open", x: 41, y: 77, w: 7, h: 5 },
    { id: "L3", seats: 4, status: "Open", x: 50, y: 77, w: 7, h: 5 },
    { id: "L4", seats: 6, status: "Open", x: 61, y: 84, w: 7, h: 5 },

    { id: "L11", seats: 0, status: "Open", x: 37, y: 86, w: 4, h: 5 },
    { id: "L12", seats: 0, status: "Open", x: 45, y: 86, w: 4, h: 5 },

    { id: "L8", seats: 4, status: "Open", x: 30, y: 93, w: 5, h: 7 },
    { id: "L7", seats: 4, status: "Open", x: 38, y: 93, w: 5, h: 7 },
    { id: "L6", seats: 4, status: "Open", x: 46, y: 93, w: 5, h: 7 },
    { id: "L5", seats: 8, status: "Open", x: 58, y: 93, w: 7, h: 7 },

    // CASA
    { id: "Casa 8", seats: 4, status: "Open", x: 71, y: 78, w: 5, h: 8 },
    { id: "Casa 1", seats: 4, status: "Open", x: 82, y: 78, w: 5, h: 8 },
    { id: "Casa 2", seats: 4, status: "Open", x: 89, y: 78, w: 5, h: 8 },
    { id: "Casa 7", seats: 4, status: "Open", x: 70, y: 88, w: 7, h: 5 },
    { id: "Casa 9", seats: 4, status: "Open", x: 78, y: 88, w: 7, h: 5 },
    { id: "Casa 10", seats: 4, status: "Open", x: 87, y: 88, w: 7, h: 5 },
    { id: "Casa 3", seats: 4, status: "Open", x: 94, y: 88, w: 5, h: 5 },
    { id: "Casa 6", seats: 4, status: "Open", x: 72, y: 96, w: 5, h: 5 },
    { id: "Casa 5", seats: 4, status: "Open", x: 80, y: 96, w: 5, h: 5 },
    { id: "Casa 4", seats: 4, status: "Open", x: 88, y: 96, w: 5, h: 5 },

    // SAN MIGUEL
    { id: "San Miguel 1", seats: 12, status: "Open", x: 79, y: 25, w: 17, h: 8 },
    { id: "San Miguel 2", seats: 12, status: "Open", x: 79, y: 37, w: 17, h: 8 },
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
      tables.map((table, i) =>
        i === index
          ? { ...table, status: "Seated", guest: selectedGuest.name }
          : table
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
                  background:
                    selectedGuest === reservation ? "#93c5fd" : "white",
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
              height: 950,
              background: "#f8f5ef",
              border: "4px solid #111827",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Right side info board */}
            <div
              style={{
                position: "absolute",
                left: "76%",
                top: "0%",
                width: "24%",
                height: "100%",
                borderLeft: "4px solid #111827",
                background: "#fffdf7",
              }}
            >
              <div style={{ padding: 8, borderBottom: "3px solid #111827" }}>
                <strong>Podium:</strong>
                <br />
                <strong>Seater 1:</strong>
                <br />
                <strong>Seater 2:</strong>
                <br />
                <strong>Seater 3:</strong>
              </div>

              <div
                style={{
                  background: "#111827",
                  color: "white",
                  padding: 6,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                San Miguel
              </div>

              <div style={{ height: "28%", borderBottom: "3px solid #111827", padding: 8 }}>
                <div style={{ marginBottom: 10 }}>Guest Name:</div>
                <div style={{ marginBottom: 10 }}>Arrival Time:</div>
                <div>Guests:</div>
              </div>

              <div style={{ height: "14%", borderBottom: "3px solid #111827", padding: 8 }}>
                <div>Guest Name:</div>
                <div>Arrival Time:</div>
                <div>Guest Count:</div>
              </div>

              <div style={{ padding: 8 }}>
                <strong>TO-DO LIST</strong>
              </div>
            </div>

            {/* Room labels only, no arrows */}
            <div style={{ position: "absolute", left: "9%", top: "60%", fontStyle: "italic", fontWeight: "bold" }}>
              Waiting Area
            </div>

            <div style={{ position: "absolute", left: "12%", top: "76%", fontSize: 12 }}>
              Diamante
            </div>

            <div style={{ position: "absolute", left: "9%", top: "82%", fontSize: 12, writingMode: "vertical-rl" }}>
              Lounge Furniture
            </div>

            <div style={{ position: "absolute", left: "30%", top: "65%", fontWeight: "bold" }}>
              BAR
            </div>

            <div style={{ position: "absolute", left: "63%", top: "56%", fontSize: 12, fontWeight: "bold" }}>
              Buffet
            </div>

            <div style={{ position: "absolute", left: "20%", top: "35%", fontStyle: "italic", fontWeight: "bold" }}>
              Take-Out
            </div>

            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: "24%",
                top: "60%",
                width: "26%",
                height: "9%",
                borderRadius: 18,
                border: "4px solid #64748b",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              BAR
            </div>

            {/* Buffet boxes, no arrows */}
            <div
              style={{
                position: "absolute",
                left: "60%",
                top: "54%",
                width: "17%",
                height: "5%",
                background: "white",
                border: "2px solid #111827",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Buffet
            </div>

            <div
              style={{
                position: "absolute",
                left: "60%",
                top: "66%",
                width: "16%",
                height: "4%",
                background: "#dbeafe",
                border: "1px solid #64748b",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Friday Lunch Buffet 11 - 2 pm
            </div>

            {/* Basic black wall/block lines */}
            <div style={{ position: "absolute", left: "0%", top: "11%", width: "76%", height: 4, background: "#111827" }} />
            <div style={{ position: "absolute", left: "0%", top: "50%", width: "18%", height: 6, background: "#111827" }} />
            <div style={{ position: "absolute", left: "23%", top: "50%", width: "26%", height: 6, background: "#111827" }} />
            <div style={{ position: "absolute", left: "57%", top: "50%", width: "20%", height: 6, background: "#111827" }} />
            <div style={{ position: "absolute", left: "22%", top: "74%", width: "35%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "60%", top: "74%", width: "17%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "57%", top: "74%", width: 5, height: "26%", background: "#111827" }} />

            {/* Tables */}
            {tables.map((table, index) => (
              <button
                key={table.id}
                onClick={() => updateTable(index)}
                style={{
                  position: "absolute",
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  width: `${table.w}%`,
                  height: `${table.h}%`,
                  background: statusColor(table.status),
                  border: "2px solid #334155",
                  borderRadius: 8,
                  fontSize: 10,
                  padding: 2,
                  textAlign: "center",
                  overflow: "hidden",
                }}
              >
                <strong>{table.id}</strong>
                <br />
                {table.seats > 0 ? `${table.seats}` : "Couch"}
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
