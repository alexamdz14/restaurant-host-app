"use client";

import { useState } from "react";

type TableStatus = "Open" | "Seated" | "Dirty" | "Ready";

type RestaurantTable = {
  number: string;
  seats: number;
  status: TableStatus;
};

export default function HomePage() {
  const [tables, setTables] = useState<RestaurantTable[]>([
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

  function nextStatus(status: TableStatus): TableStatus {
    if (status === "Open") return "Seated";
    if (status === "Seated") return "Dirty";
    if (status === "Dirty") return "Ready";
    return "Open";
  }

  function statusColor(status: TableStatus) {
    if (status === "Open") return "#d4edda";
    if (status === "Seated") return "#f8d7da";
    if (status === "Dirty") return "#e5e7eb";
    return "#dbeafe";
  }

  function updateTable(index: number) {
    setTables(
      tables.map((table, i) =>
        i === index ? { ...table, status: nextStatus(table.status) } : table
      )
    );
  }

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Enrique’s Host Stand</h1>
      <p>Tap a table to change: Open → Seated → Dirty → Ready → Open</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {tables.map((table, i) => (
          <button
            key={table.number}
            onClick={() => updateTable(i)}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 10,
              textAlign: "center",
              background: statusColor(table.status),
            }}
          >
            <h3>{table.number}</h3>
            <p>{table.seats} seats</p>
            <strong>{table.status}</strong>
          </button>
        ))}
      </div>
    </main>
  );
}
