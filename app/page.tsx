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
    T("P1", 4, 35, 24, 54, 54),
    T("P2", 4, 115, 24, 54, 54),
    T("P3", 4, 295, 24, 54, 54),
    T("P4", 4, 375, 24, 54, 54),
    T("P5", 4, 560, 24, 54, 54),
    T("P6", 4, 640, 24, 54, 54),
    T("P7", 4, 760, 24, 54, 54),
    T("P8", 6, 840, 24, 54, 54),

    T("19", 5, 35, 125, 56, 110),
    T("20", 4, 165, 125, 76, 42),
    T("21", 4, 250, 125, 76, 42),
    T("18", 5, 35, 285, 76, 42),
    T("17", 4, 120, 285, 76, 42),
    T("16", 4, 205, 285, 76, 42),

    T("22", 4, 355, 120, 48, 78),
    T("23", 4, 420, 120, 48, 78),
    T("24", 4, 485, 120, 48, 78),
    T("15", 4, 330, 260, 78, 42),
    T("14", 4, 420, 260, 78, 42),
    T("13", 4, 510, 260, 78, 42),
    T("9", 4, 330, 335, 78, 42),
    T("10", 4, 420, 335, 78, 42),
    T("11", 4, 510, 335, 78, 42),
    T("7", 4, 360, 440, 48, 80),
    T("6", 4, 450, 440, 48, 80),
    T("3", 2, 330, 555, 55, 40),
    T("4", 2, 420, 555, 55, 40),
    T("5", 2, 510, 555, 55, 40),

    T("26", 4, 610, 125, 78, 42),
    T("27", 4, 700, 125, 78, 42),
    T("28", 4, 790, 125, 62, 42),
    T("29", 4, 855, 125, 62, 42),
    T("32", 4, 690, 245, 48, 85),
    T("33", 4, 690, 355, 48, 85),
    T("31", 5, 790, 300, 86, 48),
    T("30", 5, 875, 300, 76, 48),
    T("34", 6, 690, 470, 48, 85),
    T("35", 6, 775, 470, 48, 85),
    T("36", 6, 860, 470, 48, 85),
    T("38", 7, 965, 230, 50, 100),
    T("37", 5, 965, 410, 50, 85),

    T("2", 4, 120, 565, 78, 42),
    T("1", 4, 120, 640, 68, 42),

    T("DL4", 4, 35, 765, 75, 42),
    T("DL3", 4, 35, 850, 75, 42),
    T("DL2", 4, 35, 935, 75, 42),
    T("DL1", 4, 140, 930, 65, 55),
    T("L10", 6, 240, 790, 90, 42),
    T("L9", 2, 240, 865, 55, 42),
    T("L1", 4, 380, 765, 75, 42),
    T("L2", 4, 475, 765, 75, 42),
    T("L3", 4, 570, 765, 75, 42),
    T("L4", 6, 680, 835, 65, 42),
    T("L11", 0, 405, 850, 48, 42),
    T("L12", 0, 490, 850, 48, 42),
    T("L8", 4, 365, 930, 50, 70),
    T("L7", 4, 450, 930, 50, 70),
    T("L6", 4, 535, 930, 50, 70),
    T("L5", 8, 660, 930, 78, 65),

    T("Casa 8", 4, 760, 780, 50, 80),
    T("Casa 1", 4, 885, 780, 50, 80),
    T("Casa 2", 4, 965, 780, 50, 80),
    T("Casa 7", 4, 760, 880, 78, 42),
    T("Casa 9", 4, 845, 880, 78, 42),
    T("Casa 10", 4, 930, 880, 78, 42),
    T("Casa 3", 4, 1010, 880, 50, 42),
    T("Casa 6", 4, 785, 965, 50, 42),
    T("Casa 5", 4, 875, 965, 50, 42),
    T("Casa 4", 4, 965, 965, 50, 42),

    T("San Miguel 1", 12, 1060, 235, 165, 80),
    T("San Miguel 2", 12, 1060, 360, 165, 80),
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
    <main style={{ padding: 8, fontFamily: "Arial", background: "#f5f7fb" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setActiveTab("map")}>Host Map</button>
        <button onClick={() => setActiveTab("book")}>Reservation Book</button>
      </div>

      {activeTab === "book" && (
        <section style={{ background: "white", padding: 16, borderRadius: 14 }}>
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
          <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
            <div
              style={{
                position: "relative",
                width: 1280,
                height: 1000,
                background: "#f8f5ef",
                border: "4px solid #111827",
                borderRadius: 10,
                overflow: "hidden",
                transform: "scale(0.8)",
                transformOrigin: "top left",
                marginBottom: -190,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 1040,
                  top: 0,
                  width: 240,
                  height: 1000,
                  background: "#fffdf7",
                  borderLeft: "4px solid #111827",
                }}
              >
                <div style={{ padding: 8, height: 110, borderBottom: "4px solid #111827", fontWeight: "bold" }}>
                  PODIUM:
                  <br />
                  SEATER 1:
                  <br />
                  SEATER 2:
                  <br />
                  SEATER 3:
                </div>
                <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 8, fontWeight: "bold" }}>
                  San Miguel
                </div>
                <div style={{ height: 260, borderBottom: "4px solid #111827", padding: 8 }}>
                  GUEST NAME:
                  <br />
                  <br />
                  ARRIVAL TIME:
                  <br />
                  <br />
                  GUESTS:
                </div>
                <div style={{ height: 140, borderBottom: "4px solid #111827", padding: 8 }}>
                  GUEST NAME:
                  <br />
                  ARRIVAL TIME:
                  <br />
                  GUEST COUNT:
                </div>
                <div style={{ padding: 8, fontWeight: "bold" }}>TO-DO LIST</div>
              </div>

              {/* walls */}
              <div style={{ position: "absolute", left: 0, top: 105, width: 1040, height: 5, background: "#111827" }} />
              <div style={{ position: "absolute", left: 0, top: 560, width: 235, height: 7, background: "#111827" }} />
              <div style={{ position: "absolute", left: 295, top: 560, width: 345, height: 7, background: "#111827" }} />
              <div style={{ position: "absolute", left: 735, top: 560, width: 305, height: 7, background: "#111827" }} />
              <div style={{ position: "absolute", left: 290, top: 745, width: 460, height: 6, background: "#111827" }} />
              <div style={{ position: "absolute", left: 780, top: 745, width: 260, height: 6, background: "#111827" }} />
              <div style={{ position: "absolute", left: 740, top: 745, width: 6, height: 255, background: "#111827" }} />

              {/* labels */}
              <div style={{ position: "absolute", left: 120, top: 615, fontStyle: "italic", fontWeight: "bold", fontSize: 22 }}>
                Waiting Area
              </div>
              <div style={{ position: "absolute", left: 210, top: 360, fontStyle: "italic", fontWeight: "bold", fontSize: 20 }}>
                Take-Out
              </div>
              <div style={{ position: "absolute", left: 145, top: 755, fontSize: 14 }}>Diamante</div>

              {/* bar */}
              <div
                style={{
                  position: "absolute",
                  left: 300,
                  top: 625,
                  width: 320,
                  height: 85,
                  borderRadius: 22,
                  border: "5px solid #64748b",
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  fontWeight: "bold",
                }}
              >
                BAR
              </div>

              {/* buffet */}
              <div
                style={{
                  position: "absolute",
                  left: 780,
                  top: 570,
                  width: 220,
                  height: 55,
                  background: "white",
                  border: "2px solid #111827",
                  textAlign: "center",
                  fontSize: 12,
                  paddingTop: 8,
                }}
              >
                Buffet
              </div>

              <div
                style={{
                  position: "absolute",
                  left: 780,
                  top: 675,
                  width: 210,
                  height: 45,
                  background: "#dbeafe",
                  border: "1px solid #64748b",
                  fontSize: 12,
                  textAlign: "center",
                  paddingTop: 8,
                }}
              >
                Friday Lunch Buffet 11 - 2 pm
              </div>

              {tables.map((table, index) => (
                <button
                  key={table.id}
                  onClick={() => updateTable(index)}
                  style={{
                    position: "absolute",
                    left: table.x,
                    top: table.y,
                    width: table.w,
                    height: table.h,
                    background: statusColor(table.status),
                    border: "2px solid #334155",
                    borderRadius: 8,
                    fontSize: 10,
                    lineHeight: 1.05,
                    padding: 1,
                    overflow: "hidden",
                    color: "#0070f3",
                    fontWeight: "bold",
                  }}
                >
                  {table.id}
                  <br />
                  {table.seats > 0 ? table.seats : "Couch"}
                  <br />
                  {table.status}
                  {table.guest && (
                    <>
                      <br />
                      {table.guest}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
