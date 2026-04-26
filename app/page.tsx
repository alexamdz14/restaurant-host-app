"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type Guest = {
  name: string;
  guests: number;
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

const T = (
  id: string,
  seats: number,
  x: number,
  y: number,
  w: number,
  h: number
): Table => ({
  id,
  seats,
  status: "Open",
  x,
  y,
  w,
  h,
});

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"map" | "book">("map");
  const [reservations, setReservations] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("");

  const [tables, setTables] = useState<Table[]>([
    T("P1", 4, 4, 2, 5, 6),
    T("P2", 4, 12, 2, 5, 6),
    T("P3", 4, 27, 2, 5, 6),
    T("P4", 4, 35, 2, 5, 6),
    T("P5", 4, 50, 2, 5, 6),
    T("P6", 4, 58, 2, 5, 6),
    T("P7", 4, 69, 2, 5, 6),
    T("P8", 6, 76, 2, 5, 6),

    T("19", 5, 2, 13, 5, 12),
    T("20", 4, 14, 13, 7, 4),
    T("21", 4, 22, 13, 7, 4),
    T("18", 5, 3, 29, 7, 4),
    T("17", 4, 11, 29, 7, 4),
    T("16", 4, 19, 29, 7, 4),

    T("22", 4, 32, 12, 4, 8),
    T("23", 4, 38, 12, 4, 8),
    T("24", 4, 44, 12, 4, 8),
    T("15", 4, 29, 26, 7, 4),
    T("14", 4, 37, 26, 7, 4),
    T("13", 4, 45, 26, 7, 4),
    T("9", 4, 29, 34, 7, 4),
    T("10", 4, 37, 34, 7, 4),
    T("11", 4, 45, 34, 7, 4),
    T("7", 4, 32, 44, 4, 8),
    T("6", 4, 41, 44, 4, 8),
    T("3", 2, 29, 55, 5, 4),
    T("4", 2, 37, 55, 5, 4),
    T("5", 2, 45, 55, 5, 4),

    T("26", 4, 54, 13, 7, 4),
    T("27", 4, 62, 13, 7, 4),
    T("28", 4, 70, 13, 6, 4),
    T("29", 4, 76, 13, 5, 4),
    T("32", 4, 63, 23, 4, 9),
    T("33", 4, 63, 34, 4, 9),
    T("31", 5, 70, 29, 8, 5),
    T("30", 5, 78, 29, 7, 5),
    T("34", 6, 63, 45, 4, 9),
    T("35", 6, 71, 45, 4, 9),
    T("36", 6, 79, 45, 4, 9),
    T("38", 7, 86, 22, 4, 10),
    T("37", 5, 86, 39, 4, 9),

    T("2", 4, 12, 56, 7, 4),
    T("1", 4, 12, 63, 6, 4),

    T("DL4", 4, 3, 77, 7, 4),
    T("DL3", 4, 3, 86, 7, 4),
    T("DL2", 4, 3, 95, 7, 4),
    T("DL1", 4, 13, 94, 6, 5),
    T("L10", 6, 20, 80, 8, 4),
    T("L9", 2, 20, 87, 5, 4),
    T("L1", 4, 32, 77, 7, 4),
    T("L2", 4, 41, 77, 7, 4),
    T("L3", 4, 50, 77, 7, 4),
    T("L4", 6, 62, 83, 6, 4),
    T("L11", 0, 38, 86, 4, 4),
    T("L12", 0, 46, 86, 4, 4),
    T("L8", 4, 31, 93, 4, 7),
    T("L7", 4, 39, 93, 4, 7),
    T("L6", 4, 47, 93, 4, 7),
    T("L5", 8, 58, 93, 7, 6),

    T("Casa 8", 4, 68, 78, 4, 7),
    T("Casa 1", 4, 80, 78, 4, 7),
    T("Casa 2", 4, 87, 78, 4, 7),
    T("Casa 7", 4, 68, 88, 7, 4),
    T("Casa 9", 4, 76, 88, 7, 4),
    T("Casa 10", 4, 84, 88, 7, 4),
    T("Casa 3", 4, 91, 88, 4, 4),
    T("Casa 6", 4, 70, 96, 4, 4),
    T("Casa 5", 4, 78, 96, 4, 4),
    T("Casa 4", 4, 86, 96, 4, 4),

    T("San Miguel 1", 12, 84, 26, 12, 8),
    T("San Miguel 2", 12, 84, 39, 12, 8),
  ]);

  function addReservation() {
    if (!name || !guests) return;
    setReservations([...reservations, { name, guests: Number(guests) }]);
    setName("");
    setGuests("");
  }

  function nextStatus(status: TableStatus): TableStatus {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function statusColor(status: TableStatus) {
    if (status === "Open") return "#dcfce7";
    if (status === "Seated") return "#fecaca";
    if (status === "Dirty") return "#e5e7eb";
    return "#dbeafe";
  }

  function updateTable(index: number) {
    if (selectedGuest) {
      setTables(
        tables.map((table, i) =>
          i === index
            ? { ...table, status: "Seated", guest: selectedGuest.name }
            : table
        )
      );
      setReservations(reservations.filter((r) => r !== selectedGuest));
      setSelectedGuest(null);
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

  return (
    <main style={{ padding: 12, fontFamily: "Arial", background: "#f5f7fb" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setActiveTab("map")}>Host Map</button>
        <button onClick={() => setActiveTab("book")}>Reservation Book</button>
      </div>

      {activeTab === "book" && (
        <section style={{ background: "white", padding: 16, borderRadius: 14 }}>
          <h2>Reservation Book</h2>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} />
          <button onClick={addReservation}>Add Reservation</button>

          {reservations.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedGuest(r);
                setActiveTab("map");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 10,
                textAlign: "left",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            >
              {r.name} — {r.guests} guests
            </button>
          ))}
        </section>
      )}

      {activeTab === "map" && (
        <section>
          <h2 style={{ margin: "4px 0" }}>Host Map</h2>

          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1.48 / 1",
              background: "#f8f5ef",
              border: "4px solid #111827",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: "0%", top: "11%", width: "76%", height: 4, background: "#111827" }} />
            <div style={{ position: "absolute", left: "76%", top: "0%", width: 4, height: "100%", background: "#111827" }} />
            <div style={{ position: "absolute", left: "0%", top: "50%", width: "18%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "23%", top: "50%", width: "27%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "57%", top: "50%", width: "20%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "23%", top: "74%", width: "34%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "60%", top: "74%", width: "17%", height: 5, background: "#111827" }} />
            <div style={{ position: "absolute", left: "57%", top: "74%", width: 5, height: "26%", background: "#111827" }} />

            <div style={{ position: "absolute", left: "78%", top: "0%", width: "22%", height: "100%", background: "#fffdf7" }}>
              <div style={{ padding: 6, height: "12%", borderBottom: "3px solid #111827", fontWeight: "bold", fontSize: 12 }}>
                PODIUM:<br />SEATER 1:<br />SEATER 2:<br />SEATER 3:
              </div>
              <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 4, fontWeight: "bold" }}>
                San Miguel
              </div>
              <div style={{ height: "28%", borderBottom: "3px solid #111827", padding: 6, fontSize: 12 }}>
                GUEST NAME:<br /><br />ARRIVAL TIME:<br /><br />GUESTS:
              </div>
              <div style={{ height: "14%", borderBottom: "3px solid #111827", padding: 6, fontSize: 12 }}>
                GUEST NAME:<br />ARRIVAL TIME:<br />GUEST COUNT:
              </div>
              <div style={{ padding: 6, fontWeight: "bold" }}>TO-DO LIST</div>
            </div>

            <div style={{ position: "absolute", left: "24%", top: "61%", width: "26%", height: "8%", borderRadius: 18, border: "4px solid #64748b", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold" }}>
              BAR
            </div>

            <div style={{ position: "absolute", left: "60%", top: "54%", width: "17%", height: "5%", background: "white", border: "2px solid #111827", textAlign: "center", fontSize: 10 }}>
              Buffet
            </div>

            <div style={{ position: "absolute", left: "60%", top: "66%", width: "16%", height: "4%", background: "#dbeafe", border: "1px solid #64748b", fontSize: 10, textAlign: "center" }}>
              Friday Lunch Buffet 11 - 2 pm
            </div>

            <div style={{ position: "absolute", left: "10%", top: "60%", fontStyle: "italic", fontWeight: "bold" }}>Waiting Area</div>
            <div style={{ position: "absolute", left: "19%", top: "36%", fontStyle: "italic", fontWeight: "bold" }}>Take-Out</div>
            <div style={{ position: "absolute", left: "12%", top: "76%", fontSize: 12 }}>Diamante</div>

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
                  fontSize: 9,
                  lineHeight: 1.05,
                  padding: 1,
                  overflow: "hidden",
                }}
              >
                <strong>{table.id}</strong>
                <br />
                {table.seats > 0 ? table.seats : "Couch"}
                <br />
                {table.status}
                {table.guest && <><br />{table.guest}</>}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
