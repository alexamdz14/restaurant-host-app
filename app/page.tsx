"use client";

import { useState } from "react";

type Status = "open" | "seated" | "boxed" | "dirty";

function Table({
  label,
  seats,
}: {
  label: string;
  seats: number;
}) {
  const [status, setStatus] = useState<Status>("open");

  const colors = {
    open: "#b7e4c7",
    seated: "#ffd166",
    boxed: "#cdb4db",
    dirty: "#ff6b6b",
  };

  const nextStatus = () => {
    const order: Status[] = ["seated", "boxed", "dirty", "open"];
    const next = order[(order.indexOf(status) + 1) % order.length];
    setStatus(next);
  };

  return (
    <div
      onClick={nextStatus}
      style={{
        width: 70,
        height: 60,
        borderRadius: 10,
        border: "2px solid #1d3557",
        background: colors[status],
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      <strong>{label}</strong>
      {seats}
      <div>{status}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Host Map</h1>

      {/* TOP ROW */}
      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
        {["P1","P2","P3","P4","P5","P6","P7","P8"].map((t) => (
          <Table key={t} label={t} seats={4} />
        ))}
      </div>

      {/* MIDDLE */}
      <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
        <Table label="19" seats={5} />
        <Table label="20" seats={4} />
        <Table label="21" seats={4} />
        <Table label="22" seats={4} />
        <Table label="23" seats={4} />
        <Table label="24" seats={4} />
        <Table label="26" seats={4} />
        <Table label="27" seats={4} />
        <Table label="28" seats={4} />
        <Table label="29" seats={4} />
      </div>

      {/* CENTER CLUSTER */}
      <div style={{ marginTop: 50, display: "flex", gap: 20 }}>
        <Table label="15" seats={4} />
        <Table label="14" seats={4} />
        <Table label="13" seats={4} />
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <Table label="9" seats={4} />
        <Table label="10" seats={4} />
        <Table label="11" seats={4} />
      </div>

      {/* RIGHT SIDE */}
      <div style={{ marginTop: 50, display: "flex", gap: 20 }}>
        <Table label="31" seats={5} />
        <Table label="30" seats={5} />
      </div>

      {/* LOWER */}
      <div style={{ marginTop: 60, display: "flex", gap: 20 }}>
        <Table label="7" seats={4} />
        <Table label="6" seats={4} />
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <Table label="3" seats={2} />
        <Table label="4" seats={2} />
        <Table label="5" seats={2} />
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <Table label="2" seats={4} />
        <Table label="1" seats={4} />
      </div>
    </main>
  );
}
