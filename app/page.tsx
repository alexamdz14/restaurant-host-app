"use client";

import { useState } from "react";

type Status = "open" | "seated" | "boxed" | "dirty";

const statusCycle: Status[] = ["seated", "boxed", "dirty", "open"];

function Table({
  name,
  seats,
  x,
  y,
  w = 60,
  h = 50,
}: {
  name: string;
  seats: number;
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  const [status, setStatus] = useState<Status>("open");

  const handleClick = () => {
    const next = statusCycle[(statusCycle.indexOf(status) + 1) % statusCycle.length];
    setStatus(next);
  };

  const getColor = () => {
    if (status === "seated") return "#93c5fd";
    if (status === "boxed") return "#fde68a";
    if (status === "dirty") return "#fca5a5";
    return "#bbf7d0";
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: getColor(),
        border: "2px solid #1e3a8a",
        borderRadius: 10,
        fontSize: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <strong>{name}</strong>
      <div>{seats}</div>
      <div>{status}</div>
    </div>
  );
}

function Wall({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: "#111827",
      }}
    />
  );
}

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Host Map</h1>

      <div
        style={{
          position: "relative",
          width: 1200,
          height: 800,
          border: "4px solid #111827",
          marginTop: 20,
        }}
      >

        {/* TOP TABLES */}
        <Table name="P1" seats={4} x={40} y={40} />
        <Table name="P2" seats={4} x={120} y={40} />
        <Table name="P3" seats={4} x={260} y={40} />
        <Table name="P4" seats={4} x={340} y={40} />
        <Table name="P5" seats={4} x={480} y={40} />
        <Table name="P6" seats={4} x={560} y={40} />
        <Table name="P7" seats={4} x={700} y={40} />
        <Table name="P8" seats={6} x={780} y={40} />

        {/* MAIN TABLES */}
        <Table name="20" seats={4} x={120} y={140} />
        <Table name="21" seats={4} x={200} y={140} />
        <Table name="22" seats={4} x={280} y={140} />
        <Table name="23" seats={4} x={340} y={140} />
        <Table name="24" seats={4} x={400} y={140} />

        <Table name="26" seats={4} x={520} y={140} />
        <Table name="27" seats={4} x={580} y={140} />
        <Table name="28" seats={4} x={640} y={140} />
        <Table name="29" seats={4} x={700} y={140} />

        {/* MID TABLES */}
        <Table name="15" seats={4} x={260} y={220} />
        <Table name="14" seats={4} x={320} y={220} />
        <Table name="13" seats={4} x={380} y={220} />

        <Table name="9" seats={4} x={260} y={280} />
        <Table name="10" seats={4} x={320} y={280} />
        <Table name="11" seats={4} x={380} y={280} />

        {/* 🔥 NEW WALL between 9-11 and 13-15 */}
        <Wall x={250} y={260} w={200} h={6} />

        {/* BAR */}
        <div
          style={{
            position: "absolute",
            left: 260,
            top: 420,
            width: 220,
            height: 80,
            background: "#cbd5e1",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 20,
          }}
        >
          BAR
        </div>

        {/* DIAMANTE TABLES */}
        <Table name="L10" seats={6} x={220} y={540} />
        <Table name="L9" seats={2} x={220} y={600} />

        {/* 🔥 FIXED WALL (LEFT of L10/L9 → DOWN to bottom wall) */}
        <Wall x={200} y={540} w={6} h={220} />

        {/* RIGHT SIDE TABLES */}
        <Table name="31" seats={5} x={600} y={260} />
        <Table name="30" seats={5} x={660} y={260} />
        <Table name="32" seats={4} x={560} y={200} />
        <Table name="33" seats={4} x={560} y={300} />

        {/* BUFFET */}
        <div
          style={{
            position: "absolute",
            left: 520,
            top: 380,
            width: 180,
            height: 60,
            border: "2px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Buffet
        </div>

        {/* SAN MIGUEL PANEL (FIXED EXACTLY HOW YOU ASKED) */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 100,
            width: 280,
            height: 400,
            borderLeft: "4px solid #111827",
            padding: 10,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 10 }}>
            PODIUM:<br />
            SEATER 1:<br />
            SEATER 2:<br />
            SEATER 3:
          </div>

          {/* BOX ONLY AROUND FIELDS */}
          <div
            style={{
              border: "3px solid #111827",
              padding: 10,
              marginTop: 10,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 10 }}>
              San Miguel
            </div>

            <div>GUEST NAME:</div>
            <div>ARRIVAL TIME:</div>
            <div>GUESTS:</div>
            <div>SERVER:</div>
          </div>

          {/* TABLES */}
          <Table name="San Miguel 1" seats={12} x={900} y={240} w={140} h={60} />
          <Table name="San Miguel 2" seats={12} x={900} y={320} w={140} h={60} />
        </div>

        {/* CASA PANEL */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 280,
            height: 240,
            borderLeft: "4px solid #111827",
            borderTop: "4px solid #111827",
            padding: 10,
          }}
        >
          <div style={{ fontWeight: "bold" }}>Casa 1884</div>
          <div>GUEST NAME:</div>
          <div>ARRIVAL TIME:</div>
          <div>GUEST COUNT:</div>
          <div>SERVER:</div>
        </div>
      </div>
    </div>
  );
}
