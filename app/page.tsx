"use client";

import { useEffect, useRef, useState } from "react";

import { supabase } from "./supabaseClient";

import { ENRIQUES_TABLES } from "./data/enriquesLayout";

import { STATUS_COLORS, TableItem, TableStatus,WaitParty,ServerInfo,} from "./types/host";

const STATUS_ORDER: TableStatus[] = ["Open", "Seated", "Boxed", "Dirty"];

const SERVER_COLORS = [

  "#2563eb", // blue

  "#16a34a", // green

  "#9333ea", // purple

  "#ea580c", // orange

  "#dc2626", // red

  "#0891b2", // teal

  "#db2777", // pink

  "#ca8a04", // gold

];

function pickServerColor(servers: ServerInfo[]) {

  const usedColors = new Set(servers.map((server) => server.color));

  return (

    SERVER_COLORS.find((color) => !usedColors.has(color)) ||

    SERVER_COLORS[servers.length % SERVER_COLORS.length]

  );

}

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const LOCAL_BACKUP_KEY = "enriques-os-local-backup-v1";

type LocalBackup = {
  savedAt: number;
  tables: TableItem[];
  servers: ServerInfo[];
  waitlist: WaitParty[];
  rotation: string[];
  lastSeated: Record<string, number>;
  shiftHistory: any[];
  partyCounts?: Record<string, number>;
  reservations?: ReservationRecord[];
};

type ReservationRecord = {
  id: string;
  date: string;
  time: string;
  name: string;
  guests: string;
  phone: string;
  notes: string;
  status: "Booked" | "Arrived" | "Seated" | "No Show" | "Cancelled";
  tableIds: string[];
  createdAt: number;
  syncDeviceId?: string;
  syncUpdatedAt?: number;
};

const OFFLINE_QUEUE_KEY = "enriques-os-offline-queue-v1";
const RECOVERY_SNAPSHOTS_KEY = "enriques-os-recovery-snapshots-v1";
const MAX_RECOVERY_SNAPSHOTS = 8;
const AUTO_SNAPSHOT_INTERVAL_MS = 2 * 60 * 1000;
const DEVICE_ID_KEY = "enriques-os-device-id-v1";

type RecoverySnapshot = LocalBackup & {
  id: string;
  label: string;
  reason: "automatic" | "manual" | "before-end-shift" | "before-restore";
};

type OfflineOperation =
  | {
      id: string;
      createdAt: number;
      type: "host_tables_upsert";
      payload: { id: string; data: any };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_servers_upsert";
      payload: { rows: Array<{ id: string; data: ServerInfo }> };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_servers_delete";
      payload: { id: string };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_waitlist_insert";
      payload: { id: number; data: WaitParty };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_waitlist_update";
      payload: { id: number; data: WaitParty };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_waitlist_delete";
      payload: { id: number };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_reservations_insert";
      payload: { id: string; data: ReservationRecord };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_reservations_update";
      payload: { id: string; data: ReservationRecord };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_reservations_delete";
      payload: { id: string };
    }
  | {
      id: string;
      createdAt: number;
      type: "host_shift_history_insert";
      payload: { id: string; data: any };
    };

export default function Home() {

  const [tables, setTables] = useState<TableItem[]>(ENRIQUES_TABLES);

  const [timerNow, setTimerNow] = useState(Date.now());

  const [loaded, setLoaded] = useState(false);

  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const [pin, setPin] = useState("");

  const [floorLocked, setFloorLocked] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [servers, setServers] = useState<ServerInfo[]>([]);

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const [selectedPartyTables, setSelectedPartyTables] = useState<string[]>([]);
  const [partyServerId, setPartyServerId] = useState<string | null>(null);
  const [partyGuestCount, setPartyGuestCount] = useState("");
  const [partySeatingMode, setPartySeatingMode] = useState(false);

  const [headHostMode, setHeadHostMode] = useState(false);
  const [reservationBookOpen, setReservationBookOpen] = useState(false);

  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [reservationName, setReservationName] = useState("");
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reservationTime, setReservationTime] = useState("");
  const [reservationGuests, setReservationGuests] = useState("");
  const [reservationPhone, setReservationPhone] = useState("");
  const [reservationNotes, setReservationNotes] = useState("");

  const [reservationBookMode, setReservationBookMode] = useState(false);
  const [reservationBookDate, setReservationBookDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reservationBookWeekOffset, setReservationBookWeekOffset] = useState(0);
  const [reservationBookMonth, setReservationBookMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reservationBookSelectedSlot, setReservationBookSelectedSlot] =
    useState<string | null>(null);

  const [plannerSelectedReservationId, setPlannerSelectedReservationId] =
    useState<string | null>(null);

  const [floorCheckMode, setFloorCheckMode] = useState(false);
  const [floorCheckStatus, setFloorCheckStatus] =
    useState<TableStatus | null>(null);

  const [rotation, setRotation] = useState<string[]>([]);

  const [lastSeated, setLastSeated] = useState<Record<string, number>>({});

  const [partyCounts, setPartyCounts] = useState<Record<string, number>>({});

  const [seatingServerName, setSeatingServerName] =
  
    useState<string | null>(null);

  const [lastSeatAction, setLastSeatAction] = useState<{
 
    tableId: string;
  
    serverName: string;
  
    previousTable: TableItem;
  
    previousRotation: string[];
  
    previousLastSeated?: number;
  
    createdAt: number;

  } | null>(null);

  const [newServerName, setNewServerName] = useState("");

  const [newServerStartTime, setNewServerStartTime] = useState("");

  async function checkInServer(serverId: string) {
    const server = servers.find((item) => item.id === serverId);
    if (!server) return;

    const updatedServer: ServerInfo = {
      ...server,
      status: "Checked In",
      checkedInAt: Date.now(),
    };

    setServers((current) =>
      current.map((item) =>
        item.id === serverId ? updatedServer : item
      )
    );

    setRotation((current) =>
      current.includes(updatedServer.name)
        ? current
        : [...current, updatedServer.name]
    );

    await syncOrQueue({
      type: "host_servers_upsert",
      payload: {
        rows: [{ id: updatedServer.id, data: updatedServer }],
      },
    });
  }

  async function updateServerStatus(
    serverId: string,
    status: "Off" | "Break" | "Cut"
  ) {
    const server = servers.find((item) => item.id === serverId);
    if (!server) return;

    const updatedServer: ServerInfo = {
      ...server,
      status,
      cutTime:
        status === "Cut"
          ? new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : server.cutTime,
      checkedInAt: status === "Off" ? undefined : server.checkedInAt,
    };

    setServers((current) =>
      current.map((item) =>
        item.id === serverId ? updatedServer : item
      )
    );

    if (status === "Cut" || status === "Off") {
      setRotation((current) =>
        current.filter((name) => name !== updatedServer.name)
      );
    }

    await syncOrQueue({
      type: "host_servers_upsert",
      payload: {
        rows: [{ id: updatedServer.id, data: updatedServer }],
      },
    });
  }

const seatNextServer = () => {
  
  if (rotation.length === 0) return;

  setSeatingServerName(rotation[0]);
  
}; 

const skipNextServer = () => {

  setRotation((current) => {

    if (current.length === 0) return current;

    return [...current.slice(1), current[0]];

  });

};

 async function seatRotationServerAtTable(tableId: string) {
  
   if (!seatingServerName) return;

  const currentTable = tables.find(
    
    (table) => table.id === tableId
 
  );

  if (!currentTable) return;

  if (currentTable.status !== "Open") {
   
    alert("Please select an open table.");
   
    return;
 
  }

  const serverName = seatingServerName;
  
   const previousRotation = [...rotation];
  
   const previousLastSeated = lastSeated[serverName];
  
   const seatedAt = Date.now();

  const nextTables = tables.map((table) =>
    
    table.id === tableId
     
    ? {
          
      ...table,
         
      status: "Seated" as TableStatus,
         
      seatedAt,
      
    }
    
    : table
  
    );

  const nextRotation = [
    
    ...rotation.filter((name) => name !== serverName),
    
    serverName,
 
  ];

  setLastSeatAction({
    
    tableId,
   
    serverName,
    
    previousTable: { ...currentTable },
    
    previousRotation,
    
    previousLastSeated,
    
    createdAt: Date.now(),
 
  });

  setTables(nextTables);
  
   setRotation(nextRotation);

  setLastSeated((previous) => ({
   
    ...previous,
   
    [serverName]: seatedAt,
 
  }));

  setSeatingServerName(null);

  await saveTablesNow(nextTables);

 }

function cancelSeatingMode() {
 
  setSeatingServerName(null);

}

async function undoLastSeat() {
  
  if (!lastSeatAction) return;

  const {
    
    tableId,
   
    serverName,
    
    previousTable,
    
    previousRotation,
   
    previousLastSeated,
 
  } = lastSeatAction;

  const nextTables = tables.map((table) =>
   
    table.id === tableId ? previousTable : table
  
                               );

  setTables(nextTables);
  
  setRotation(previousRotation);

  setLastSeated((previous) => {
   
    const next = { ...previous };

    if (previousLastSeated === undefined) {
     
      delete next[serverName];
    
    } else {
    
      next[serverName] = previousLastSeated;
   
    }

    return next;
  
  });

  setLastSeatAction(null);
  
  setSeatingServerName(null);

  await saveTablesNow(nextTables);

}

  async function assignSelectedServerToTable(tableId: string) {

  if (!selectedServer) return false;

  const selected = servers.find(

    (server) => server.id === selectedServer

  );

  if (!selected) return false;

  const currentTable = tables.find(

    (table) => table.id === tableId

  );

  if (!currentTable) return false;

  const removingAssignment =

    currentTable.server === selected.name;

  const nextTables = tables.map((table) =>

    table.id === tableId

      ? {

          ...table,

          server: removingAssignment

            ? undefined

            : selected.name,

        }

      : table

  );

  const nextServers = servers.map((server) => {

    const withoutTable = server.tables.filter(

      (id) => id !== tableId

    );

    if (

      server.id === selected.id &&

      !removingAssignment

    ) {

      return {

        ...server,

        tables: [...withoutTable, tableId],

      };

    }

    return {

      ...server,

      tables: withoutTable,

    };

  });

  setTables(nextTables);

  setServers(nextServers);

  await saveTablesNow(nextTables);

  await syncOrQueue({
    type: "host_servers_upsert",
    payload: {
      rows: nextServers.map((server) => ({
        id: server.id,
        data: server,
      })),
    },
  });

  return true;

}

  async function deleteServer(serverId: string) {

  const server = servers.find((item) => item.id === serverId);

  if (!server) return;

  const confirmed = confirm(

    `Delete ${server.name}? This will also remove their name from assigned tables.`

  );

  if (!confirmed) return;

  const nextTables = tables.map((table) =>

    table.server === server.name

      ? { ...table, server: undefined }

      : table

  );

  setServers((current) =>
    current.filter((item) => item.id !== serverId)
  );

  setRotation((current) =>
    current.filter((name) => name !== server.name)
  );

  await syncOrQueue({
    type: "host_servers_delete",
    payload: { id: serverId },
  });

  if (selectedServer === serverId) {

    setSelectedServer(null);

  }

  setTables(nextTables);

  await saveTablesNow(nextTables);

}

  function printServerSection(serverId: string) {

  const server = servers.find((item) => item.id === serverId);

  if (!server) return;

  const assignedTables = tables

    .filter((table) => table.server === server.name)

    .map((table) => table.id)

    .sort((a, b) =>

      a.localeCompare(b, undefined, { numeric: true })

    );

  const printWindow = window.open("", "_blank");

  if (!printWindow) {

    alert("Please allow pop-ups so the section can print.");

    return;

  }

  const startTime = server.startTime || "Not set";

  const cutTime = server.cutTime || "Not cut";

  const date = new Date().toLocaleDateString();

  printWindow.document.write(`

    <html>

      <head>

        <title>${server.name} Section</title>

        <style>

          body {

            font-family: Arial, sans-serif;

            padding: 28px;

            color: #111827;

          }

          h1 {

            margin-bottom: 4px;

          }

          .subtitle {

            margin-bottom: 24px;

            color: #475569;

          }

          .info {

            border: 2px solid #111827;

            border-radius: 10px;

            padding: 16px;

            margin-bottom: 20px;

          }

          .tables {

            display: grid;

            grid-template-columns: repeat(4, 1fr);

            gap: 12px;

          }

          .table {

            border: 3px solid ${server.color || "#111827"};

            border-radius: 10px;

            padding: 18px;

            text-align: center;

            font-size: 22px;

            font-weight: bold;

          }

          @media print {

            button {

              display: none;

            }

          }

        </style>

      </head>

      <body>

        <h1>Enrique's Mexican Restaurant</h1>

        <div class="subtitle">Server Section Sheet</div>

        <div class="info">

          <b>Server:</b> ${server.name}<br />

          <b>Date:</b> ${date}<br />

          <b>Start Time:</b> ${startTime}<br />

          <b>Status:</b> ${server.status}<br />

          <b>Cut Time:</b> ${cutTime}<br />

          <b>Tables Assigned:</b> ${assignedTables.length}

        </div>

        <h2>Section Tables</h2>

        ${

          assignedTables.length

            ? `

              <div class="tables">

                ${assignedTables

                  .map(

                    (tableId) =>

                      `<div class="table">${tableId}</div>`

                  )

                  .join("")}

              </div>

            `

            : `<p>No tables assigned.</p>`

        }

        <script>

          window.onload = function () {

            window.print();

          };

        </script>

      </body>

    </html>

  `);

  printWindow.document.close();

}
  
  const lastLocalSaveRef = useRef(0);

  async function saveTablesNow(nextTables: TableItem[]) {
    const updatedAt = Date.now();
    lastLocalSaveRef.current = updatedAt;

    await syncOrQueue({
      type: "host_tables_upsert",
      payload: {
        id: "main",
        data: {
          tables: nextTables,
          updatedAt,
        },
      },
    });
  }

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [guestSize, setGuestSize] = useState("");

  const [guestPhone, setGuestPhone] = useState("");

  const [guestNotes, setGuestNotes] = useState("");

  const [quotedWait, setQuotedWait] = useState("");

  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [showShiftHistory, setShowShiftHistory] = useState(false);

  const [isOnline, setIsOnline] = useState(true);
  const [lastLocalBackupAt, setLastLocalBackupAt] = useState<number | null>(null);
  const [restoredFromLocal, setRestoredFromLocal] = useState(false);

  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncingOfflineQueue, setIsSyncingOfflineQueue] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  const [showRecoveryCenter, setShowRecoveryCenter] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const [recoverySnapshots, setRecoverySnapshots] = useState<RecoverySnapshot[]>([]);

  const deviceIdRef = useRef("");
  const [lastRemoteUpdateAt, setLastRemoteUpdateAt] = useState<number | null>(null);
  const [lastRemoteUpdateLabel, setLastRemoteUpdateLabel] = useState("");
  const [syncConflictNotice, setSyncConflictNotice] = useState("");

  function getOrCreateDeviceId() {
    if (typeof window === "undefined") return "server";

    let deviceId = window.localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = `ipad-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    deviceIdRef.current = deviceId;
    return deviceId;
  }

  function queueHasTypePrefix(prefix: string) {
    return readOfflineQueue().some((operation) =>
      operation.type.startsWith(prefix)
    );
  }

  function markRemoteUpdate(label: string) {
    setLastRemoteUpdateAt(Date.now());
    setLastRemoteUpdateLabel(label);
  }

  function togglePartyTable(tableId: string) {
    const table = tables.find((item) => item.id === tableId);
    if (!table || table.status !== "Open") return;

    setSelectedPartyTables((current) =>
      current.includes(tableId)
        ? current.filter((id) => id !== tableId)
        : [...current, tableId]
    );
  }

  function cancelPartySeating() {
    setPartySeatingMode(false);
    setSelectedPartyTables([]);
    setPartyServerId(null);
    setPartyGuestCount("");
  }

  async function completePartySeating() {
    if (selectedPartyTables.length === 0) {
      alert("Select at least one open table.");
      return;
    }

    const receivingServer = servers.find(
      (server) => server.id === partyServerId
    );

    if (!receivingServer) {
      alert("Choose the server receiving this party.");
      return;
    }

    const parsedGuests = Number.parseInt(partyGuestCount, 10);

    if (!Number.isFinite(parsedGuests) || parsedGuests <= 0) {
      alert("Enter the guest count.");
      return;
    }

    const now = Date.now();

    const nextTables = tables.map((table) =>
      selectedPartyTables.includes(table.id)
        ? {
            ...table,
            status: "Seated" as TableStatus,
            seatedAt: now,
            statusStartedAt: now,
            partySize: String(parsedGuests),
          }
        : table
    );

    const previousRotation = [...rotation];

    // The selected server gets ONE party credit, even if multiple tables are used.
    setPartyCounts((current) => ({
      ...current,
      [receivingServer.name]: (current[receivingServer.name] || 0) + 1,
    }));

    setLastSeated((current) => ({
      ...current,
      [receivingServer.name]: now,
    }));

    // If a different server is seated out of order, the true NEXT server stays next.
    // The receiving server is removed from their old spot and placed at the back.
    setRotation((current) => {
      if (!current.includes(receivingServer.name)) return current;

      return [
        ...current.filter((name) => name !== receivingServer.name),
        receivingServer.name,
      ];
    });

    setTables(nextTables);

    // Keep permanent section ownership untouched: table.server is NOT changed.
    await saveTablesNow(nextTables);

    setLastSeatAction(null);
    setPartySeatingMode(false);
    setSelectedPartyTables([]);
    setPartyServerId(null);
    setPartyGuestCount("");

    const wasNext = previousRotation[0] === receivingServer.name;

    alert(
      wasNext
        ? `${receivingServer.name} seated. Party Queue advanced.`
        : `${receivingServer.name} seated out of order. ${previousRotation[0] || "The next server"} remains NEXT.`
    );
  }

  function reservationBookStorageKey() {
    return "enriques-os-reservation-book-mode-v1";
  }

  function toggleReservationBookMode() {
    const next = !reservationBookMode;
    setReservationBookMode(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        reservationBookStorageKey(),
        next ? "1" : "0"
      );
    }

    if (next) {
      setHeadHostMode(false);
      setPartySeatingMode(false);
      setFloorCheckMode(false);
      setSelectedServer(null);
      setSeatingServerName(null);
      setPlannerSelectedReservationId(null);
    }
  }

  function getWeekDates(offset: number) {
    const base = new Date();
    const day = base.getDay();
    const diffToTuesday = ((day - 2 + 7) % 7);
    base.setDate(base.getDate() - diffToTuesday + offset * 7);

    return Array.from({ length: 5 }).map((_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);

      // Skip Sunday/Monday by using Tue-Sat only.
      return date;
    });
  }

  function formatBookDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function getSlotsForDate(dateString: string) {
    const date = new Date(`${dateString}T12:00:00`);
    const day = date.getDay();

    // Tue-Thu: 3:00-8:30 PM
    // Fri: 11:00 AM-9:30 PM
    // Sat: 12:00 PM-9:30 PM
    let startHour = 15;
    let startMinute = 0;
    let endHour = 20;
    let endMinute = 30;

    if (day === 5) {
      startHour = 11;
      startMinute = 0;
      endHour = 21;
      endMinute = 30;
    } else if (day === 6) {
      startHour = 12;
      startMinute = 0;
      endHour = 21;
      endMinute = 30;
    }

    const slots: string[] = [];
    const current = new Date(`${dateString}T00:00:00`);
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date(`${dateString}T00:00:00`);
    end.setHours(endHour, endMinute, 0, 0);

    while (current <= end) {
      slots.push(
        current.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );
      current.setMinutes(current.getMinutes() + 15);
    }

    return slots;
  }

  function normalizeDisplayTimeTo24Hour(time: string) {
    const parsed = new Date(`2000-01-01 ${time}`);
    if (Number.isNaN(parsed.getTime())) return time;

    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function reservationsForSlot(date: string, displayTime: string) {
    const targetTime = normalizeDisplayTimeTo24Hour(displayTime);

    return reservations
      .filter(
        (reservation) =>
          reservation.date === date &&
          reservation.time === targetTime &&
          reservation.status !== "Cancelled"
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function selectReservationBookSlot(date: string, displayTime: string) {
    setReservationBookDate(date);
    setReservationDate(date);
    setReservationTime(normalizeDisplayTimeTo24Hour(displayTime));
    setReservationBookSelectedSlot(`${date}|${displayTime}`);
  }

  function formatBookDayLabel(date: Date) {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  async function addReservation() {
    const name = reservationName.trim();
    const date = reservationDate.trim();
    const time = reservationTime.trim();
    const guests = reservationGuests.trim();

    if (!name || !date || !time || !guests) {
      alert("Enter reservation name, date, time, and guest count.");
      return;
    }

    const bookedInSlot = reservations.filter(
      (reservation) =>
        reservation.date === date &&
        reservation.time === time &&
        reservation.status !== "Cancelled"
    ).length;

    if (bookedInSlot >= 5) {
      const okay = confirm(
        "This 15-minute slot already has 5 reservations. Add another reservation anyway?"
      );

      if (!okay) return;
    }

    const reservation: ReservationRecord = {
      id: `reservation-${Date.now()}`,
      date,
      time,
      name,
      guests,
      phone: reservationPhone.trim(),
      notes: reservationNotes.trim(),
      status: "Booked",
      tableIds: [],
      createdAt: Date.now(),
    };

    setReservations((current) =>
      [...current, reservation].sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      )
    );

    setReservationName("");
    setReservationTime("");
    setReservationGuests("");
    setReservationPhone("");
    setReservationNotes("");

    await syncOrQueue({
      type: "host_reservations_insert",
      payload: {
        id: reservation.id,
        data: reservation,
      },
    });
  }

  async function updateReservation(
    reservationId: string,
    updates: Partial<ReservationRecord>
  ) {
    const currentReservation = reservations.find(
      (reservation) => reservation.id === reservationId
    );

    if (!currentReservation) return;

    const updatedReservation: ReservationRecord = {
      ...currentReservation,
      ...updates,
    };

    setReservations((current) =>
      current
        .map((reservation) =>
          reservation.id === reservationId
            ? updatedReservation
            : reservation
        )
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        )
    );

    await syncOrQueue({
      type: "host_reservations_update",
      payload: {
        id: updatedReservation.id,
        data: updatedReservation,
      },
    });
  }

  async function toggleReservationTable(
    reservationId: string,
    tableId: string
  ) {
    const reservation = reservations.find(
      (item) => item.id === reservationId
    );

    if (!reservation) return;

    const nextTableIds = reservation.tableIds.includes(tableId)
      ? reservation.tableIds.filter((id) => id !== tableId)
      : [...reservation.tableIds, tableId];

    await updateReservation(reservationId, {
      tableIds: nextTableIds,
    });
  }

  async function deleteReservation(reservationId: string) {
    const reservation = reservations.find(
      (item) => item.id === reservationId
    );

    if (!reservation) return;

    const okay = confirm(
      `Delete reservation for ${reservation.name}?`
    );

    if (!okay) return;

    setReservations((current) =>
      current.filter((item) => item.id !== reservationId)
    );

    await syncOrQueue({
      type: "host_reservations_delete",
      payload: { id: reservationId },
    });
  }

  function getTableTimerStart(table: TableItem) {
    const timedTable = table as TableItem & {
      statusStartedAt?: number;
      seatedAt?: number;
    };

    if (table.status === "Open") return null;

    if (table.status === "Seated") {
      return timedTable.seatedAt || timedTable.statusStartedAt || null;
    }

    return timedTable.statusStartedAt || timedTable.seatedAt || null;
  }

  function getElapsedMinutes(table: TableItem) {
    const startedAt = getTableTimerStart(table);

    if (!startedAt) return null;

    return Math.max(
      0,
      Math.floor((timerNow - startedAt) / 60000)
    );
  }

  function formatElapsedMinutes(minutes: number | null) {
    if (minutes === null) return "";

    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining === 0
      ? `${hours}h`
      : `${hours}h ${remaining}m`;
  }

  function getTimerBadgeStyle(table: TableItem) {
    const minutes = getElapsedMinutes(table);

    if (minutes === null) {
      return {
        background: "white",
        color: "#475569",
        border: "1px solid #cbd5e1",
      };
    }

    if (table.status === "Dirty") {
      return minutes >= 5
        ? {
            background: "#fee2e2",
            color: "#991b1b",
            border: "2px solid #dc2626",
          }
        : {
            background: "#fef2f2",
            color: "#7f1d1d",
            border: "1px solid #f87171",
          };
    }

    if (table.status === "Boxed") {
      return minutes >= 10
        ? {
            background: "#fef3c7",
            color: "#92400e",
            border: "2px solid #d97706",
          }
        : {
            background: "#fffbeb",
            color: "#78350f",
            border: "1px solid #f59e0b",
          };
    }

    if (table.status === "Seated") {
      if (minutes >= 90) {
        return {
          background: "#fee2e2",
          color: "#991b1b",
          border: "2px solid #dc2626",
        };
      }

      if (minutes >= 60) {
        return {
          background: "#fef3c7",
          color: "#92400e",
          border: "2px solid #d97706",
        };
      }

      return {
        background: "#ecfdf5",
        color: "#166534",
        border: "1px solid #16a34a",
      };
    }

    return {
      background: "white",
      color: "#475569",
      border: "1px solid #cbd5e1",
    };
  }

  function getLongestTableByStatus(status: TableStatus) {
    const candidates = tables
      .filter((table) => table.status === status)
      .map((table) => ({
        table,
        minutes: getElapsedMinutes(table),
      }))
      .filter(
        (item): item is { table: TableItem; minutes: number } =>
          item.minutes !== null
      )
      .sort((a, b) => b.minutes - a.minutes);

    return candidates[0] || null;
  }

  async function applyFloorCheckStatus(tableId: string) {
    const table = tables.find((item) => item.id === tableId);
    if (!table) return;

    let nextStatus: TableStatus;

    if (floorCheckStatus) {
      nextStatus = floorCheckStatus;
    } else {
      const cycle: TableStatus[] = [
        "Seated",
        "Boxed",
        "Dirty",
        "Open",
      ];

      const currentIndex = cycle.indexOf(table.status);
      nextStatus =
        cycle[(currentIndex + 1 + cycle.length) % cycle.length];
    }

    const now = Date.now();

    const nextTables = tables.map((item) => {
      if (item.id !== tableId) return item;

      const timedItem = item as TableItem & {
        statusStartedAt?: number;
      };

      if (nextStatus === "Open") {
        return {
          ...item,
          status: "Open" as TableStatus,
          guest: undefined,
          partySize: undefined,
          seatedAt: undefined,
          statusStartedAt: undefined,
        };
      }

      if (nextStatus === "Seated") {
        return {
          ...item,
          status: "Seated" as TableStatus,
          seatedAt: item.seatedAt || now,
          statusStartedAt:
            item.status === "Seated"
              ? timedItem.statusStartedAt || item.seatedAt || now
              : now,
        };
      }

      return {
        ...item,
        status: nextStatus,
        seatedAt: item.seatedAt || now,
        statusStartedAt:
          item.status === nextStatus
            ? timedItem.statusStartedAt || now
            : now,
      };
    });

    setTables(nextTables);
    await saveTablesNow(nextTables);
  }

  function getReservationForTable(tableId: string) {
    const today = new Date().toISOString().slice(0, 10);

    return reservations
      .filter(
        (reservation) =>
          reservation.date === today &&
          reservation.status !== "Cancelled" &&
          reservation.tableIds.includes(tableId)
      )
      .sort((a, b) => a.time.localeCompare(b.time))[0];
  }

  async function togglePlannerReservationTableFromFloor(tableId: string) {
    if (!plannerSelectedReservationId) return;

    const reservation = reservations.find(
      (item) => item.id === plannerSelectedReservationId
    );

    if (!reservation) return;

    const nextTableIds = reservation.tableIds.includes(tableId)
      ? reservation.tableIds.filter((id) => id !== tableId)
      : [...reservation.tableIds, tableId];

    await updateReservation(reservation.id, {
      tableIds: nextTableIds,
    });
  }

  function getReservationCountdownMinutes(reservation: ReservationRecord) {
    const target = new Date(
      `${reservation.date}T${reservation.time || "00:00"}`
    ).getTime();

    if (!Number.isFinite(target)) return null;

    return Math.round((target - Date.now()) / 60000);
  }

  function readOfflineQueue(): OfflineOperation[] {
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as OfflineOperation[]) : [];
    } catch (error) {
      console.error("Could not read offline sync queue:", error);
      return [];
    }
  }

  function writeOfflineQueue(queue: OfflineOperation[]) {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(queue)
      );
      setPendingSyncCount(queue.length);
    } catch (error) {
      console.error("Could not save offline sync queue:", error);
    }
  }

  function queueOfflineOperation(
    operation: Omit<OfflineOperation, "id" | "createdAt">
  ) {
    const queuedOperation = {
      ...operation,
      id: `offline-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      createdAt: Date.now(),
    } as OfflineOperation;

    let queue = readOfflineQueue();

    // Keep only the newest full-floor write so an old offline floor
    // cannot replay after a newer floor state.
    if (queuedOperation.type === "host_tables_upsert") {
      queue = queue.filter(
        (item) => item.type !== "host_tables_upsert"
      );
    }

    // For the same server row, keep the newest queued server state.
    if (queuedOperation.type === "host_servers_upsert") {
      const queuedIds = new Set(
        queuedOperation.payload.rows.map((row) => row.id)
      );

      queue = queue
        .map((item) => {
          if (item.type !== "host_servers_upsert") return item;

          const remainingRows = item.payload.rows.filter(
            (row) => !queuedIds.has(row.id)
          );

          return remainingRows.length
            ? {
                ...item,
                payload: { rows: remainingRows },
              }
            : null;
        })
        .filter(Boolean) as OfflineOperation[];
    }

    if (queuedOperation.type === "host_waitlist_update") {
      queue = queue.filter(
        (item) =>
          !(
            item.type === "host_waitlist_update" &&
            item.payload.id === queuedOperation.payload.id
          )
      );
    }

    if (queuedOperation.type === "host_waitlist_delete") {
      queue = queue.filter((item) => {
        if (
          item.type === "host_waitlist_update" &&
          item.payload.id === queuedOperation.payload.id
        ) {
          return false;
        }

        if (
          item.type === "host_waitlist_insert" &&
          item.payload.id === queuedOperation.payload.id
        ) {
          return false;
        }

        return true;
      });
    }

    if (queuedOperation.type === "host_reservations_update") {
      queue = queue.filter(
        (item) =>
          !(
            item.type === "host_reservations_update" &&
            item.payload.id === queuedOperation.payload.id
          )
      );
    }

    if (queuedOperation.type === "host_reservations_delete") {
      queue = queue.filter((item) => {
        if (
          item.type === "host_reservations_update" &&
          item.payload.id === queuedOperation.payload.id
        ) {
          return false;
        }

        if (
          item.type === "host_reservations_insert" &&
          item.payload.id === queuedOperation.payload.id
        ) {
          return false;
        }

        return true;
      });
    }

    writeOfflineQueue([...queue, queuedOperation]);
  }

  async function executeOfflineOperation(operation: OfflineOperation) {
    if (operation.type === "host_tables_upsert") {
      const { error } = await supabase
        .from("host_tables")
        .upsert({
          ...operation.payload,
          data: {
            ...operation.payload.data,
            syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
            syncUpdatedAt: operation.createdAt,
          },
        });
      if (error) throw error;
      return;
    }

    if (operation.type === "host_servers_upsert") {
      const { error } = await supabase
        .from("host_servers")
        .upsert(
          operation.payload.rows.map((row) => ({
            ...row,
            data: {
              ...row.data,
              syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
              syncUpdatedAt: operation.createdAt,
            },
          }))
        );
      if (error) throw error;
      return;
    }

    if (operation.type === "host_servers_delete") {
      const { error } = await supabase
        .from("host_servers")
        .delete()
        .eq("id", operation.payload.id);
      if (error) throw error;
      return;
    }

    if (operation.type === "host_waitlist_insert") {
      const { error } = await supabase
        .from("host_waitlist")
        .insert({
          ...operation.payload,
          data: {
            ...operation.payload.data,
            syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
            syncUpdatedAt: operation.createdAt,
          },
        });
      if (error) throw error;
      return;
    }

    if (operation.type === "host_waitlist_update") {
      const { error } = await supabase
        .from("host_waitlist")
        .update({
          data: {
            ...operation.payload.data,
            syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
            syncUpdatedAt: operation.createdAt,
          },
        })
        .eq("id", operation.payload.id);
      if (error) throw error;
      return;
    }

    if (operation.type === "host_waitlist_delete") {
      const { error } = await supabase
        .from("host_waitlist")
        .delete()
        .eq("id", operation.payload.id);
      if (error) throw error;
      return;
    }

    if (operation.type === "host_reservations_insert") {
      const { error } = await supabase
        .from("host_reservations")
        .insert({
          ...operation.payload,
          data: {
            ...operation.payload.data,
            syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
            syncUpdatedAt: operation.createdAt,
          },
        });
      if (error) throw error;
      return;
    }

    if (operation.type === "host_reservations_update") {
      const { error } = await supabase
        .from("host_reservations")
        .update({
          data: {
            ...operation.payload.data,
            syncDeviceId: deviceIdRef.current || getOrCreateDeviceId(),
            syncUpdatedAt: operation.createdAt,
          },
        })
        .eq("id", operation.payload.id);
      if (error) throw error;
      return;
    }

    if (operation.type === "host_reservations_delete") {
      const { error } = await supabase
        .from("host_reservations")
        .delete()
        .eq("id", operation.payload.id);
      if (error) throw error;
      return;
    }

    if (operation.type === "host_shift_history_insert") {
      const { error } = await supabase
        .from("host_shift_history")
        .insert(operation.payload);
      if (error) throw error;
    }
  }

  async function syncOrQueue(
    operation: Omit<OfflineOperation, "id" | "createdAt">
  ) {
    const browserOnline =
      typeof window === "undefined" ? true : window.navigator.onLine;

    if (!browserOnline) {
      queueOfflineOperation(operation);
      return { queued: true };
    }

    const executable = {
      ...operation,
      id: `live-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      createdAt: Date.now(),
    } as OfflineOperation;

    try {
      await executeOfflineOperation(executable);
      setLastSyncAt(Date.now());
      return { queued: false };
    } catch (error) {
      console.error("Cloud save failed; queued for retry:", error);
      queueOfflineOperation(operation);
      return { queued: true };
    }
  }

  async function flushOfflineQueue() {
    if (typeof window === "undefined" || !window.navigator.onLine) return;
    if (isSyncingOfflineQueue) return;

    const queue = readOfflineQueue();

    if (queue.length === 0) {
      setPendingSyncCount(0);
      return;
    }

    setIsSyncingOfflineQueue(true);

    const remaining: OfflineOperation[] = [];

    for (let index = 0; index < queue.length; index += 1) {
      const operation = queue[index];

      try {
        await executeOfflineOperation(operation);
      } catch (error) {
        console.error("Offline sync stopped at operation:", operation, error);
        remaining.push(...queue.slice(index));
        break;
      }
    }

    writeOfflineQueue(remaining);

    if (remaining.length === 0) {
      setLastSyncAt(Date.now());
      setSyncConflictNotice("");

      // Pull fresh cloud state after replay so every iPad converges.
      const [
        { data: tableData },
        { data: serverData },
        { data: waitData },
        { data: reservationData },
      ] = await Promise.all([
          supabase
            .from("host_tables")
            .select("data")
            .eq("id", "main")
            .maybeSingle(),
          supabase.from("host_servers").select("id, data"),
          supabase
            .from("host_waitlist")
            .select("data")
            .order("id", { ascending: true }),
          supabase
            .from("host_reservations")
            .select("id, data")
            .order("created_at", { ascending: true }),
        ]);

      if (tableData?.data?.tables) {
        const cloudUpdatedAt =
          tableData.data.syncUpdatedAt ||
          tableData.data.updatedAt ||
          0;
        lastLocalSaveRef.current = Math.max(
          lastLocalSaveRef.current,
          cloudUpdatedAt
        );
        setTables(tableData.data.tables);
      }

      if (serverData) {
        setServers(
          serverData
            .map((row) => row.data as ServerInfo)
            .filter(Boolean)
        );
      }

      if (waitData) {
        setWaitlist(
          waitData.map((row) => row.data as WaitParty)
        );
      }

      if (reservationData) {
        setReservations(
          reservationData
            .map((row) => row.data as ReservationRecord)
            .filter(Boolean)
            .sort((a, b) =>
              `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
            )
        );
      }
    }

    setIsSyncingOfflineQueue(false);
  }

  function readRecoverySnapshots(): RecoverySnapshot[] {
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(RECOVERY_SNAPSHOTS_KEY);
      return raw ? (JSON.parse(raw) as RecoverySnapshot[]) : [];
    } catch (error) {
      console.error("Could not read recovery snapshots:", error);
      return [];
    }
  }

  function writeRecoverySnapshots(snapshots: RecoverySnapshot[]) {
    if (typeof window === "undefined") return;

    try {
      const trimmed = snapshots
        .sort((a, b) => b.savedAt - a.savedAt)
        .slice(0, MAX_RECOVERY_SNAPSHOTS);

      window.localStorage.setItem(
        RECOVERY_SNAPSHOTS_KEY,
        JSON.stringify(trimmed)
      );

      setRecoverySnapshots(trimmed);
    } catch (error) {
      console.error("Could not save recovery snapshots:", error);
    }
  }

  function createRecoverySnapshot(
    reason: RecoverySnapshot["reason"],
    label: string
  ) {
    if (typeof window === "undefined") return;

    const savedAt = Date.now();

    const snapshot: RecoverySnapshot = {
      id: `snapshot-${savedAt}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      reason,
      savedAt,
      tables,
      servers,
      waitlist,
      rotation,
      lastSeated,
      shiftHistory,
      partyCounts,
      reservations,
    };

    const current = readRecoverySnapshots();
    writeRecoverySnapshots([snapshot, ...current]);

    // Keep the latest backup key aligned with the newest snapshot.
    const backup: LocalBackup = {
      savedAt,
      tables,
      servers,
      waitlist,
      rotation,
      lastSeated,
      shiftHistory,
      partyCounts,
      reservations,
    };

    window.localStorage.setItem(
      LOCAL_BACKUP_KEY,
      JSON.stringify(backup)
    );

    setLastLocalBackupAt(savedAt);
    return snapshot;
  }

  async function restoreRecoverySnapshot(snapshotId: string) {
    const snapshot = recoverySnapshots.find(
      (item) => item.id === snapshotId
    );

    if (!snapshot) {
      alert("That recovery snapshot could not be found.");
      return;
    }

    const okay = confirm(
      `Restore "${snapshot.label}" from ${new Date(
        snapshot.savedAt
      ).toLocaleString()}?\n\nThe current board will be saved as a safety snapshot first.`
    );

    if (!okay) return;

    createRecoverySnapshot(
      "before-restore",
      "Safety copy before restore"
    );

    setTables(snapshot.tables || []);
    setServers(snapshot.servers || []);
    setWaitlist(snapshot.waitlist || []);
    setRotation(snapshot.rotation || []);
    setLastSeated(snapshot.lastSeated || {});
    setShiftHistory(snapshot.shiftHistory || []);
    setPartyCounts(snapshot.partyCounts || {});
    setReservations(snapshot.reservations || []);
    setLastLocalBackupAt(snapshot.savedAt);
    setRestoredFromLocal(true);

    await syncOrQueue({
      type: "host_tables_upsert",
      payload: {
        id: "main",
        data: {
          tables: snapshot.tables || [],
          updatedAt: Date.now(),
        },
      },
    });

    if ((snapshot.servers || []).length > 0) {
      await syncOrQueue({
        type: "host_servers_upsert",
        payload: {
          rows: snapshot.servers.map((server) => ({
            id: server.id,
            data: server,
          })),
        },
      });
    }

    setRecoveryMessage(
      `Restored "${snapshot.label}". The restored floor/server state is protected and queued for cloud sync if needed.`
    );
  }

  function deleteRecoverySnapshot(snapshotId: string) {
    const snapshot = recoverySnapshots.find(
      (item) => item.id === snapshotId
    );

    if (!snapshot) return;

    const okay = confirm(
      `Delete recovery snapshot "${snapshot.label}"?`
    );

    if (!okay) return;

    writeRecoverySnapshots(
      recoverySnapshots.filter((item) => item.id !== snapshotId)
    );
  }

  function createManualLocalBackup() {
    if (typeof window === "undefined") return;

    const savedAt = Date.now();

    const backup: LocalBackup = {
      savedAt,
      tables,
      servers,
      waitlist,
      rotation,
      lastSeated,
      shiftHistory,
      partyCounts,
      reservations,
    };

    try {
      window.localStorage.setItem(
        LOCAL_BACKUP_KEY,
        JSON.stringify(backup)
      );

      createRecoverySnapshot(
        "manual",
        `Manual backup ${new Date(savedAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}`
      );

      setLastLocalBackupAt(savedAt);
      setRecoveryMessage("Manual backup and recovery snapshot saved on this iPad.");
    } catch (error) {
      console.error("Could not create manual backup:", error);
      setRecoveryMessage("Could not create the manual backup.");
    }
  }

  async function restoreFromLocalBackup() {
    if (typeof window === "undefined") return;

    const rawBackup = window.localStorage.getItem(LOCAL_BACKUP_KEY);

    if (!rawBackup) {
      alert("No local backup was found on this iPad.");
      return;
    }

    const okay = confirm(
      "Restore the latest local backup on this iPad? This will replace the current visible floor, servers, waitlist, rotation, and shift history with the saved local copy."
    );

    if (!okay) return;

    try {
      const backup = JSON.parse(rawBackup) as LocalBackup;

      if (!backup.tables?.length) {
        alert("The local backup does not contain a valid floor map.");
        return;
      }

      setTables(backup.tables);
      setServers(backup.servers || []);
      setWaitlist(backup.waitlist || []);
      setRotation(backup.rotation || []);
      setLastSeated(backup.lastSeated || {});
      setShiftHistory(backup.shiftHistory || []);
      setPartyCounts(backup.partyCounts || {});
      setReservations(backup.reservations || []);
      setLastLocalBackupAt(backup.savedAt || Date.now());
      setRestoredFromLocal(true);

      // Protect the restored floor and server state in the cloud/queue.
      await syncOrQueue({
        type: "host_tables_upsert",
        payload: {
          id: "main",
          data: {
            tables: backup.tables,
            updatedAt: Date.now(),
          },
        },
      });

      if ((backup.servers || []).length > 0) {
        await syncOrQueue({
          type: "host_servers_upsert",
          payload: {
            rows: backup.servers.map((server) => ({
              id: server.id,
              data: server,
            })),
          },
        });
      }

      setRecoveryMessage(
        "Local backup restored. Floor and server state are protected and will sync when available."
      );
    } catch (error) {
      console.error("Could not restore local backup:", error);
      alert("The local backup could not be restored.");
    }
  }

  function exportRecoveryBackup() {
    if (typeof window === "undefined") return;

    const rawBackup = window.localStorage.getItem(LOCAL_BACKUP_KEY);

    if (!rawBackup) {
      alert("No local backup was found to export.");
      return;
    }

    const blob = new Blob([rawBackup], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `enriques-os-backup-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setRecoveryMessage("Recovery backup exported.");
  }

  function clearOfflineQueueSafely() {
    if (typeof window === "undefined") return;

    const queue = readOfflineQueue();

    if (queue.length === 0) {
      alert("There are no pending offline changes.");
      return;
    }

    const okay = confirm(
      `There are ${queue.length} pending offline changes. Clear them without syncing? Only do this if you are sure those changes should be discarded.`
    );

    if (!okay) return;

    writeOfflineQueue([]);
    setRecoveryMessage("Pending offline queue cleared.");
  }

  const openCount = tables.filter((t) => t.status === "Open").length;

  const seatedCount = tables.filter((t) => t.status === "Seated").length;

  const boxedCount = tables.filter((t) => t.status === "Boxed").length;

  const dirtyCount = tables.filter((t) => t.status === "Dirty").length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    getOrCreateDeviceId();

    if (
      window.localStorage.getItem(reservationBookStorageKey()) === "1"
    ) {
      setReservationBookMode(true);
    }

    setIsOnline(window.navigator.onLine);
    setPendingSyncCount(readOfflineQueue().length);
    setRecoverySnapshots(readRecoverySnapshots());

    const rawBackup = window.localStorage.getItem(LOCAL_BACKUP_KEY);

    if (rawBackup) {
      try {
        const backup = JSON.parse(rawBackup) as LocalBackup;

        if (backup.tables?.length) setTables(backup.tables);
        if (backup.servers) setServers(backup.servers);
        if (backup.waitlist) setWaitlist(backup.waitlist);
        if (backup.rotation) setRotation(backup.rotation);
        if (backup.lastSeated) setLastSeated(backup.lastSeated);
        if (backup.shiftHistory) setShiftHistory(backup.shiftHistory);
        if (backup.partyCounts) setPartyCounts(backup.partyCounts);
        if (backup.reservations) setReservations(backup.reservations);

        if (backup.savedAt) {
          setLastLocalBackupAt(backup.savedAt);
          setRestoredFromLocal(true);
        }
      } catch (error) {
        console.error("Could not restore local Enrique's backup:", error);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loaded) return;

    const savedAt = Date.now();

    const backup: LocalBackup = {
      savedAt,
      tables,
      servers,
      waitlist,
      rotation,
      lastSeated,
      shiftHistory,
      partyCounts,
      reservations,
    };

    try {
      window.localStorage.setItem(
        LOCAL_BACKUP_KEY,
        JSON.stringify(backup)
      );
      setLastLocalBackupAt(savedAt);
    } catch (error) {
      console.error("Could not save local Enrique's backup:", error);
    }
  }, [
    loaded,
    tables,
    servers,
    waitlist,
    rotation,
    lastSeated,
    shiftHistory,
    partyCounts,
    reservations,
  ]);

  useEffect(() => {
    if (!isOnline) return;
    flushOfflineQueue();
  }, [isOnline]);

  useEffect(() => {
    if (typeof window === "undefined" || !loaded) return;

    const timer = window.setInterval(() => {
      createRecoverySnapshot(
        "automatic",
        `Auto backup ${new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}`
      );
    }, AUTO_SNAPSHOT_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [
    loaded,
    tables,
    servers,
    waitlist,
    rotation,
    lastSeated,
    shiftHistory,
    partyCounts,
    reservations,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {

  async function loadData() {

    const { data: tableData } = await supabase

      .from("host_tables")

      .select("data")

      .eq("id", "main")

      .maybeSingle();

    if (tableData?.data?.tables) {

      setTables(tableData.data.tables);

    } else {

      await supabase.from("host_tables").upsert({

        id: "main",

        data: { tables: ENRIQUES_TABLES },

      });

    }

    const { data: waitData } = await supabase

      .from("host_waitlist")

      .select("data")

      .order("id", { ascending: true });

    if (waitData) {

      setWaitlist(waitData.map((row) => row.data as WaitParty));

    }

    const { data: reservationData, error: reservationError } =
      await supabase
        .from("host_reservations")
        .select("id, data")
        .order("created_at", { ascending: true });

    if (!reservationError && reservationData) {
      setReservations(
        reservationData
          .map((row) => row.data as ReservationRecord)
          .filter(Boolean)
          .sort((a, b) =>
            `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
          )
      );
    }

    const { data: shiftData, error: shiftError } = await supabase
      .from("host_shift_history")
      .select("id, data")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!shiftError && shiftData) {
      setShiftHistory(shiftData.map((row) => row.data).filter(Boolean));
    }

    setLoaded(true);

  }

  loadData();

  const channel = supabase

    .channel("host-v2-sync")

    .on(

      "postgres_changes",

      { event: "*", schema: "public", table: "host_tables" },

      async () => {

        const { data } = await supabase

          .from("host_tables")

          .select("data")

          .eq("id", "main")

          .maybeSingle();

        if (data?.data?.tables) {
          const cloudUpdatedAt =
            data.data.syncUpdatedAt ||
            data.data.updatedAt ||
            0;

          const cloudDeviceId = data.data.syncDeviceId || "";

          if (
            cloudDeviceId &&
            cloudDeviceId === deviceIdRef.current
          ) {
            return;
          }

          if (queueHasTypePrefix("host_tables")) {
            setSyncConflictNotice(
              "Another iPad updated the floor while this iPad has unsynced floor changes. Your local floor is being protected until sync finishes."
            );
            return;
          }

          if (cloudUpdatedAt > lastLocalSaveRef.current) {
            lastLocalSaveRef.current = cloudUpdatedAt;
            setTables(data.data.tables);
            setSyncConflictNotice("");
            markRemoteUpdate("Floor updated by another iPad");
          }
        }

      }

    )

    .on(

      "postgres_changes",

      { event: "*", schema: "public", table: "host_waitlist" },

      async () => {

        const { data } = await supabase

          .from("host_waitlist")

          .select("data")

          .order("id", { ascending: true });

        if (data) {
          if (queueHasTypePrefix("host_waitlist")) {
            setSyncConflictNotice(
              "Another iPad updated the waitlist while this iPad has unsynced waitlist changes. Local changes are protected until sync finishes."
            );
            return;
          }

          setWaitlist(data.map((row) => row.data as WaitParty));
          markRemoteUpdate("Waitlist updated by another iPad");
        }

      }

    )

    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "host_reservations" },
      async () => {
        if (queueHasTypePrefix("host_reservations")) {
          setSyncConflictNotice(
            "Another iPad updated reservations while this iPad has unsynced reservation changes. Local changes are protected until sync finishes."
          );
          return;
        }

        const { data } = await supabase
          .from("host_reservations")
          .select("id, data")
          .order("created_at", { ascending: true });

        if (data) {
          setReservations(
            data
              .map((row) => row.data as ReservationRecord)
              .filter(Boolean)
              .sort((a, b) =>
                `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
              )
          );
          markRemoteUpdate("Reservations updated by another iPad");
        }
      }
    )

    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "host_servers" },
      async () => {
        if (queueHasTypePrefix("host_servers")) {
          setSyncConflictNotice(
            "Another iPad updated server information while this iPad has unsynced server changes. Local changes are protected until sync finishes."
          );
          return;
        }

        const { data } = await supabase
          .from("host_servers")
          .select("id, data");

        if (data) {
          setServers(
            data
              .map((row) => row.data as ServerInfo)
              .filter(Boolean)
          );
          setSyncConflictNotice("");
          markRemoteUpdate("Server board updated by another iPad");
        }
      }
    )

    .subscribe();

  return () => {

    supabase.removeChannel(channel);

  };

}, []);

  useEffect(() => {

  async function loadServers() {

    const { data, error } = await supabase

      .from("host_servers")

      .select("id, data");

    if (error) {

      console.error("Could not load servers:", error);

      return;

    }

    const savedServers: ServerInfo[] = (data || [])

      .map((row) => row.data as ServerInfo)

      .filter(Boolean);

    setServers(savedServers);

  }

  loadServers();

}, []);

  useEffect(() => {
  
    if (!lastSeatAction) return;

  const remainingTime =
    
    30000 - (Date.now() - lastSeatAction.createdAt);

  if (remainingTime <= 0) {
   
    setLastSeatAction(null);
   
    return;
 
  }

  const timer = setTimeout(() => {
    
    setLastSeatAction(null);
  
  }, remainingTime);

  return () => clearTimeout(timer);

  }, [lastSeatAction]);
 
  useEffect(() => {

    if (!loaded) return;

    const timer = setTimeout(() => {

      saveTablesNow(tables);

    }, 500);

    return () => clearTimeout(timer);

  }, [tables, loaded]);

  async function addServer() {
    const name = newServerName.trim();

    if (!name) {
      alert("Enter the server's name.");
      return;
    }

    const server: ServerInfo = {
      id: `server-${Date.now()}`,
      name,
      startTime: newServerStartTime,
      status: "Off",
      color: pickServerColor(servers),
      tables: [],
    };

    setServers((current) => [...current, server]);
    setNewServerName("");
    setNewServerStartTime("");

    await syncOrQueue({
      type: "host_servers_upsert",
      payload: {
        rows: [{ id: server.id, data: server }],
      },
    });
  }

  function unlockManager() {

    if (pin.trim() === "1884") {

      setManagerUnlocked(true);

      setPin("");

    } else {

      alert("Wrong manager PIN");

    }

  }

  async function cycleTable(id: string) {
  
    if (editMode) return;

  const nextTables = tables.map((table) => {
    
    if (table.id !== id) return table;

    const currentIndex = STATUS_ORDER.indexOf(table.status);

    const nextStatus =
     
      STATUS_ORDER[
        
      (currentIndex + 1) % STATUS_ORDER.length
      
      ];

    return {
      
      ...table,
     
      status: nextStatus,
      
      seatedAt:
       
        nextStatus === "Seated"
         
        ? Date.now()
         
        : table.seatedAt,
      
      guest:
        
        nextStatus === "Open"
          
        ? undefined
         
        : table.guest,
      
      partySize:
        
        nextStatus === "Open"
         
        ? undefined
         
        : table.partySize,

      // Leave the assigned server exactly as it is.
      
      server: table.server,
   
    };
 
  });

  setTables(nextTables);
  
    await saveTablesNow(nextTables);

  }
 
  async function endShift() {
    if (!managerUnlocked) {
      alert("Manager must unlock first.");
      return;
    }

    const endedAt = Date.now();
    const activeServers = servers.filter(
      (server) => server.status !== "Off" || server.checkedInAt
    );

    const shiftSnapshot = {
      id: `shift-${endedAt}`,
      endedAt,
      date: new Date(endedAt).toLocaleDateString(),
      endedTime: new Date(endedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      tableSummary: {
        open: tables.filter((table) => table.status === "Open").length,
        seated: tables.filter((table) => table.status === "Seated").length,
        boxed: tables.filter((table) => table.status === "Boxed").length,
        dirty: tables.filter((table) => table.status === "Dirty").length,
      },
      servers: activeServers.map((server) => ({
        id: server.id,
        name: server.name,
        startTime: server.startTime,
        cutTime: server.cutTime,
        status: server.status,
        checkedInAt: server.checkedInAt,
        assignedTables: [...server.tables],
        lastSeatedAt: lastSeated[server.name] || null,
      })),
      rotation: [...rotation],
      waitlist: waitlist.map((party) => ({ ...party })),
      reservations: reservations.map((reservation) => ({ ...reservation })),
      floor: tables.map((table) => ({ ...table })),
    };

    const okay = confirm(
      `End this shift?\n\nServers worked: ${activeServers.length}\nTables currently seated: ${shiftSnapshot.tableSummary.seated}\nWaitlist entries: ${waitlist.length}\n\nThe shift will be protected locally immediately and synced to the cloud when available.`
    );

    if (!okay) return;

    createRecoverySnapshot(
      "before-end-shift",
      `Before End Shift ${new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`
    );

    setShiftHistory((current) =>
      [shiftSnapshot, ...current].slice(0, 30)
    );

    await syncOrQueue({
      type: "host_shift_history_insert",
      payload: {
        id: shiftSnapshot.id,
        data: shiftSnapshot,
      },
    });

    const updatedAt = Date.now();

    const nextTables: TableItem[] = tables.map((table) => ({
      ...table,
      status: "Open" as TableStatus,
      guest: undefined,
      partySize: undefined,
      seatedAt: undefined,
      statusStartedAt: undefined,
      server: undefined,
    }));

    const nextServers: ServerInfo[] = servers.map((server) => ({
      ...server,
      status: "Off",
      checkedInAt: undefined,
      cutTime: undefined,
      tables: [],
    }));

    lastLocalSaveRef.current = updatedAt;

    setTables(nextTables);
    setServers(nextServers);
    setRotation([]);
    setLastSeated({});
    setPartyCounts({});
    setLastSeatAction(null);
    setSeatingServerName(null);
    setSelectedServer(null);
    setPartySeatingMode(false);
    setSelectedPartyTables([]);
    setPartyServerId(null);
    setPartyGuestCount("");
    setFloorCheckMode(false);
    setFloorCheckStatus(null);
    setDraggingId(null);
    setEditMode(false);
    setFloorLocked(true);

    await syncOrQueue({
      type: "host_tables_upsert",
      payload: {
        id: "main",
        data: { tables: nextTables, updatedAt },
      },
    });

    if (nextServers.length > 0) {
      await syncOrQueue({
        type: "host_servers_upsert",
        payload: {
          rows: nextServers.map((server) => ({
            id: server.id,
            data: server,
          })),
        },
      });
    }

    alert(
      typeof window !== "undefined" && !window.navigator.onLine
        ? "Shift ended and protected on this iPad. It will sync automatically when internet returns."
        : "Shift archived and ended successfully."
    );
  }

  function startDrag(id: string) {

    if (!editMode || floorLocked) return;

    setDraggingId(id);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (!draggingId || !editMode || floorLocked) return;

    const map = e.currentTarget.getBoundingClientRect();

    const scale = map.width / 1500;

    const x = snap((e.clientX - map.left) / scale);

    const y = snap((e.clientY - map.top) / scale);

    setTables((prev) =>

      prev.map((table) =>

        table.id === draggingId

          ? {

              ...table,

              x: snap(x - table.w / 2),

              y: snap(y - table.h / 2),

            }

          : table

      )

    );

  }

  function stopDrag() {

    setDraggingId(null);

  }

  const wall = (x: number, y: number, w: number, h: number) => (

    <div

      key={`${x}-${y}-${w}-${h}`}

      style={{

        position: "absolute",

        left: x,

        top: y,

        width: w,

        height: h,

        background: "#111827",

        zIndex: 1,

      }}

    />

  );

  return (

    <main

      style={{

        minHeight: "100vh",

        background: "#f4f1e8",

        padding: 16,

        fontFamily: "Arial",

      }}

    >

      {!isOnline && (
        <div
          style={{
            background: "#fef3c7",
            border: "3px solid #d97706",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontWeight: "bold",
          }}
        >
          📶 Offline Mode — service can continue. Changes are being saved on this iPad
          and queued for automatic cloud sync when internet returns.
        </div>
      )}

      {isOnline && restoredFromLocal && lastLocalBackupAt && (
        <div
          style={{
            background: "#ecfdf5",
            border: "2px solid #16a34a",
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          ✅ Local recovery backup available • Last protected{" "}
          {new Date(lastLocalBackupAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}

      {syncConflictNotice && (
        <div
          style={{
            background: "#fff7ed",
            border: "3px solid #ea580c",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontWeight: "bold",
          }}
        >
          ⚠ Multi-iPad Sync Protection: {syncConflictNotice}
        </div>
      )}

      {lastRemoteUpdateAt && (
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            marginBottom: 8,
          }}
        >
          📱 {lastRemoteUpdateLabel} •{" "}
          {new Date(lastRemoteUpdateAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}

      {reservationBookMode ? (
        <section
          style={{
            minHeight: "calc(100vh - 32px)",
            background: "#fffdf7",
            border: "4px solid #111827",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>📖 Enrique’s Reservation Book</h1>
              <div style={{ fontSize: 13, color: "#475569" }}>
                Dedicated reservation iPad • Host floor controls are hidden
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setReservationBookWeekOffset((v) => v - 1)}>
                ← Previous Week
              </button>
              <button onClick={() => setReservationBookWeekOffset(0)}>
                This Week
              </button>
              <button onClick={() => setReservationBookWeekOffset((v) => v + 1)}>
                Next Week →
              </button>
              <button onClick={toggleReservationBookMode}>
                Exit Reservation Book
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(240px, 1fr))",
              gap: 10,
              overflowX: "auto",
              alignItems: "start",
            }}
          >
            {getWeekDates(reservationBookWeekOffset).map((date) => {
              const dateString = formatBookDate(date);
              const slots = getSlotsForDate(dateString);

              return (
                <div
                  key={dateString}
                  style={{
                    minWidth: 240,
                    border: "3px solid #111827",
                    borderRadius: 10,
                    background: "white",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#111827",
                      color: "white",
                      padding: 10,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {formatBookDayLabel(date)}
                  </div>

                  <div
                    style={{
                      maxHeight: "70vh",
                      overflowY: "auto",
                    }}
                  >
                    {slots.map((displayTime) => {
                      const slotReservations = reservationsForSlot(
                        dateString,
                        displayTime
                      );
                      const isFull = slotReservations.length >= 5;

                      return (
                        <div
                          key={`${dateString}-${displayTime}`}
                          onClick={() =>
                            selectReservationBookSlot(
                              dateString,
                              displayTime
                            )
                          }
                          style={{
                            borderBottom: "1px solid #e2e8f0",
                            padding: 7,
                            background:
                              reservationBookSelectedSlot ===
                              `${dateString}|${displayTime}`
                                ? "#dbeafe"
                                : isFull
                                  ? "#fee2e2"
                                  : "white",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            <strong style={{ fontSize: 12 }}>
                              {displayTime}
                            </strong>

                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: "bold",
                                color: isFull ? "#991b1b" : "#475569",
                              }}
                            >
                              {slotReservations.length}/5
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              marginTop: 4,
                            }}
                          >
                            {slotReservations.map((reservation) => (
                              <div
                                key={reservation.id}
                                style={{
                                  border: "1px solid #94a3b8",
                                  borderRadius: 6,
                                  padding: "4px 5px",
                                  background: "#f8fafc",
                                  fontSize: 10,
                                }}
                              >
                                <strong>
                                  {reservation.name} • {reservation.guests}
                                </strong>
                                {Number(reservation.guests) >= 10 && (
                                  <span style={{ color: "#b91c1c" }}>
                                    {" "}⚠ 10+
                                  </span>
                                )}
                                <div style={{ color: "#64748b", marginTop: 1 }}>
                                  {reservation.status}
                                  {reservation.notes
                                    ? ` • ${reservation.notes}`
                                    : ""}
                                </div>
                              </div>
                            ))}

                            {slotReservations.length === 0 && (
                              <div
                                style={{
                                  color: "#94a3b8",
                                  fontSize: 10,
                                }}
                              >
                                Open
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 14,
              border: "3px solid #2563eb",
              borderRadius: 10,
              background: "white",
              padding: 12,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>
              Add Reservation
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.2fr .9fr .8fr .6fr 1fr",
                gap: 7,
                marginBottom: 7,
              }}
            >
              <input
                value={reservationName}
                onChange={(event) =>
                  setReservationName(event.target.value)
                }
                placeholder="Guest name"
                style={{ padding: 9 }}
              />
              <input
                type="date"
                value={reservationDate}
                onChange={(event) =>
                  setReservationDate(event.target.value)
                }
                style={{ padding: 9 }}
              />
              <input
                type="time"
                value={reservationTime}
                onChange={(event) =>
                  setReservationTime(event.target.value)
                }
                style={{ padding: 9 }}
              />
              <input
                type="number"
                min="1"
                value={reservationGuests}
                onChange={(event) =>
                  setReservationGuests(event.target.value)
                }
                placeholder="Guests"
                style={{ padding: 9 }}
              />
              <input
                value={reservationPhone}
                onChange={(event) =>
                  setReservationPhone(event.target.value)
                }
                placeholder="Phone"
                style={{ padding: 9 }}
              />
            </div>

            <div style={{ display: "flex", gap: 7 }}>
              <input
                value={reservationNotes}
                onChange={(event) =>
                  setReservationNotes(event.target.value)
                }
                placeholder="Special request / notes"
                style={{ flex: 1, padding: 9 }}
              />
              <button
                onClick={addReservation}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontWeight: "bold",
                }}
              >
                Add Reservation
              </button>
            </div>

            {reservationDate &&
              reservationTime &&
              reservations.filter(
                (reservation) =>
                  reservation.date === reservationDate &&
                  reservation.time === reservationTime &&
                  reservation.status !== "Cancelled"
              ).length >= 5 && (
                <div
                  style={{
                    marginTop: 8,
                    background: "#fee2e2",
                    border: "2px solid #dc2626",
                    borderRadius: 8,
                    padding: 8,
                    fontWeight: "bold",
                    color: "#991b1b",
                  }}
                >
                  ⚠ This 15-minute slot already has 5 reservations.
                </div>
              )}
          </div>
        </section>
      ) : (
      <>

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          alignItems: "center",

          marginBottom: 12,

        }}

      >

        <h1 style={{ margin: 0 }}>

  Enrique’s OS

  <div style={{ fontSize: 13, color: "#475569", fontWeight: "normal" }}>

    Host • Reservations • Waitlist • Manager

  </div>

</h1>

        {!managerUnlocked ? (

          <>

            <input

              type="password"

              value={pin}

              onChange={(e) => setPin(e.target.value)}

              placeholder="Manager PIN"

              style={{

                padding: 8,

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            />

            <button onClick={unlockManager}>Unlock</button>

          </>

        ) : (

          <button onClick={() => setManagerUnlocked(false)}>

            Manager Unlocked

          </button>

        )}

        <button

          onClick={() => setEditMode((prev) => !prev)}

          disabled={!managerUnlocked}

        >

          {editMode ? "Editing ON" : "Service Mode"}

        </button>

        <button

          onClick={() => setFloorLocked((prev) => !prev)}

          disabled={!managerUnlocked}

        >

          {floorLocked ? "Floor Locked" : "Floor Unlocked"}

        </button>

        <button
          onClick={toggleReservationBookMode}
          style={{
            background: reservationBookMode ? "#7c3aed" : undefined,
            color: reservationBookMode ? "white" : undefined,
          }}
        >
          {reservationBookMode
            ? "Exit Reservation Book"
            : "📖 Reservation Book Mode"}
        </button>

        <button
          onClick={() => {
            setFloorCheckMode((current) => !current);
            setFloorCheckStatus(null);
            setPartySeatingMode(false);
            setSelectedPartyTables([]);
            setPlannerSelectedReservationId(null);
            setSeatingServerName(null);
            setSelectedServer(null);
          }}
          style={{
            background: floorCheckMode ? "#111827" : undefined,
            color: floorCheckMode ? "white" : undefined,
          }}
        >
          {floorCheckMode ? "Close Floor Check" : "🧹 Floor Check"}
        </button>

        <button
          onClick={() => setReservationBookOpen((current) => !current)}
        >
          {reservationBookOpen ? "Close Reservations" : "📅 Reservations"}
        </button>

        <button
          onClick={() => {
            setHeadHostMode((current) => !current);
            setPlannerSelectedReservationId(null);
            setPartySeatingMode(false);
            setSelectedPartyTables([]);
            setPartyServerId(null);
            setPartyGuestCount("");
          }}
        >
          {headHostMode ? "Close Head Host" : "👑 Head Host"}
        </button>

        <button
          onClick={() => {
            if (editMode) {
              alert("Turn off Editing Mode before seating a party.");
              return;
            }
            setSelectedServer(null);
            setSeatingServerName(null);
            setPartySeatingMode((current) => !current);
            if (partySeatingMode) {
              cancelPartySeating();
            }
          }}
        >
          {partySeatingMode ? "Cancel Party Seating" : "🍽️ Seat Party"}
        </button>

        <button onClick={endShift}>🌙 End Shift</button>
        <button
          onClick={() => setShowShiftHistory((current) => !current)}
          disabled={!managerUnlocked}
        >
          {showShiftHistory ? "Hide Shift History" : "📊 Shift History"}
        </button>

        <button
          onClick={() => setShowRecoveryCenter((current) => !current)}
          disabled={!managerUnlocked}
        >
          {showRecoveryCenter ? "Hide Recovery Center" : "🛟 Recovery Center"}
        </button>

        <span
          style={{
            fontSize: 12,
            padding: "6px 9px",
            borderRadius: 20,
            background: isOnline ? "#dcfce7" : "#fef3c7",
            border: `1px solid ${isOnline ? "#16a34a" : "#d97706"}`,
            fontWeight: "bold",
          }}
        >
          {isOnline
            ? pendingSyncCount > 0
              ? `● Online • ${pendingSyncCount} Pending`
              : "● Online + Synced"
            : `● Offline • ${pendingSyncCount} Pending`}
        </span>

        {pendingSyncCount > 0 && isOnline && (
          <button
            onClick={flushOfflineQueue}
            disabled={isSyncingOfflineQueue}
          >
            {isSyncingOfflineQueue
              ? "Syncing..."
              : `🔄 Sync ${pendingSyncCount}`}
          </button>
        )}

        {lastSyncAt && (
          <span style={{ fontSize: 11, color: "#475569" }}>
            Last sync{" "}
            {new Date(lastSyncAt).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}

      </div>

      {showRecoveryCenter && managerUnlocked && (
        <section
          style={{
            border: "3px solid #111827",
            borderRadius: 10,
            padding: 12,
            background: "white",
            marginBottom: 12,
            maxWidth: 760,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>
            🛟 Recovery Center
          </h2>

          <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
            Protect, restore, and export this iPad's Enrique's OS backup.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                border: "2px solid #cbd5e1",
                borderRadius: 8,
                padding: 10,
                background: "#f8fafc",
              }}
            >
              <strong>Local Backup</strong>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {lastLocalBackupAt
                  ? new Date(lastLocalBackupAt).toLocaleString()
                  : "No local backup yet"}
              </div>
            </div>

            <div
              style={{
                border: "2px solid #cbd5e1",
                borderRadius: 8,
                padding: 10,
                background: "#f8fafc",
              }}
            >
              <strong>Cloud Sync</strong>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
                Device: {deviceIdRef.current || "initializing"}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {isOnline
                  ? pendingSyncCount > 0
                    ? `${pendingSyncCount} pending`
                    : "Up to date"
                  : `${pendingSyncCount} pending • offline`}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button onClick={createManualLocalBackup}>
              💾 Backup Now
            </button>

            <button onClick={restoreFromLocalBackup}>
              ↩ Restore Local Backup
            </button>

            <button onClick={exportRecoveryBackup}>
              ⬇ Export Backup
            </button>

            <button
              onClick={flushOfflineQueue}
              disabled={!isOnline || isSyncingOfflineQueue || pendingSyncCount === 0}
            >
              {isSyncingOfflineQueue
                ? "Syncing..."
                : `🔄 Retry Sync (${pendingSyncCount})`}
            </button>

            <button
              onClick={clearOfflineQueueSafely}
              disabled={pendingSyncCount === 0}
              style={{
                background: pendingSyncCount === 0 ? "#e2e8f0" : "#fee2e2",
              }}
            >
              Clear Pending Queue
            </button>
          </div>

          {recoveryMessage && (
            <div
              style={{
                marginTop: 10,
                padding: 8,
                background: "#ecfdf5",
                border: "1px solid #16a34a",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {recoveryMessage}
            </div>
          )}

          <div
            style={{
              marginTop: 14,
              borderTop: "2px solid #e2e8f0",
              paddingTop: 12,
            }}
          >
            <strong>Recovery Snapshots</strong>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, marginBottom: 8 }}>
              The most recent {MAX_RECOVERY_SNAPSHOTS} snapshots are kept on this iPad.
              Automatic snapshots are created about every 2 minutes during service.
            </div>

            {recoverySnapshots.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: 12 }}>
                No recovery snapshots yet.
              </div>
            ) : (
              recoverySnapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: 8,
                    marginBottom: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                    background: "#f8fafc",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 12 }}>
                      {snapshot.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      {new Date(snapshot.savedAt).toLocaleString()} • {snapshot.reason}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => restoreRecoverySnapshot(snapshot.id)}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteRecoverySnapshot(snapshot.id)}
                      style={{ background: "#fee2e2" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Restore is manager-only and should be used only when the current
            board is incorrect or after a device/browser recovery.
          </div>
        </section>
      )}

      {showShiftHistory && managerUnlocked && (
        <section
          style={{
            border: "3px solid #111827",
            borderRadius: 10,
            padding: 12,
            background: "white",
            marginBottom: 12,
            maxWidth: 760,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Shift History</h2>
          {shiftHistory.length === 0 ? (
            <div style={{ color: "#64748b" }}>No archived shifts yet.</div>
          ) : (
            shiftHistory.map((shift) => (
              <div
                key={shift.id}
                style={{
                  border: "2px solid #cbd5e1",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  background: "#f8fafc",
                }}
              >
                <strong>{shift.date} • {shift.endedTime}</strong>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  Servers: {shift.servers?.length || 0} •{" "}
                  Seated at close: {shift.tableSummary?.seated || 0} •{" "}
                  Waitlist entries: {shift.waitlist?.length || 0}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  {(shift.servers || []).map((server: any) => server.name).join(", ") || "No servers recorded"}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      <div

  style={{

    border: "2px solid #111827",

    borderRadius: 10,

    padding: 12,

    background: "white",

    marginBottom: 12,

    maxWidth: 520,

  }}

>

  <h2 style={{ marginTop: 0, marginBottom: 10 }}>

    Server Center

  </h2>

  <div

    style={{

      display: "flex",

      gap: 8,

      flexWrap: "wrap",

      marginBottom: 12,

    }}

  >

    <input

      value={newServerName}

      onChange={(e) => setNewServerName(e.target.value)}

      placeholder="Server name"

      style={{

        padding: 8,

        border: "2px solid #111827",

        borderRadius: 8,

      }}

    />

    <input

      type="time"

      value={newServerStartTime}

      onChange={(e) => setNewServerStartTime(e.target.value)}

      style={{

        padding: 8,

        border: "2px solid #111827",

        borderRadius: 8,

      }}

    />

    <button onClick={addServer}>

      Add Server

    </button>

  </div>

  {servers.length === 0 ? (

    <div style={{ color: "#64748b" }}>

      No servers added yet.

    </div>

  ) : (

    servers.map((server) => (

      <div

        key={server.id}

        onClick={() =>

  setSelectedServer(current =>

    current === server.id ? null : server.id

  )

}

        style={{

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          padding: 10,

          marginBottom: 6,

          border:

            selectedServer === server.id

              ? "3px solid #2563eb"

              : "2px solid #cbd5e1",

          borderRadius: 8,

          cursor: "pointer",

        }}

      >

        <div>

          <strong>{server.name}</strong>

          <div style={{ fontSize: 12 }}>

            Start: {server.startTime || "Not set"}

          </div>

        </div>

        <button

  onClick={(e) => {

    e.stopPropagation();

    if (confirm(`Delete ${server.name}?`)) {

      deleteServer(server.id);

    }

  }}

  style={{

    background: "#dc2626",

    color: "white",

    border: "none",

    borderRadius: 6,

    padding: "6px 10px",

    marginTop: 8,

    cursor: "pointer",

  }}

>

  Delete Server

</button>
        
        <div

  style={{

    display: "flex",

    alignItems: "center",

    gap: 6,

    flexWrap: "wrap",

    justifyContent: "flex-end",

  }}

>

  <span style={{ fontWeight: "bold" }}>

    {server.status}

  </span>

  {server.status !== "Checked In" && (

    <button

      onClick={(e) => {

        e.stopPropagation();

        checkInServer(server.id);

      }}

    >

      Check In

    </button>

  )}

  {server.status === "Checked In" && (

    <>

 <button

  onClick={(e) => {

    e.stopPropagation();

    updateServerStatus(server.id, "Cut");

  }}

>

  Cut

</button>

<button

  onClick={(e) => {

    e.stopPropagation();

    printServerSection(server.id);

  }}

>

  Print Section

</button>

      <button

        onClick={(e) => {

          e.stopPropagation();

          updateServerStatus(server.id, "Off");

        }}

      >

        Check Out

      </button>

    </>

  )}

  {server.status === "Cut" && (

    <button

      onClick={(e) => {

        e.stopPropagation();

        updateServerStatus(server.id, "Off");

      }}

    >

      Check Out

    </button>

  )}

</div>

      </div>

    ))

  )}

</div>

      {floorCheckMode && (
        <section
          style={{
            border: "4px solid #111827",
            borderRadius: 12,
            padding: 12,
            background: "white",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>🧹 Floor Check</h2>
              <div
                style={{
                  fontSize: 12,
                  color: "#475569",
                  marginTop: 3,
                }}
              >
                Walk the floor and update the real table status.
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(
                [
                  ["Seated", "#bfdbfe"],
                  ["Boxed", "#fde68a"],
                  ["Dirty", "#f87171"],
                  ["Open", "#d8f5df"],
                ] as Array<[TableStatus, string]>
              ).map(([status, background]) => (
                <button
                  key={status}
                  onClick={() =>
                    setFloorCheckStatus((current) =>
                      current === status ? null : status
                    )
                  }
                  style={{
                    background,
                    border:
                      floorCheckStatus === status
                        ? "4px solid #111827"
                        : "2px solid #64748b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontWeight: "bold",
                  }}
                >
                  {status === "Open" ? "Open / Clean" : status}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              padding: 8,
              borderRadius: 8,
              background: "#f8fafc",
              fontSize: 12,
            }}
          >
            {floorCheckStatus ? (
              <>
                <strong>{floorCheckStatus === "Open" ? "Open / Clean" : floorCheckStatus}</strong>{" "}
                selected — tap as many tables as needed.
              </>
            ) : (
              <>
                <strong>Quick Cycle:</strong> tap each table to move{" "}
                Seated → Boxed → Dirty → Open.
              </>
            )}
          </div>
        </section>
      )}

      {reservationBookOpen && (
        <section
          style={{
            border: "4px solid #2563eb",
            borderRadius: 12,
            padding: 12,
            background: "white",
            marginBottom: 14,
          }}
        >
          <h2 style={{ marginTop: 0 }}>📅 Reservation Book</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr .9fr .8fr .6fr 1.1fr",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <input
              value={reservationName}
              onChange={(event) => setReservationName(event.target.value)}
              placeholder="Guest name"
              style={{ padding: 8 }}
            />
            <input
              type="date"
              value={reservationDate}
              onChange={(event) => setReservationDate(event.target.value)}
              style={{ padding: 8 }}
            />
            <input
              type="time"
              value={reservationTime}
              onChange={(event) => setReservationTime(event.target.value)}
              style={{ padding: 8 }}
            />
            <input
              type="number"
              min="1"
              value={reservationGuests}
              onChange={(event) => setReservationGuests(event.target.value)}
              placeholder="Guests"
              style={{ padding: 8 }}
            />
            <input
              value={reservationPhone}
              onChange={(event) => setReservationPhone(event.target.value)}
              placeholder="Phone"
              style={{ padding: 8 }}
            />
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <input
              value={reservationNotes}
              onChange={(event) => setReservationNotes(event.target.value)}
              placeholder="Special request / notes"
              style={{ padding: 8, flex: 1 }}
            />
            <button
              onClick={addReservation}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontWeight: "bold",
              }}
            >
              Add Reservation
            </button>
          </div>

          {reservations.length === 0 ? (
            <div style={{ color: "#64748b" }}>No reservations yet.</div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                style={{
                  border: "2px solid #cbd5e1",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 7,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>
                      {reservation.date} • {reservation.time} • {reservation.name}
                    </strong>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      {reservation.guests} guests
                      {reservation.phone ? ` • ${reservation.phone}` : ""}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 2 }}>
                      Status: {reservation.status} • Tables:{" "}
                      {reservation.tableIds.length
                        ? reservation.tableIds.join(", ")
                        : "Not planned"}
                    </div>
                    {reservation.notes && (
                      <div style={{ fontSize: 11, marginTop: 2 }}>
                        {reservation.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(["Booked", "Arrived", "Seated", "No Show"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateReservation(reservation.id, { status })
                          }
                          style={{
                            fontSize: 10,
                            background:
                              reservation.status === status
                                ? "#dbeafe"
                                : "white",
                          }}
                        >
                          {status}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => deleteReservation(reservation.id)}
                      style={{ background: "#fee2e2" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {headHostMode && (
        <section
          style={{
            border: "4px solid #111827",
            borderRadius: 12,
            padding: 12,
            background: "#f8fafc",
            marginBottom: 14,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 4 }}>
            👑 Head Host Command Board
          </h2>

          <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
            Reservations and live waitlist together for planning the floor.
          </div>

          {plannerSelectedReservationId && (
            <div
              style={{
                background: "#dbeafe",
                border: "2px solid #2563eb",
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                fontSize: 12,
              }}
            >
              <strong>Floor Planning Active:</strong>{" "}
              {
                reservations.find(
                  (reservation) =>
                    reservation.id === plannerSelectedReservationId
                )?.name
              }{" "}
              — tap tables directly on the floor map.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                border: "3px solid #2563eb",
                borderRadius: 10,
                background: "white",
                padding: 10,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Reservations / Table Plan</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr .9fr .8fr .7fr",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <input
                  value={reservationName}
                  onChange={(event) =>
                    setReservationName(event.target.value)
                  }
                  placeholder="Guest name"
                  style={{ padding: 7 }}
                />
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(event) =>
                    setReservationDate(event.target.value)
                  }
                  style={{ padding: 7 }}
                />
                <input
                  value={reservationTime}
                  onChange={(event) =>
                    setReservationTime(event.target.value)
                  }
                  placeholder="Time"
                  style={{ padding: 7 }}
                />
                <input
                  type="number"
                  min="1"
                  value={reservationGuests}
                  onChange={(event) =>
                    setReservationGuests(event.target.value)
                  }
                  placeholder="Guests"
                  style={{ padding: 7 }}
                />
              </div>

              <input
                value={reservationNotes}
                onChange={(event) =>
                  setReservationNotes(event.target.value)
                }
                placeholder="Special request / notes"
                style={{
                  padding: 7,
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: 6,
                }}
              />

              <button
                onClick={addReservation}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  padding: 8,
                  fontWeight: "bold",
                }}
              >
                + Add to Plan
              </button>

              {reservations.filter(
                (reservation) => reservation.date === reservationDate
              ).length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  No reservations for {reservationDate}.
                </div>
              ) : (
                reservations
                  .filter((reservation) => reservation.date === reservationDate)
                  .map((reservation) => (
                  <div
                    key={reservation.id}
                    style={{
                      border: "2px solid #cbd5e1",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 7,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div>
                        <strong>
                          {reservation.time} • {reservation.name}
                        </strong>
                        <div style={{ fontSize: 11 }}>
                          {reservation.guests} guests
                          {reservation.notes
                            ? ` • ${reservation.notes}`
                            : ""}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          deleteReservation(reservation.id)
                        }
                      >
                        Remove
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      Planned Tables:{" "}
                      {reservation.tableIds.length
                        ? reservation.tableIds.join(", ")
                        : "Not assigned"}
                    </div>

                    <button
                      onClick={() =>
                        setPlannerSelectedReservationId((current) =>
                          current === reservation.id
                            ? null
                            : reservation.id
                        )
                      }
                      style={{
                        marginTop: 6,
                        width: "100%",
                        background:
                          plannerSelectedReservationId === reservation.id
                            ? "#2563eb"
                            : "#eff6ff",
                        color:
                          plannerSelectedReservationId === reservation.id
                            ? "white"
                            : "#1d4ed8",
                        border: "2px solid #2563eb",
                        borderRadius: 7,
                        padding: 6,
                        fontWeight: "bold",
                      }}
                    >
                      {plannerSelectedReservationId === reservation.id
                        ? "Planning on Floor — Tap Tables"
                        : "Plan on Floor"}
                    </button>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 6,
                        maxHeight: 105,
                        overflowY: "auto",
                      }}
                    >
                      {tables
                        .filter(
                          (table) =>
                            table.seats !== "Couch" &&
                            table.status === "Open"
                        )
                        .map((table) => (
                          <button
                            key={table.id}
                            onClick={() =>
                              toggleReservationTable(
                                reservation.id,
                                table.id
                              )
                            }
                            style={{
                              fontSize: 10,
                              padding: "4px 6px",
                              border:
                                reservation.tableIds.includes(table.id)
                                  ? "3px solid #2563eb"
                                  : "1px solid #94a3b8",
                              background:
                                reservation.tableIds.includes(table.id)
                                  ? "#dbeafe"
                                  : "white",
                              borderRadius: 6,
                            }}
                          >
                            {table.id}
                          </button>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                border: "3px solid #f59e0b",
                borderRadius: 10,
                background: "white",
                padding: 10,
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Live Waitlist ({waitlist.length})
              </h3>

              {waitlist.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  No parties currently waiting.
                </div>
              ) : (
                waitlist.map((party) => (
                  <div
                    key={party.id}
                    style={{
                      border: "2px solid #fde68a",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 7,
                      background:
                        party.status === "Paged"
                          ? "#fef3c7"
                          : "#fff",
                    }}
                  >
                    <strong>
                      {party.name} • {party.size}
                    </strong>
                    <div style={{ fontSize: 11, marginTop: 2 }}>
                      {party.status} • Quoted {party.quotedWait || "—"}
                    </div>
                    {party.notes && (
                      <div style={{ fontSize: 11, marginTop: 2 }}>
                        {party.notes}
                      </div>
                    )}
                  </div>
                ))
              )}

              <div
                style={{
                  borderTop: "2px solid #e2e8f0",
                  marginTop: 10,
                  paddingTop: 8,
                  fontSize: 11,
                  color: "#475569",
                }}
              >
                Head Host view is planning-only in this release. It does not
                change permanent server sections.
              </div>
            </div>
          </div>
        </section>
      )}

      {partySeatingMode && (
        <section
          style={{
            border: "3px solid #111827",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            marginBottom: 12,
            maxWidth: 760,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>
            🍽️ Party Seating
          </h2>

          <div style={{ fontSize: 13, color: "#475569", marginBottom: 10 }}>
            Tap one or more open tables on the floor, choose the server actually
            receiving the party, enter the guest count, then press Seat Party.
            Section names on the tables will not change.
          </div>

          <div
            style={{
              border: "2px solid #cbd5e1",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              background: "#f8fafc",
            }}
          >
            <strong>
              {selectedPartyTables.length} Table
              {selectedPartyTables.length === 1 ? "" : "s"} Selected
            </strong>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              {selectedPartyTables.length
                ? selectedPartyTables.join(" • ")
                : "Tap open tables on the floor."}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <input
              type="number"
              min="1"
              value={partyGuestCount}
              onChange={(event) => setPartyGuestCount(event.target.value)}
              placeholder="Guest count"
              style={{
                padding: 9,
                border: "2px solid #111827",
                borderRadius: 8,
                width: 130,
              }}
            />
          </div>

          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            Server Receiving Party
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {servers
              .filter((server) => server.status === "Checked In")
              .map((server) => (
                <button
                  key={server.id}
                  onClick={() => setPartyServerId(server.id)}
                  style={{
                    border:
                      partyServerId === server.id
                        ? `4px solid ${server.color || "#2563eb"}`
                        : "2px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "8px 10px",
                    background:
                      rotation[0] === server.name ? "#dcfce7" : "white",
                    fontWeight: "bold",
                  }}
                >
                  {rotation[0] === server.name ? "⭐ " : ""}
                  {server.name}
                  <div style={{ fontSize: 10, fontWeight: "normal" }}>
                    {partyCounts[server.name] || 0} parties sat
                  </div>
                </button>
              ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={completePartySeating}
              disabled={
                selectedPartyTables.length === 0 ||
                !partyServerId ||
                !partyGuestCount
              }
              style={{
                flex: 1,
                padding: 10,
                background:
                  selectedPartyTables.length > 0 &&
                  partyServerId &&
                  partyGuestCount
                    ? "#16a34a"
                    : "#cbd5e1",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
              }}
            >
              Seat Party
            </button>

            <button onClick={cancelPartySeating}>
              Cancel
            </button>
          </div>
        </section>
      )}

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          marginBottom: 12,

        }}

      >

        <Summary label="Open" value={openCount} color={STATUS_COLORS.Open} />

        <Summary label="Seated" value={seatedCount} color={STATUS_COLORS.Seated} />

        <Summary label="Boxed" value={boxedCount} color={STATUS_COLORS.Boxed} />

        <Summary label="Dirty" value={dirtyCount} color={STATUS_COLORS.Dirty} />

      </div>

      {(() => {
        const longestSeated = getLongestTableByStatus("Seated");
        const longestBoxed = getLongestTableByStatus("Boxed");
        const longestDirty = getLongestTableByStatus("Dirty");

        return (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: "#ecfdf5",
                border: "2px solid #16a34a",
                borderRadius: 8,
                padding: 8,
                minWidth: 150,
              }}
            >
              <strong>⏱ Longest Seated</strong>
              <div style={{ fontSize: 12, marginTop: 3 }}>
                {longestSeated
                  ? `Table ${longestSeated.table.id} • ${formatElapsedMinutes(longestSeated.minutes)}`
                  : "—"}
              </div>
            </div>

            <div
              style={{
                background: "#fffbeb",
                border: "2px solid #f59e0b",
                borderRadius: 8,
                padding: 8,
                minWidth: 150,
              }}
            >
              <strong>📦 Longest Boxed</strong>
              <div style={{ fontSize: 12, marginTop: 3 }}>
                {longestBoxed
                  ? `Table ${longestBoxed.table.id} • ${formatElapsedMinutes(longestBoxed.minutes)}`
                  : "—"}
              </div>
            </div>

            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #dc2626",
                borderRadius: 8,
                padding: 8,
                minWidth: 150,
              }}
            >
              <strong>🧹 Longest Dirty</strong>
              <div style={{ fontSize: 12, marginTop: 3 }}>
                {longestDirty
                  ? `Table ${longestDirty.table.id} • ${formatElapsedMinutes(longestDirty.minutes)}`
                  : "—"}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ width: "100%", overflowX: "auto" }}>

        <div

          onPointerMove={dragTable}

          onPointerUp={stopDrag}

          onPointerCancel={stopDrag}

          style={{

            position: "relative",

            width: 1500,

            height: 1040,

            background: "#fbfaf5",

            border: "4px solid #111827",

            overflow: "hidden",

            touchAction: editMode && !floorLocked ? "none" : "auto",

          }}

        >
          {headHostMode && plannerSelectedReservationId && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 260,
                width: 700,
                minHeight: 58,
                background: "#dbeafe",
                border: "3px solid #2563eb",
                borderRadius: 10,
                zIndex: 35,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                boxSizing: "border-box",
              }}
            >
              <div>
                <strong style={{ fontSize: 17 }}>
                  Planning{" "}
                  {
                    reservations.find(
                      (reservation) =>
                        reservation.id === plannerSelectedReservationId
                    )?.name
                  }
                </strong>
                <div style={{ fontSize: 12 }}>
                  Tap open tables to add/remove them from this reservation.
                </div>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setPlannerSelectedReservationId(null);
                }}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  padding: "7px 12px",
                  fontWeight: "bold",
                }}
              >
                Done Planning
              </button>
            </div>
          )}

          {seatingServerName && (
  
          <div
    
            style={{
      
              position: "absolute",
      
              top: 12,
      
              left: 500,
     
              width: 430,
      
              minHeight: 58,
      
              background: "#dcfce7",
      
              border: "3px solid #16a34a",
     
              borderRadius: 10,
      
              zIndex: 30,
      
              display: "flex",
      
              justifyContent: "space-between",
      
              alignItems: "center",
      
              padding: "8px 12px",
     
              boxSizing: "border-box",
   
            }}
  
            >
   
            <div>
     
              <strong style={{ fontSize: 17 }}>
       
                Seating {seatingServerName}
     
              </strong>

      <div style={{ fontSize: 12 }}>
       
        Tap an open table
     
      </div>
    
            </div>

    <button
      
      onClick={(event) => {
       
        event.stopPropagation();
        
        cancelSeatingMode();
     
      }}
      
      style={{
        
        background: "#dc2626",
        
        color: "white",
        
        border: "none",
        
        borderRadius: 7,
       
        padding: "7px 12px",
       
        fontWeight: "bold",
     
      }}
    
      >
     
      Cancel
    
    </button>
  
          </div>

        )}

          {wall(0, 105, 1240, 6)}

          {wall(0, 360, 270, 7)}

          {wall(380, 325, 320, 7)}

          {wall(380, 540, 290, 7)}

          {wall(0, 560, 250, 8)}

          {wall(300, 755, 460, 8)}

          {wall(780, 755, 430, 8)}

          {wall(220, 815, 8, 225)}

          {wall(760, 755, 8, 285)}

          {wall(1210, 755, 8, 285)}

          {wall(800, 575, 360, 8)}

          <div
            
  style={{
    
    position: "absolute",
    
    left: 785,
    
    top: 585,
    
    width: 415,
    
    height: 205,
    
    background: "white",
    
    border: "3px solid #111827",
    
    borderRadius: 10,
    
    padding: 10,
    
    zIndex: 4,
    
    boxSizing: "border-box",
    
    overflow: "hidden",
  
  }}

            >
 
            {/* Header */}
 
            <div
    
              style={{
     
                display: "flex",
      
                justifyContent: "space-between",
      
                alignItems: "center",
      
                marginBottom: 8,
   
              }}
 
              >
    
              <strong style={{ fontSize: 16 }}>
     
                SERVER ROTATION
   
              </strong>

    
              <span
     
                style={{
        
                  fontSize: 12,
        
                  fontWeight: "bold",
       
                  border: "1px solid #94a3b8",
       
                  borderRadius: 20,
       
                  padding: "3px 7px",
        
                  whiteSpace: "nowrap",
     
                }}
    
                >
     
                {rotation.length} Checked In
   
              </span>
 
            </div>

  {rotation.length === 0 ? (
    
              <div
      
                style={{
       
                  height: 105,
       
                  display: "flex",
       
                  alignItems: "center",
        
                  justifyContent: "center",
        
                  color: "#64748b",
       
                  fontSize: 13,
     
                }}
   
                >
     
                No servers checked in
    
              </div>
  
            ) : (
    
              <div
      
                style={{
       
                  display: "flex",
      
                  gap: 6,
       
                  overflowX: "auto",
       
                  overflowY: "hidden",
        
                  paddingBottom: 5,
       
                  WebkitOverflowScrolling: "touch",
      
                }}
   
                >
      
                {rotation.map((name, index) => {
        
                  const server = servers.find(
          
                    (item) => item.name === name
        
                  );

        const seatedTime = lastSeated[name];

        const minutesAgo = seatedTime
         
          ? Math.max(
             
            0,
              
            Math.floor(
              
              (Date.now() - seatedTime) / 60000
             
            )
           
          )
         
          : null;

        return (
          
          <div
            
            key={`${name}-${index}`}
            
            style={{
              
              minWidth: 72,
              
              width: 72,
              
              height: 104,
              
              flexShrink: 0,
              
              border: "1px solid #cbd5e1",
              
              borderRadius: 8,
              
              padding: 6,
              
              boxSizing: "border-box",
              
              textAlign: "center",
             
              background:
               
                index === 0
                  
                ? "#dcfce7"
                  
                : index === 1
                   
                ? "#dbeafe"
                   
                : "#f8fafc",
           
            }}
          
            >
           
            <div
              
              style={{
                
                fontSize: 10,
                
                fontWeight: "bold",
                
                color:
                  
                  index === 0
                    
                  ? "#15803d"
                    
                  : index === 1
                     
                  ? "#1d4ed8"
                    
                  : "#475569",
               
                height: 16,
             
              }}
           
              >
              
              {index === 0
                
                ? "● NEXT"
                
                : index === 1
                 
                ? "● ON DECK"
                
              : `#${index + 1}`}
           
            </div>

           
            <div
              
              style={{
                
                fontSize: 14,
                
                fontWeight: "bold",
                
                marginTop: 2,
                
                overflow: "hidden",
                
                textOverflow: "ellipsis",
                
                whiteSpace: "nowrap",
              
              }}
             
              title={name}
           
              >
             
              {name}
            
            </div>

            <div
              
              style={{
              
                fontSize: 10,
                
                marginTop: 8,
             
              }}
           
              >
             
              {server?.tables.length || 0}{" "}
             
              {(server?.tables.length || 0) === 1
               
                ? "Table"
                
              : "Tables"}
           
            </div>

            <div
              
              style={{
                
                borderTop: "1px solid #cbd5e1",
                
                marginTop: 6,
                
                paddingTop: 5,
                
                fontSize: 10,
                
                color: "#475569",
             
              }}
        
              >
              
              {minutesAgo === null
               
                ? "—"
               
                : minutesAgo === 0
                 
                ? "Just now"
                 
              : `${minutesAgo}m ago`}
            
            </div>
          
          </div>
       
        );
     
                })}
   
              </div>
  
            )}

  
            {/* Buttons */}
 
            <div
   
              style={{
      
                position: "absolute",
      
                left: 10,
     
                right: 10,
      
                bottom: 9,
      
                display: "flex",
     
                gap: 8,
   
              }}
 
              >
   
            {seatingServerName ? (
  
                <button
    
                  onClick={cancelSeatingMode}
    
                  style={{
      
                    flex: 1,
      
                    height: 31,
     
                    border: "none",
      
                    borderRadius: 7,
      
                    background: "#dc2626",
      
                    color: "white",
     
                    fontWeight: "bold",
    
                  }}
  
                  >
    
                  Cancel Seating
 
                </button>

              ) : lastSeatAction ? (
 
                <button
    
                  onClick={undoLastSeat}
    
                  style={{
      
                    flex: 1,
     
                    height: 31,
      
                    border: "none",
     
                    borderRadius: 7,
     
                    background: "#ea580c",
     
                    color: "white",
     
                    fontWeight: "bold",
    
                  }}
  
                  >
   
                  ↩ Undo Last Seat
 
                </button>

              ) : (
  
                <>
   
                  <button
     
                    onClick={seatNextServer}
     
                    disabled={rotation.length === 0}
     
                    style={{
        
                      flex: 1,
       
                      height: 31,
       
                      border: "none",
        
                      borderRadius: 7,
       
                      background:
          
                        rotation.length === 0
            
                        ? "#cbd5e1"
           
                        : "#16a34a",
        
                      color: "white",
      
                      fontWeight: "bold",
     
                    }}
    
                    >
     
                    {rotation.length > 0
       
                    ? `Seat ${rotation[0]}`
       
                    : "Seat Next"}
   
                  </button>
                  
                  <button
      
      onClick={skipNextServer}
     
                    disabled={rotation.length === 0}
    
                    style={{
      
                      flex: 1,
      
                        border: "none",
     
                      borderRadius: 7,
       
                      background:
        
                        rotation.length === 0
           
                        ? "#cbd5e1"
           
                        : "#2563eb",
        
                      color: "white",
      
                      fontWeight: "bold",
     
                    }}
   
                    >
     
                    Skip
   
                  </button>
 
                </>

              )}

              </div>
         
          </div> 

          <Label x={310} y={625} w={335} h={85} text="BAR" blue />

          <Label x={95} y={520} w={150} h={38} text="Take-Out" />

          <Label x={1225} y={735} w={255} h={290} text="Casa 1884" />

          <Label x={1240} y={120} w={245} h={300} text="San Miguel" />

          {tables.map((table) => (

            <div

              key={table.id}

              onPointerDown={() => startDrag(table.id)}

            onClick={async () => {
  
              if (seatingServerName) {
   
                await seatRotationServerAtTable(table.id);
   
                return;
 
              }

  const assigned =
    
    await assignSelectedServerToTable(table.id);

  if (!assigned) {
    
    cycleTable(table.id);
  
  }

   }}

              style={{

                position: "absolute",

                left: table.x,

                top: table.y,

                width: table.w,

                height: table.h,

                background: STATUS_COLORS[table.status],

                border: table.server

  ? servers.find((server) => server.name === table.server)?.status === "Checked In"

    ? `5px solid ${

        servers.find((server) => server.name === table.server)?.color ||

        "#111827"

      }`

    : servers.find((server) => server.name === table.server)?.status === "Cut"

      ? "5px dashed #64748b"

      : "4px solid #cbd5e1"

  : "3px solid #111827",
                
                boxShadow:
  
                  seatingServerName && table.status === "Open"
    
                  ? "0 0 0 7px rgba(34, 197, 94, 0.65)"
   
                  : selectedServer &&
        
                  servers.find(
          
                    (server) => server.id === selectedServer
        
                  )?.name === table.server
     
                  ? `0 0 0 6px ${
         
                    servers.find(
           
                      (server) => server.id === selectedServer
          
                    )?.color || "#2563eb"
       
                  }55`
      
                  : "none",

                opacity:
 
                  seatingServerName
   
                  ? table.status === "Open"
     
                  ? 1
      
                  : 0.45
   
                  : selectedServer &&
       
                  servers.find(
         
          (server) => server.id === selectedServer
        
        )?.name !== table.server
      
                  ? 0.38
      
                  : 1,

                borderRadius: table.seats === "Couch" ? 16 : 8,

                zIndex: 5,

                display: "flex",

                flexDirection: "column",

                justifyContent: "center",

                alignItems: "center",

                fontWeight: "bold",

                cursor: editMode && !floorLocked ? "grab" : "pointer",

                userSelect: "none",

                textAlign: "center",

                fontSize: 13,

              }}

            >
              
<div>{table.id}</div>

{partySeatingMode && selectedPartyTables.includes(table.id) && (
  <div
    style={{
      fontSize: 10,
      fontWeight: "bold",
      color: "#1d4ed8",
      background: "white",
      borderRadius: 10,
      padding: "1px 5px",
      marginTop: 2,
    }}
  >
    ✓ SELECTED
  </div>
)}

{floorCheckMode && (
  <div
    style={{
      fontSize: 9,
      fontWeight: "bold",
      background: "rgba(255,255,255,.88)",
      borderRadius: 5,
      padding: "1px 4px",
      marginTop: 2,
    }}
  >
    {table.status === "Open" ? "CLEAN" : table.status.toUpperCase()}
  </div>
)}

{(() => {
  const plannedReservation = getReservationForTable(table.id);

  if (!plannedReservation) return null;

  const countdown = getReservationCountdownMinutes(plannedReservation);

  return (
    <div
      style={{
        fontSize: 9,
        lineHeight: 1.1,
        fontWeight: "bold",
        color: "#7c2d12",
        background: "#ffedd5",
        border: "1px solid #fb923c",
        borderRadius: 5,
        padding: "2px 4px",
        marginTop: 2,
        maxWidth: "92%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={`${plannedReservation.name} • ${plannedReservation.time}`}
    >
      📅 {plannedReservation.time} {plannedReservation.name}
      {countdown !== null &&
      countdown >= 0 &&
      countdown <= 120
        ? ` • ${countdown}m`
        : ""}
    </div>
  );
})()}

{table.status !== "Open" && getElapsedMinutes(table) !== null && (
  <div
    style={{
      ...getTimerBadgeStyle(table),
      fontSize: 9,
      fontWeight: "bold",
      borderRadius: 10,
      padding: "2px 5px",
      marginTop: 2,
      whiteSpace: "nowrap",
    }}
  >
    ⏱ {formatElapsedMinutes(getElapsedMinutes(table))}
  </div>
)}

{table.server && (

  <div

    style={{

      fontSize: 11,

      color: "#0f172a",

      fontWeight: "bold",

      background: "white",

      padding: "1px 6px",

      borderRadius: 20,

      marginTop: 2

    }}

  >

    {table.server}
    
    {servers.find((server) => server.name === table.server)?.status === "Cut"

  ? " — CUT"

    : servers.find((server) => server.name === table.server)?.status === "Off"

    ? " — NOT IN"

    : ""}

  </div>

)}

<div style={{ fontSize: 11 }}>

  {table.seats}

</div>

<div style={{ fontSize: 10 }}>

  {table.status}

</div>
            </div>

          ))}

        </div>

      </div>

      <p style={{ fontSize: 13, color: "#475569" }}>

        Dirty tables are red. Manager PIN is 1884. Floor must be unlocked to move

        tables.

      </p>

<section

  style={{

    marginTop: 16,

    background: "white",

    border: "3px solid #111827",

    borderRadius: 10,

    padding: 12,

  }}

>

  <h2 style={{ marginTop: 0 }}>Waitlist</h2>

  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" />

    <input value={guestSize} onChange={(e) => setGuestSize(e.target.value)} placeholder="Party size" />

    <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone" />

    <input value={quotedWait} onChange={(e) => setQuotedWait(e.target.value)} placeholder="Quoted wait" />

    <input value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} placeholder="Notes" />

    <button

      onClick={async () => {

        if (!guestName.trim() || !guestSize.trim()) return;

        const party: WaitParty = {

          id: Date.now(),

          name: guestName.trim(),

          size: guestSize.trim(),

          phone: guestPhone.trim(),

          notes: guestNotes.trim(),

          quotedWait: quotedWait.trim() || "15-20",

          status: "Waiting",

          createdAt: Date.now(),

        };

        setWaitlist((current) => [...current, party]);

        await syncOrQueue({
          type: "host_waitlist_insert",
          payload: {
            id: party.id,
            data: party,
          },
        });

        setGuestName("");

        setGuestSize("");

        setGuestPhone("");

        setGuestNotes("");

        setQuotedWait("");

      }}

    >

      Add Wait

    </button>

  </div>

  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>

    {waitlist.map((party) => (

      <div

        key={party.id}

        style={{

          border: "2px solid #111827",

          borderRadius: 8,

          padding: 10,

          background: party.status === "Paged" ? "#fde68a" : "#f8fafc",

          minWidth: 220,

        }}

      >

        <b>{party.name}</b> — {party.size}

        <br />

        Phone: {party.phone || "N/A"}

        <br />

        Wait: {party.quotedWait}

        <br />

        Status: {party.status}

        <br />

        {party.notes && <>Notes: {party.notes}<br /></>}

        <button

          onClick={async () => {

            const updatedParty: WaitParty = {
              ...party,
              status: "Paged",
            };

            setWaitlist((current) =>
              current.map((item) =>
                item.id === party.id ? updatedParty : item
              )
            );

            await syncOrQueue({
              type: "host_waitlist_update",
              payload: {
                id: party.id,
                data: updatedParty,
              },
            });

          }}

        >

          Page

        </button>{" "}

        <button

          onClick={async () => {

            setWaitlist((current) =>
              current.filter((item) => item.id !== party.id)
            );

            await syncOrQueue({
              type: "host_waitlist_delete",
              payload: { id: party.id },
            });

          }}

        >

          Remove

        </button>

      </div>

    ))}

  </div>

</section>

      </>
      )}

    </main>

  );

}

function Summary({

  label,

  value,

  color,

}: {

  label: string;

  value: number;

  color: string;

}) {

  return (

    <div

      style={{

        background: color,

        border: "2px solid #111827",

        borderRadius: 8,

        padding: 10,

        minWidth: 130,

      }}

    >

      <b>{label}</b>

      <div style={{ fontSize: 28 }}>{value}</div>

    </div>

  );

}

function Label({

  x,

  y,

  w,

  h,

  text,

  blue,

}: {

  x: number;

  y: number;

  w: number;

  h: number;

  text: string;

  blue?: boolean;

}) {

  return (

    <div

      style={{

        position: "absolute",

        left: x,

        top: y,

        width: w,

        height: h,

        background: blue ? "#dbeafe" : "#fffdf7",

        border: "4px solid #111827",

        zIndex: 2,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontWeight: "bold",

        fontSize: 22,

        textAlign: "center",

      }}

    >

      {text}

    </div>

  );

}
