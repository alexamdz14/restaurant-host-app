"use client";

import { useEffect, useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Section = "Main" | "Patio" | "Lounge" | "Casa" | "San Miguel";

type WaitStatus = "Waiting" | "Paged" | "Returned" | "NoShow";

type ReservationStatus = "Booked" | "Arrived" | "Seated" | "NoShow" | "Cancelled";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  status: Status;

  section: Section;

  guest?: string;

  partySize?: string;

  seatedAt?: number;

  server?: string;

  combinedId?: string;

  combinedLabel?: string;

  readyFlash?: boolean;

  heldForReservation?: boolean;

};

type WaitParty = {

  id: number;

  name: string;

  size: string;

  pager?: string;

  status?: WaitStatus;

  createdAt: number;

};

type Reservation = {

  id: number;

  date: string;

  time: string;

  name: string;

  phone: string;

  size: string;

  notes: string;

  status: ReservationStatus;

  tableId?: string;

  createdAt: number;

};

type ReservationSettings = {

  year: number;

  tueThuOpen: string;

  tueThuClose: string;

  friSatOpen: string;

  friSatClose: string;

  slotMinutes: number;

  maxReservationsPerSlot: number;

  maxCoversPerSlot: number;

  holdMinutes: number;

  largePartySize: number;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const STORAGE_TABLES = "hostTables_v10";

const STORAGE_WAITLIST = "hostWaitlist_v10";

const STORAGE_ASSIGNMENTS = "hostServerAssignments_v10";

const STORAGE_INFO = "hostInfoBoxes_v10";

const STORAGE_ROTATION_INDEX = "hostServerRotationIndex_v10";

const STORAGE_RESERVATIONS = "hostReservations_v10";

const STORAGE_RESERVATION_SETTINGS = "hostReservationSettings_v10";

const defaultReservationSettings: ReservationSettings = {

  year: 2026,

  tueThuOpen: "15:00",

  tueThuClose: "21:00",

  friSatOpen: "12:00",

  friSatClose: "22:00",

  slotMinutes: 15,

  maxReservationsPerSlot: 5,

  maxCoversPerSlot: 30,

  holdMinutes: 15,

  largePartySize: 10,

};

function makeTable(

  id: string,

  seats: string,

  x: number,

  y: number,

  w = 62,

  h = 48,

  section: Section = "Main"

): TableItem {

  return {

    id,

    seats,

    x: snap(x),

    y: snap(y),

    w: snap(w),

    h: snap(h),

    status: "Open",

    section,

  };

}

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  if (status === "Dirty") return "#f87171";

  return "#e5e7eb";

}

function waitlistColor(status?: WaitStatus) {

  if (status === "Paged") return "#fde68a";

  if (status === "Returned") return "#bbf7d0";

  if (status === "NoShow") return "#fecaca";

  return "#ffffff";

}

function reservationStatusColor(status: ReservationStatus) {

  if (status === "Booked") return "#ffffff";

  if (status === "Arrived") return "#fde68a";

  if (status === "Seated") return "#bbf7d0";

  if (status === "NoShow") return "#fecaca";

  if (status === "Cancelled") return "#e5e7eb";

  return "#ffffff";

}

function minutesSince(time?: number) {

  if (!time) return "";

  const mins = Math.floor((Date.now() - time) / 60000);

  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

}

function seatNumber(seats: string) {

  const n = parseInt(seats, 10);

  return Number.isNaN(n) ? 0 : n;

}

function turnBackground(table: TableItem) {

  if (table.status !== "Seated" || !table.seatedAt) return statusColor(table.status);

  const mins = Math.floor((Date.now() - table.seatedAt) / 60000);

  if (mins >= 60) return "#fecaca";

  if (mins >= 45) return "#fde68a";

  return statusColor(table.status);

}

const serverColors = [

  "#2563eb",

  "#16a34a",

  "#dc2626",

  "#9333ea",

  "#ea580c",

  "#0891b2",

  "#be123c",

  "#0f766e",

];

function getServerColor(server?: string) {

  if (!server) return "#1e3a8a";

  let hash = 0;

  for (let i = 0; i < server.length; i++) {

    hash = server.charCodeAt(i) + ((hash << 5) - hash);

  }

  return serverColors[Math.abs(hash) % serverColors.length];

}

function hexToRgba(hex: string, alpha: number) {

  const clean = hex.replace("#", "");

  const r = parseInt(clean.substring(0, 2), 16);

  const g = parseInt(clean.substring(2, 4), 16);

  const b = parseInt(clean.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;

}

function dayName(dateString: string) {

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", { weekday: "long" });

}

function isClosedDay(dateString: string) {

  const day = dayName(dateString);

  return day === "Sunday" || day === "Monday";

}

function timeToMinutes(time: string) {

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;

}

function minutesToTime(total: number) {

  const hours = Math.floor(total / 60);

  const minutes = total % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

}

function displayTime(time: string) {

  const [h, m] = time.split(":").map(Number);

  const suffix = h >= 12 ? "PM" : "AM";

  const hour = h % 12 || 12;

  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;

}

function getHoursForDate(dateString: string, settings: ReservationSettings) {

  const day = dayName(dateString);

  if (day === "Sunday" || day === "Monday") return null;

  if (day === "Friday" || day === "Saturday") {

    return {

      open: settings.friSatOpen,

      close: settings.friSatClose,

    };

  }

  return {

    open: settings.tueThuOpen,

    close: settings.tueThuClose,

  };

}

function generateReservationSlots(dateString: string, settings: ReservationSettings) {

  const hours = getHoursForDate(dateString, settings);

  if (!hours) return [];

  const open = timeToMinutes(hours.open);

  const close = timeToMinutes(hours.close);

  const slots: string[] = [];

  for (let time = open; time < close; time += settings.slotMinutes) {

    slots.push(minutesToTime(time));

  }

  return slots;

}

function reservationWarnings(

  reservation: Pick<Reservation, "date" | "time" | "size">,

  reservations: Reservation[],

  settings: ReservationSettings

) {

  const warnings: string[] = [];

  if (isClosedDay(reservation.date)) {

    warnings.push("Closed day: Sunday/Monday");

  }

  const sameSlot = reservations.filter(

    (r) =>

      r.date === reservation.date &&

      r.time === reservation.time &&

      r.status !== "Cancelled"

  );

  const slotCovers = sameSlot.reduce(

    (sum, r) => sum + (parseInt(r.size, 10) || 0),

    0

  );

  const partySize = parseInt(reservation.size, 10) || 0;

  if (sameSlot.length >= settings.maxReservationsPerSlot) {

    warnings.push(`Slot full: ${settings.maxReservationsPerSlot} reservations already booked`);

  }

  if (slotCovers + partySize > settings.maxCoversPerSlot) {

    warnings.push(`Cover warning: this slot would exceed ${settings.maxCoversPerSlot} guests`);

  }

  if (partySize >= settings.largePartySize) {

    warnings.push("Large party: 20% auto gratuity applies");

  }

  warnings.push(`Hold policy: reservations held for ${settings.holdMinutes} minutes only`);

  warnings.push("Seating policy: majority of party must be present to be seated");

  return warnings;

}

function reservationDateTimeMs(date: string, time: string) {

  return new Date(`${date}T${time}:00`).getTime();

}

function isReservationWithinHoldWindow(

  reservation: Reservation,

  settings: ReservationSettings

) {

  const now = Date.now();

  const reservationMs = reservationDateTimeMs(reservation.date, reservation.time);

  const startHold = reservationMs - settings.holdMinutes * 60000;

  const endHold = reservationMs + settings.holdMinutes * 60000;

  return now >= startHold && now <= endHold && reservation.status === "Booked";

}

function isSameDayWarning(date: string, time: string) {

  const now = new Date();

  const reservationMs = reservationDateTimeMs(date, time);

  const oneHourFromNow = now.getTime() + 60 * 60000;

  const today =

    date ===

    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(

      now.getDate()

    ).padStart(2, "0")}`;

  return today && reservationMs <= oneHourFromNow;

}

const defaultTables: TableItem[] = [

  makeTable("P1", "4", 55, 35, 55, 58, "Patio"),

  makeTable("P2", "4", 145, 35, 55, 58, "Patio"),

  makeTable("P3", "4", 380, 35, 55, 58, "Patio"),

  makeTable("P4", "4", 470, 35, 55, 58, "Patio"),

  makeTable("P5", "4", 665, 35, 55, 58, "Patio"),

  makeTable("P6", "4", 755, 35, 55, 58, "Patio"),

  makeTable("P7", "4", 965, 35, 55, 58, "Patio"),

  makeTable("P8", "6", 1055, 35, 55, 58, "Patio"),

  makeTable("19", "5", 38, 150, 58, 110),

  makeTable("20", "4", 175, 145, 82, 42),

  makeTable("21", "4", 275, 145, 82, 42),

  makeTable("22", "4", 420, 135, 52, 84),

  makeTable("23", "4", 495, 135, 52, 84),

  makeTable("24", "4", 570, 135, 52, 84),

  makeTable("26", "4", 760, 145, 82, 42),

  makeTable("27", "4", 860, 145, 82, 42),

  makeTable("28", "4", 960, 145, 82, 42),

  makeTable("29", "4", 1060, 145, 82, 42),

  makeTable("18", "5", 45, 305, 82, 42),

  makeTable("17", "4", 140, 305, 82, 42),

  makeTable("16", "4", 235, 305, 82, 42),

  makeTable("15", "4", 395, 265, 82, 42),

  makeTable("14", "4", 500, 265, 82, 42),

  makeTable("13", "4", 605, 265, 82, 42),

  makeTable("9", "4", 395, 365, 82, 42),

  makeTable("10", "4", 500, 365, 82, 42),

  makeTable("11", "4", 605, 365, 82, 42),

  makeTable("12", "7", 720, 285, 60, 130),

  makeTable("32", "4", 825, 250, 55, 92),

  makeTable("33", "4", 825, 365, 55, 92),

  makeTable("31", "5", 960, 350, 82, 48),

  makeTable("30", "5", 1060, 350, 82, 48),

  makeTable("38", "7", 1165, 245, 55, 105),

  makeTable("37", "5", 1165, 445, 55, 90),

  makeTable("7", "4", 420, 440, 52, 82),

  makeTable("6", "4", 525, 440, 52, 82),

  makeTable("3", "2", 380, 580, 62, 40),

  makeTable("4", "2", 475, 580, 62, 40),

  makeTable("5", "2", 570, 580, 62, 40),

  makeTable("34", "6", 865, 455, 55, 88),

  makeTable("35", "6", 960, 455, 55, 88),

  makeTable("36", "6", 1055, 455, 55, 88),

  makeTable("2", "4", 135, 590, 78, 42),

  makeTable("1", "4", 135, 665, 78, 42),

  makeTable("DL4", "4", 45, 775, 75, 42, "Lounge"),

  makeTable("DL3", "4", 45, 860, 75, 42, "Lounge"),

  makeTable("DL2", "4", 45, 945, 75, 42, "Lounge"),

  makeTable("DL1", "4", 145, 940, 70, 58, "Lounge"),

  makeTable("L10", "6", 250, 815, 92, 42, "Lounge"),

  makeTable("L9", "2", 250, 885, 58, 42, "Lounge"),

  makeTable("L1", "4", 390, 775, 78, 42, "Lounge"),

  makeTable("L2", "4", 490, 775, 78, 42, "Lounge"),

  makeTable("L3", "4", 590, 775, 78, 42, "Lounge"),

  makeTable("L4", "6", 670, 860, 75, 42, "Lounge"),

  makeTable("L11", "Couch", 435, 855, 58, 46, "Lounge"),

  makeTable("L12", "Couch", 520, 855, 58, 46, "Lounge"),

  makeTable("L8", "4", 385, 930, 52, 75, "Lounge"),

  makeTable("L7", "4", 475, 930, 52, 75, "Lounge"),

  makeTable("L6", "4", 565, 930, 52, 75, "Lounge"),

  makeTable("L5", "8", 670, 930, 82, 70, "Lounge"),

  makeTable("Casa 8", "4", 840, 790, 55, 82, "Casa"),

  makeTable("Casa 1", "4", 955, 790, 55, 82, "Casa"),

  makeTable("Casa 2", "4", 1070, 790, 55, 82, "Casa"),

  makeTable("Casa 7", "4", 800, 885, 80, 42, "Casa"),

  makeTable("Casa 9", "4", 910, 885, 80, 42, "Casa"),

  makeTable("Casa 10", "4", 1020, 885, 80, 42, "Casa"),

  makeTable("Casa 3", "4", 1110, 885, 65, 42, "Casa"),

  makeTable("Casa 6", "4", 850, 960, 60, 42, "Casa"),

  makeTable("Casa 5", "4", 960, 960, 60, 42, "Casa"),

  makeTable("Casa 4", "4", 1070, 960, 60, 42, "Casa"),

  makeTable("San Miguel 1", "12", 1310, 410, 145, 60, "San Miguel"),

  makeTable("San Miguel 2", "12", 1310, 510, 145, 60, "San Miguel"),

];

export default function Home() {

  const [activeTab, setActiveTab] = useState<"host" | "reservations">("host");

  const [editMode, setEditMode] = useState(false);

  const [combineMode, setCombineMode] = useState(false);

  const [selectedCombineIds, setSelectedCombineIds] = useState<string[]>([]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [partySize, setPartySize] = useState("");

  const [pager, setPager] = useState("");

  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  const [serverAssignments, setServerAssignments] = useState(

    "Maria: 1,2,3\nJose: 20,21,22"

  );

  const [rotationIndex, setRotationIndex] = useState(0);

  const [hostInfo, setHostInfo] = useState("PODIUM:\nSEATER 1:\nSEATER 2:\nSEATER 3:");

  const [takeoutInfo, setTakeoutInfo] = useState("Take-Out");

  const [casaInfo, setCasaInfo] = useState(

    "GUEST NAME:\n\nARRIVAL TIME:\n\nGUEST COUNT:\n\nSERVER:"

  );

  const [sanMiguelInfo, setSanMiguelInfo] = useState(

    "GUEST NAME:\n\nARRIVAL TIME:\n\nGUESTS:\n\nSERVER:"

  );

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [reservationSettings, setReservationSettings] =

    useState<ReservationSettings>(defaultReservationSettings);

  const [reservationDate, setReservationDate] = useState("2026-01-01");

  const [reservationTime, setReservationTime] = useState("");

  const [reservationName, setReservationName] = useState("");

  const [reservationPhone, setReservationPhone] = useState("");

  const [reservationSize, setReservationSize] = useState("");

  const [reservationNotes, setReservationNotes] = useState("");

  const [reservationSearch, setReservationSearch] = useState("");

  const [, setTick] = useState(0);

  function cycleWaitStatus(id: number) {

    setWaitlist((prev) =>

      prev.map((p) => {

        if (p.id !== id) return p;

        const order: WaitStatus[] = [

          "Waiting",

          "Paged",

          "Returned",

          "NoShow",

        ];

        const currentStatus = p.status || "Waiting";

        const next =

          order[(order.indexOf(currentStatus) + 1) % order.length];

        return {

          ...p,

          status: next,

        };

      })

    );

  }

  function serverNamesFromAssignments() {

    return serverAssignments

      .split("\n")

      .map((line) => line.split(":")[0]?.trim())

      .filter((name): name is string => Boolean(name));

  }

  function assignedServerForTable(tableId: string) {

    const lines = serverAssignments.split("\n");

    for (const line of lines) {

      const [serverName, tableList] = line.split(":");

      if (!serverName || !tableList) continue;

      const ids = tableList.split(",").map((id) => id.trim());

      if (ids.includes(tableId)) return serverName.trim();

    }

    return "";

  }

  function getServerWorkload(server: string) {

    const serverTables = tables.filter((table) => {

      const assigned = assignedServerForTable(table.id) || table.server;

      return assigned === server;

    });

    const seatedTables = serverTables.filter(

      (table) => table.status === "Seated"

    );

    const covers = seatedTables.reduce((sum, table) => {

      if (table.partySize) {

        return sum + (parseInt(table.partySize, 10) || 0);

      }

      return sum + seatNumber(table.seats);

    }, 0);

    return {

      seatedTables: seatedTables.length,

      covers,

    };

  }

  function nextServerName() {

    const names = serverNamesFromAssignments();

    if (names.length === 0) return "";

    const orderedNames = [

      ...names.slice(rotationIndex),

      ...names.slice(0, rotationIndex),

    ];

    const ranked = orderedNames

      .map((name, index) => {

        const workload = getServerWorkload(name);

        return {

          name,

          index,

          seatedTables: workload.seatedTables,

          covers: workload.covers,

        };

      })

      .sort((a, b) => {

        if (a.seatedTables !== b.seatedTables) {

          return a.seatedTables - b.seatedTables;

        }

        if (a.covers !== b.covers) {

          return a.covers - b.covers;

        }

        return a.index - b.index;

      });

    return ranked[0]?.name || "";

  }

  function rotateServer() {

    const names = serverNamesFromAssignments();

    const smartNext = nextServerName();

    if (names.length === 0 || !smartNext) return;

    const currentIndex = names.indexOf(smartNext);

    setRotationIndex((currentIndex + 1) % names.length);

  }

  function serverGroups() {

    const groups: Record<string, TableItem[]> = {};

    for (const table of tables) {

      const server = assignedServerForTable(table.id);

      if (!server) continue;

      if (!groups[server]) groups[server] = [];

      groups[server].push(table);

    }

    return groups;

  }

  function serverWorkloads() {

    return serverNamesFromAssignments().map((server) => {

      const assignedTables = tables.filter(

        (table) => assignedServerForTable(table.id) === server

      );

      const seatedTables = assignedTables.filter(

        (table) => table.status === "Seated"

      );

      const covers = seatedTables.reduce((sum, table) => {

        if (table.partySize) {

          return sum + (parseInt(table.partySize, 10) || 0);

        }

        return sum + seatNumber(table.seats);

      }, 0);

      return {

        server,

        color: getServerColor(server),

        assignedCount: assignedTables.length,

        seatedCount: seatedTables.length,

        covers,

      };

    });

  }

  const selectedParty = waitlist.find(

    (p) => p.id === selectedPartyId

  );

  const selectedSize = selectedParty

    ? parseInt(selectedParty.size, 10)

    : 0;

  function availableSeats(

    table: TableItem,

    allTables: TableItem[]

  ) {

    if (!table.combinedId) return seatNumber(table.seats);

    return allTables

      .filter((t) => t.combinedId === table.combinedId)

      .reduce((sum, t) => sum + seatNumber(t.seats), 0);

  }

  const bestTable =

    selectedParty && !Number.isNaN(selectedSize)

      ? tables

          .filter(

            (t) =>

              t.status === "Open" &&

              availableSeats(t, tables) >= selectedSize

          )

          .sort(

            (a, b) =>

              availableSeats(a, tables) -

              selectedSize -

              (availableSeats(b, tables) - selectedSize)

          )[0]

      : undefined;

  function estimatedWait(size: string) {

    const party = parseInt(size, 10);

    if (Number.isNaN(party)) return "~?";

    const openFit = tables.some(

      (t) =>

        t.status === "Open" &&

        availableSeats(t, tables) >= party

    );

    if (openFit) return "now";

    const seatedFits = tables

      .filter(

        (t) =>

          t.status === "Seated" &&

          availableSeats(t, tables) >= party

      )

      .map((t) => {

        const minsSat = t.seatedAt

          ? Math.floor((Date.now() - t.seatedAt) / 60000)

          : 0;

        return Math.max(10, 80 - minsSat);

      });

    if (seatedFits.length > 0) {

      return `~${Math.min(...seatedFits)} min`;

    }

    const dirtyFit = tables.some(

      (t) =>

        t.status === "Dirty" &&

        availableSeats(t, tables) >= party

    );

    if (dirtyFit) return "~10 min";

    const boxedFit = tables.some(

      (t) =>

        t.status === "Boxed" &&

        availableSeats(t, tables) >= party

    );

    if (boxedFit) return "~20 min";

    return "no fit";

  }

  function addReservation() {

    if (

      !reservationDate ||

      !reservationTime ||

      !reservationName.trim() ||

      !reservationSize.trim()

    ) {

      return;

    }

    const newReservation: Reservation = {

      id: Date.now(),

      name: reservationName.trim(),

      phone: reservationPhone.trim(),

      size: reservationSize.trim(),

      date: reservationDate,

      time: reservationTime,

      notes: reservationNotes.trim(),

      createdAt: Date.now(),

      status: "Booked",

    };

    setReservations((prev) => [...prev, newReservation]);

    setReservationName("");

    setReservationPhone("");

    setReservationSize("");

    setReservationNotes("");

  }

  function cancelReservation(id: number) {

    setReservations((prev) =>

      prev.map((r) =>

        r.id === id

          ? {

              ...r,

              status: "Cancelled",

            }

          : r

      )

    );

  }

  function markReservationArrived(id: number) {

    setReservations((prev) =>

      prev.map((r) =>

        r.id === id

          ? {

              ...r,

              status: "Arrived",

            }

          : r

      )

    );

  }

  function reservationMatchesSearch(reservation: Reservation) {

    if (!reservationSearch.trim()) return true;

    const search = reservationSearch.toLowerCase();

    return (

      reservation.name.toLowerCase().includes(search) ||

      reservation.phone.toLowerCase().includes(search)

    );

  }

  function reservationsForDate(date: string) {

    return reservations

      .filter(

        (r) =>

          r.date === date &&

          reservationMatchesSearch(r)

      )

      .sort((a, b) => a.time.localeCompare(b.time));

  }

  function reservedTablesNow() {

    return reservations.filter((reservation) =>

      isReservationWithinHoldWindow(

        reservation,

        reservationSettings

      )

    );

  }

  useEffect(() => {

    try {

      const savedTables = localStorage.getItem(

        STORAGE_TABLES

      );

      const savedWaitlist = localStorage.getItem(

        STORAGE_WAITLIST

      );

      const savedAssignments = localStorage.getItem(

        STORAGE_ASSIGNMENTS

      );

      const savedInfo = localStorage.getItem(

        STORAGE_INFO

      );

      const savedRotationIndex = localStorage.getItem(

        STORAGE_ROTATION_INDEX

      );

      const savedReservations = localStorage.getItem(

        STORAGE_RESERVATIONS

      );

      const savedReservationSettings =

        localStorage.getItem(

          STORAGE_RESERVATION_SETTINGS

        );

      if (savedTables) {

        const parsed = JSON.parse(savedTables);

        if (

          Array.isArray(parsed) &&

          parsed.length === defaultTables.length

        ) {

          setTables(parsed);

        }

      }

      if (savedWaitlist) {

        const parsedWaitlist = JSON.parse(savedWaitlist);

        setWaitlist(

          parsedWaitlist.map((p: WaitParty) => ({

            ...p,

            status: p.status || "Waiting",

          }))

        );

      }

      if (savedAssignments) {

        setServerAssignments(savedAssignments);

      }

      if (savedRotationIndex) {

        setRotationIndex(

          Number(savedRotationIndex) || 0

        );

      }

      if (savedReservations) {

        setReservations(JSON.parse(savedReservations));

      }

      if (savedReservationSettings) {

        setReservationSettings(

          JSON.parse(savedReservationSettings)

        );

      }

      if (savedInfo) {

        const info = JSON.parse(savedInfo);

        if (info.hostInfo !== undefined) {

          setHostInfo(info.hostInfo);

        }

        if (info.takeoutInfo !== undefined) {

          setTakeoutInfo(info.takeoutInfo);

        }

        if (info.casaInfo !== undefined) {

          setCasaInfo(info.casaInfo);

        }

        if (info.sanMiguelInfo !== undefined) {

          setSanMiguelInfo(info.sanMiguelInfo);

        }

      }

    } catch {

      localStorage.removeItem(STORAGE_TABLES);

      localStorage.removeItem(STORAGE_WAITLIST);

      localStorage.removeItem(STORAGE_ASSIGNMENTS);

      localStorage.removeItem(STORAGE_INFO);

      localStorage.removeItem(

        STORAGE_ROTATION_INDEX

      );

      localStorage.removeItem(

        STORAGE_RESERVATIONS

      );

      localStorage.removeItem(

        STORAGE_RESERVATION_SETTINGS

      );

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(STORAGE_TABLES, JSON.stringify(tables));

  }, [tables]);

  useEffect(() => {

    localStorage.setItem(STORAGE_WAITLIST, JSON.stringify(waitlist));

  }, [waitlist]);

  useEffect(() => {

    localStorage.setItem(STORAGE_ASSIGNMENTS, serverAssignments);

  }, [serverAssignments]);

  useEffect(() => {

    localStorage.setItem(STORAGE_ROTATION_INDEX, String(rotationIndex));

  }, [rotationIndex]);

  useEffect(() => {

    localStorage.setItem(STORAGE_RESERVATIONS, JSON.stringify(reservations));

  }, [reservations]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_RESERVATION_SETTINGS,

      JSON.stringify(reservationSettings)

    );

  }, [reservationSettings]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_INFO,

      JSON.stringify({ hostInfo, takeoutInfo, casaInfo, sanMiguelInfo })

    );

  }, [hostInfo, takeoutInfo, casaInfo, sanMiguelInfo]);

  useEffect(() => {

    const timer = setInterval(() => setTick((n) => n + 1), 60000);

    return () => clearInterval(timer);

  }, []);

  function updateTable(index: number) {

    if (editMode) return;

    if (combineMode) {

      const id = tables[index].id;

      setSelectedCombineIds((prev) =>

        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]

      );

      return;

    }

    if (selectedParty && tables[index].status === "Open") {

      const assignedServer = assignedServerForTable(tables[index].id);

      const rotationServer = nextServerName();

      const server = assignedServer || rotationServer;

      const combinedId = tables[index].combinedId;

      setTables((prev) =>

        prev.map((table, i) => {

          const sameCombo = combinedId && table.combinedId === combinedId;

          if (i === index || sameCombo) {

            return {

              ...table,

              status: "Seated",

              guest: selectedParty.name,

              partySize: selectedParty.size,

              seatedAt: Date.now(),

              server,

              readyFlash: false,

            };

          }

          return table;

        })

      );

      rotateServer();

      setWaitlist((prev) => prev.filter((p) => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      return;

    }

    setTables((prev) =>

      prev.map((table, i) => {

        if (i !== index) return table;

        const nextStatus = cycle[(cycle.indexOf(table.status) + 1) % cycle.length];

        const assignedServer = assignedServerForTable(table.id);

        const rotationServer = nextServerName();

        const server = assignedServer || rotationServer;

        if (nextStatus === "Seated") rotateServer();

        return {

          ...table,

          status: nextStatus,

          seatedAt: nextStatus === "Seated" ? Date.now() : undefined,

          guest: nextStatus === "Open" ? undefined : table.guest,

          partySize: nextStatus === "Open" ? undefined : table.partySize,

          server: nextStatus === "Open" ? undefined : server || table.server,

          readyFlash: nextStatus === "Open",

        };

      })

    );

  }

  function addToWaitlist() {

    if (!guestName.trim() || !partySize.trim()) return;

    setWaitlist((prev) => [

      ...prev,

      {

        id: Date.now(),

        name: guestName.trim(),

        size: partySize.trim(),

        pager: pager.trim(),

        status: "Waiting",

        createdAt: Date.now(),

      },

    ]);

    setGuestName("");

    setPartySize("");

    setPager("");

  }

  function removeFromWaitlist(id: number) {

    setWaitlist((prev) => prev.filter((p) => p.id !== id));

    if (selectedPartyId === id) setSelectedPartyId(null);

  }

  function clearTable(index: number) {

    const combinedId = tables[index].combinedId;

    setTables((prev) =>

      prev.map((table, i) => {

        const sameCombo = combinedId && table.combinedId === combinedId;

        if (i === index || sameCombo) {

          return {

            ...table,

            status: "Open",

            guest: undefined,

            partySize: undefined,

            seatedAt: undefined,

            server: undefined,

            readyFlash: true,

          };

        }

        return table;

      })

    );

  }

  function combineSelectedTables() {

    if (selectedCombineIds.length < 2) return;

    const comboId = `combo-${Date.now()}`;

    const selectedTables = tables.filter((t) => selectedCombineIds.includes(t.id));

    const totalSeats = selectedTables.reduce((sum, t) => sum + seatNumber(t.seats), 0);

    const label = `${selectedCombineIds.join("+")} = ${totalSeats}`;

    setTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? { ...table, combinedId: comboId, combinedLabel: label }

          : table

      )

    );

    setSelectedCombineIds([]);

  }

  function uncombineSelectedTables() {

    setTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? { ...table, combinedId: undefined, combinedLabel: undefined }

          : table

      )

    );

    setSelectedCombineIds([]);

  }

  function startDrag(index: number) {

    if (!editMode) return;

    setDraggingIndex(index);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (!editMode || draggingIndex === null) return;

    const map = e.currentTarget.getBoundingClientRect();

    const scale = map.width / 1500;

    const x = snap((e.clientX - map.left) / scale - tables[draggingIndex].w / 2);

    const y = snap((e.clientY - map.top) / scale - tables[draggingIndex].h / 2);

    setTables((prev) =>

      prev.map((table, i) => (i === draggingIndex ? { ...table, x, y } : table))

    );

  }

  function stopDrag() {

    setDraggingIndex(null);

  }

  function resetAll() {

    localStorage.removeItem(STORAGE_TABLES);

    localStorage.removeItem(STORAGE_WAITLIST);

    localStorage.removeItem(STORAGE_ASSIGNMENTS);

    localStorage.removeItem(STORAGE_INFO);

    localStorage.removeItem(STORAGE_ROTATION_INDEX);

    localStorage.removeItem(STORAGE_RESERVATIONS);

    localStorage.removeItem(STORAGE_RESERVATION_SETTINGS);

    setTables(defaultTables);

    setWaitlist([]);

    setReservations([]);

    setReservationSettings(defaultReservationSettings);

    setSelectedPartyId(null);

    setSelectedCombineIds([]);

    setGuestName("");

    setPartySize("");

    setPager("");

    setServerAssignments("Maria: 1,2,3\nJose: 20,21,22");

    setRotationIndex(0);

    setHostInfo("PODIUM:\nSEATER 1:\nSEATER 2:\nSEATER 3:");

    setTakeoutInfo("Take-Out");

    setCasaInfo("GUEST NAME:\n\nARRIVAL TIME:\n\nGUEST COUNT:\n\nSERVER:");

    setSanMiguelInfo("GUEST NAME:\n\nARRIVAL TIME:\n\nGUESTS:\n\nSERVER:");

  }

  function seatSelectedPartyAtBestTable() {

    if (!selectedParty || !bestTable) return;

    const index = tables.findIndex((table) => table.id === bestTable.id);

    if (index >= 0) updateTable(index);

  }

  function seatReservation(reservation: Reservation) {

    const party = parseInt(reservation.size, 10) || 0;

    const best = tables

      .filter((t) => t.status === "Open" && availableSeats(t, tables) >= party)

      .sort(

        (a, b) =>

          availableSeats(a, tables) -

          party -

          (availableSeats(b, tables) - party)

      )[0];

    if (!best) return;

    const index = tables.findIndex((t) => t.id === best.id);

    const assignedServer = assignedServerForTable(best.id);

    const rotationServer = nextServerName();

    const server = assignedServer || rotationServer;

    setTables((prev) =>

      prev.map((table, i) =>

        i === index

          ? {

              ...table,

              status: "Seated",

              guest: reservation.name,

              partySize: reservation.size,

              seatedAt: Date.now(),

              server,

              readyFlash: false,

            }

          : table

      )

    );

    setReservations((prev) =>

      prev.map((r) =>

        r.id === reservation.id

          ? { ...r, status: "Seated", tableId: best.id }

          : r

      )

    );

    rotateServer();

  }

  function updateReservationStatus(id: number, status: ReservationStatus) {

    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  }

  function addReservationAsWaitlist(reservation: Reservation) {

    setWaitlist((prev) => [

      ...prev,

      {

        id: Date.now(),

        name: reservation.name,

        size: reservation.size,

        pager: "",

        status: "Waiting",

        createdAt: Date.now(),

      },

    ]);

  }

  function shiftSummary() {

    const seatedTables = tables.filter((table) => table.status === "Seated");

    const dirtyTables = tables.filter((table) => table.status === "Dirty");

    const boxedTables = tables.filter((table) => table.status === "Boxed");

    const openTables = tables.filter((table) => table.status === "Open");

    const currentCovers = seatedTables.reduce((sum, table) => {

      if (table.partySize) return sum + (parseInt(table.partySize, 10) || 0);

      return sum + seatNumber(table.seats);

    }, 0);

    return {

      seated: seatedTables.length,

      dirty: dirtyTables.length,

      boxed: boxedTables.length,

      open: openTables.length,

      covers: currentCovers,

      wait: waitlist.length,

      reservationsToday: reservationsForDate(reservationDate).length,

    };

  }

  const wall = (x: number, y: number, w: number, h: number) => (

    <div

      style={{

        position: "absolute",

        left: snap(x),

        top: snap(y),

        width: snap(w),

        height: snap(h),

        background: "#111827",

        zIndex: 2,

      }}

    />

  );

  const serverSectionHighlight = (server: string, assignedTables: TableItem[]) => {

    if (assignedTables.length === 0) return null;

    const padding = 20;

    const minX = Math.min(...assignedTables.map((t) => t.x)) - padding;

    const minY = Math.min(...assignedTables.map((t) => t.y)) - padding;

    const maxX = Math.max(...assignedTables.map((t) => t.x + t.w)) + padding;

    const maxY = Math.max(...assignedTables.map((t) => t.y + t.h)) + padding;

    const color = getServerColor(server);

    return (

      <div

        key={server}

        style={{

          position: "absolute",

          left: minX,

          top: minY,

          width: maxX - minX,

          height: maxY - minY,

          background: hexToRgba(color, 0.12),

          border: `3px solid ${hexToRgba(color, 0.45)}`,

          borderRadius: 16,

          zIndex: 0,

          pointerEvents: "none",

        }}

      >

        <div

          style={{

            position: "absolute",

            top: -24,

            left: 8,

            background: color,

            color: "white",

            padding: "3px 8px",

            borderRadius: 8,

            fontWeight: "bold",

            fontSize: 12,

          }}

        >

          {server}

        </div>

      </div>

    );

  };

  const rotationNames = serverNamesFromAssignments();

  const nextUp = nextServerName();

  const summary = shiftSummary();

  const slots = generateReservationSlots(reservationDate, reservationSettings);

  const activeReservationWarnings =

    reservationDate && reservationTime

      ? reservationWarnings(

          {

            date: reservationDate,

            time: reservationTime,

            size: reservationSize || "0",

          },

          reservations,

          reservationSettings

        )

      : [];

  const holdingReservations = reservedTablesNow();

  return (

    <main style={{ padding: 4, fontFamily: "Arial", background: "#f3f4f6" }}>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>

        <button

          onClick={() => setActiveTab("host")}

          style={{

            padding: "9px 14px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: activeTab === "host" ? "#bfdbfe" : "white",

            fontWeight: "bold",

          }}

        >

          Host Board

        </button>

        <button

          onClick={() => setActiveTab("reservations")}

          style={{

            padding: "9px 14px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: activeTab === "reservations" ? "#bfdbfe" : "white",

            fontWeight: "bold",

          }}

        >

          Reservations

        </button>

      </div>

      {activeTab === "reservations" && (

        <div>

          <h1 style={{ marginTop: 0 }}>Reservations</h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>

            <div style={{ background: "white", padding: 10, border: "2px solid #111827", borderRadius: 8 }}>

              <b>Reservation Settings</b>

              <br />

              Year{" "}

              <input

                type="number"

                value={reservationSettings.year}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, year: Number(e.target.value) || 2026 }))

                }

                style={{ width: 70 }}

              />

              <br />

              Tue-Thu{" "}

              <input

                value={reservationSettings.tueThuOpen}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, tueThuOpen: e.target.value }))

                }

                style={{ width: 60 }}

              />{" "}

              to{" "}

              <input

                value={reservationSettings.tueThuClose}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, tueThuClose: e.target.value }))

                }

                style={{ width: 60 }}

              />

              <br />

              Fri-Sat{" "}

              <input

                value={reservationSettings.friSatOpen}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, friSatOpen: e.target.value }))

                }

                style={{ width: 60 }}

              />{" "}

              to{" "}

              <input

                value={reservationSettings.friSatClose}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, friSatClose: e.target.value }))

                }

                style={{ width: 60 }}

              />

              <br />

              Slot min{" "}

              <input

                type="number"

                value={reservationSettings.slotMinutes}

                onChange={(e) =>

                  setReservationSettings((p) => ({ ...p, slotMinutes: Number(e.target.value) || 15 }))

                }

                style={{ width: 55 }}

              />{" "}

              Max res{" "}

              <input

                type="number"

                value={reservationSettings.maxReservationsPerSlot}

                onChange={(e) =>

                  setReservationSettings((p) => ({

                    ...p,

                    maxReservationsPerSlot: Number(e.target.value) || 5,

                  }))

                }

                style={{ width: 55 }}

              />{" "}

              Max covers{" "}

              <input

                type="number"

                value={reservationSettings.maxCoversPerSlot}

                onChange={(e) =>

                  setReservationSettings((p) => ({

                    ...p,

                    maxCoversPerSlot: Number(e.target.value) || 30,

                  }))

                }

                style={{ width: 55 }}

              />

            </div>

            <div style={{ background: "white", padding: 10, border: "2px solid #111827", borderRadius: 8 }}>

              <b>Add Reservation</b>

              <br />

              <input

                type="date"

                min={`${reservationSettings.year}-01-01`}

                max={`${reservationSettings.year}-12-31`}

                value={reservationDate}

                onChange={(e) => {

                  setReservationDate(e.target.value);

                  setReservationTime("");

                }}

                style={{ padding: 6 }}

              />

              <select

                value={reservationTime}

                onChange={(e) => setReservationTime(e.target.value)}

                style={{ padding: 6 }}

              >

                <option value="">Time</option>

                {slots.map((slot) => (

                  <option key={slot} value={slot}>

                    {displayTime(slot)}

                  </option>

                ))}

              </select>

              <input

                value={reservationName}

                onChange={(e) => setReservationName(e.target.value)}

                placeholder="Guest name"

                style={{ padding: 6 }}

              />

              <input

                value={reservationPhone}

                onChange={(e) => setReservationPhone(e.target.value)}

                placeholder="Phone"

                style={{ padding: 6 }}

              />

              <input

                value={reservationSize}

                onChange={(e) => setReservationSize(e.target.value)}

                placeholder="#"

                style={{ padding: 6, width: 50 }}

              />

              <input

                value={reservationNotes}

                onChange={(e) => setReservationNotes(e.target.value)}

                placeholder="Notes / table preference"

                style={{ padding: 6, width: 210 }}

              />

              <button onClick={addReservation} style={{ padding: "7px 10px", fontWeight: "bold" }}>

                Add

              </button>

            </div>

          </div>

          {isClosedDay(reservationDate) && (

            <div style={{ padding: 8, background: "#fecaca", border: "2px solid #991b1b", borderRadius: 8, marginBottom: 8, fontWeight: "bold" }}>

              Closed day warning: Sunday/Monday.

            </div>

          )}

          {isSameDayWarning(reservationDate, reservationTime) && (

            <div style={{ padding: 8, background: "#fde68a", border: "2px solid #92400e", borderRadius: 8, marginBottom: 8, fontWeight: "bold" }}>

              Same-day warning: reservation is within 1 hour. Confirm availability or treat as call-ahead.

            </div>

          )}

          {activeReservationWarnings.length > 0 && (

            <div style={{ padding: 8, background: "#fff7ed", border: "2px solid #f97316", borderRadius: 8, marginBottom: 8 }}>

              {activeReservationWarnings.map((w) => (

                <div key={w}>⚠️ {w}</div>

              ))}

            </div>

          )}

          <input

            value={reservationSearch}

            onChange={(e) => setReservationSearch(e.target.value)}

            placeholder="Search reservations by name or phone"

            style={{ padding: 8, width: 310, marginBottom: 8 }}

          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

            {reservationsForDate(reservationDate).map((r) => (

              <div

                key={r.id}

                style={{

                  background: reservationStatusColor(r.status),

                  border: "2px solid #111827",

                  borderRadius: 8,

                  padding: 8,

                  minWidth: 250,

                  fontWeight: "bold",

                }}

              >

                {displayTime(r.time)} — {r.name} ({r.size})

                <br />

                {r.phone && <>Phone: {r.phone}<br /></>}

                Status: {r.status}

                <br />

                {r.notes && <>Notes: {r.notes}<br /></>}

                {parseInt(r.size, 10) >= reservationSettings.largePartySize && (

                  <div>⚠️ 20% auto gratuity</div>

                )}

                <div>Hold: {reservationSettings.holdMinutes} min | Majority required</div>

                {isReservationWithinHoldWindow(r, reservationSettings) && (

                  <div style={{ color: "#dc2626" }}>🚨 Hold window active</div>

                )}

                <button onClick={() => updateReservationStatus(r.id, "Arrived")}>Arrived</button>{" "}

                <button onClick={() => seatReservation(r)}>Seat</button>{" "}

                <button onClick={() => addReservationAsWaitlist(r)}>Waitlist</button>{" "}

                <button onClick={() => updateReservationStatus(r.id, "NoShow")}>No-show</button>{" "}

                <button onClick={() => updateReservationStatus(r.id, "Cancelled")}>Cancel</button>

              </div>

            ))}

          </div>

        </div>

      )}

      {activeTab === "host" && (

        <>

          <div

            style={{

              display: "flex",

              alignItems: "center",

              gap: 8,

              marginBottom: 8,

              flexWrap: "wrap",

            }}

          >

            <h1 style={{ margin: 0, fontSize: 34 }}>Host Map</h1>

            <button onClick={() => setEditMode(!editMode)} style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #111827", background: editMode ? "#fde68a" : "white", fontWeight: "bold" }}>

              {editMode ? "Editing ON" : "Service Mode"}

            </button>

            <button onClick={() => setCombineMode(!combineMode)} style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #111827", background: combineMode ? "#c4b5fd" : "white", fontWeight: "bold" }}>

              {combineMode ? "Combining ON" : "Combine Tables"}

            </button>

            {combineMode && (

              <>

                <button onClick={combineSelectedTables} style={{ padding: "8px 12px" }}>

                  Combine Selected

                </button>

                <button onClick={uncombineSelectedTables} style={{ padding: "8px 12px" }}>

                  Uncombine Selected

                </button>

                <button onClick={() => setSelectedCombineIds([])} style={{ padding: "8px 12px" }}>

                  Clear Selection

                </button>

              </>

            )}

            <button onClick={resetAll} style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #111827", background: "#fee2e2", fontWeight: "bold" }}>

              Reset All

            </button>

            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" style={{ padding: 8 }} />

            <input value={partySize} onChange={(e) => setPartySize(e.target.value)} placeholder="#" style={{ padding: 8, width: 55 }} />

            <input value={pager} onChange={(e) => setPager(e.target.value)} placeholder="Pager" style={{ padding: 8, width: 75 }} />

            <button onClick={addToWaitlist} style={{ padding: "8px 12px" }}>Add Wait</button>

          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>

            <div style={{ border: "3px solid #111827", borderRadius: 10, background: "white", padding: 10, minWidth: 240, height: 95, fontSize: 13 }}>

              <div style={{ fontWeight: "bold", fontSize: 15 }}>Shift Dashboard</div>

              <div>Seated: {summary.seated} | Covers: {summary.covers} | Wait: {summary.wait}</div>

              <div>Open: {summary.open} | Boxed: {summary.boxed} | Dirty: {summary.dirty}</div>

              <div>Reservations today: {summary.reservationsToday}</div>

              <div>Active holds: {holdingReservations.length}</div>

            </div>

            <label style={{ fontSize: 12 }}>

              Server table assignments:

              <br />

              <textarea

                value={serverAssignments}

                onChange={(e) => setServerAssignments(e.target.value)}

                placeholder={`Maria: 1,2,3\nJose: 20,21,22\nAna: Casa 1,Casa 2`}

                style={{ width: 330, height: 85, padding: 8, border: "2px solid #111827", borderRadius: 8, fontFamily: "Arial" }}

              />

            </label>

            <div style={{ border: "2px solid #111827", borderRadius: 8, background: "white", padding: 10, minWidth: 180, height: 85, fontSize: 14 }}>

              <div style={{ fontWeight: "bold" }}>Smart Rotation</div>

              <div>Next Up: <b>{nextUp || "Add servers"}</b></div>

              <button onClick={rotateServer} disabled={rotationNames.length === 0} style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, border: "2px solid #111827", background: "#f8fafc", fontWeight: "bold" }}>

                Next →

              </button>

            </div>

            {serverWorkloads().map((workload) => (

              <div key={workload.server} style={{ border: `3px solid ${workload.color}`, borderRadius: 8, background: "white", padding: 10, minWidth: 145, height: 85, fontSize: 13 }}>

                <div style={{ fontWeight: "bold", color: workload.color }}>{workload.server}</div>

                <div>Assigned: {workload.assignedCount}</div>

                <div>Seated: {workload.seatedCount}</div>

                <div>Covers: {workload.covers}</div>

              </div>

            ))}

            <label style={{ fontSize: 12 }}>Host / Podium:<br /><textarea value={hostInfo} onChange={(e) => setHostInfo(e.target.value)} style={{ width: 210, height: 85, padding: 8 }} /></label>

            <label style={{ fontSize: 12 }}>Takeout:<br /><input value={takeoutInfo} onChange={(e) => setTakeoutInfo(e.target.value)} style={{ width: 160, padding: 8 }} /></label>

            <label style={{ fontSize: 12 }}>Casa Box:<br /><textarea value={casaInfo} onChange={(e) => setCasaInfo(e.target.value)} style={{ width: 210, height: 85, padding: 8 }} /></label>

            <label style={{ fontSize: 12 }}>San Miguel Box:<br /><textarea value={sanMiguelInfo} onChange={(e) => setSanMiguelInfo(e.target.value)} style={{ width: 210, height: 85, padding: 8 }} /></label>

          </div>

          {holdingReservations.length > 0 && (

            <div style={{ marginBottom: 8, padding: 8, background: "#fecaca", border: "2px solid #991b1b", borderRadius: 8, fontWeight: "bold" }}>

              Reservation hold active:{" "}

              {holdingReservations.map((r) => `${r.name} ${displayTime(r.time)} (${r.size})`).join(", ")}

            </div>

          )}

          {selectedParty && (

            <div style={{ marginBottom: 8, padding: 8, background: "#fde68a", border: "2px solid #111827", borderRadius: 8, fontWeight: "bold", display: "inline-flex", gap: 10, alignItems: "center" }}>

              <span>

                Selected: {selectedParty.name} - {selectedParty.size}

                {bestTable ? ` | Best table: ${bestTable.id}` : " | No open table fits"}

              </span>

              {bestTable && <button onClick={seatSelectedPartyAtBestTable}>Seat Best</button>}

            </div>

          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>

            {waitlist.map((party) => (

              <div key={party.id} style={{ display: "flex", gap: 4, alignItems: "center", padding: 6, borderRadius: 8, border: selectedPartyId === party.id ? "3px solid #f59e0b" : "2px solid #111827", background: waitlistColor(party.status), fontWeight: "bold" }}>

                <button onClick={() => setSelectedPartyId(party.id)} style={{ border: "none", background: "transparent", fontWeight: "bold" }}>

                  {party.name} - {party.size}{party.pager ? ` | Pager ${party.pager}` : ""} ({minutesSince(party.createdAt)}) | Wait {estimatedWait(party.size)}

                </button>

                <button onClick={() => cycleWaitStatus(party.id)}>{party.status || "Waiting"}</button>

                <button onClick={() => removeFromWaitlist(party.id)}>X</button>

              </div>

            ))}

          </div>

          {combineMode && (

            <div style={{ marginBottom: 8, fontWeight: "bold" }}>

              Selected to combine: {selectedCombineIds.length > 0 ? selectedCombineIds.join(", ") : "none"}

            </div>

          )}

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

                transform: "scale(0.74)",

                transformOrigin: "top left",

                marginBottom: -270,

                touchAction: editMode ? "none" : "auto",

              }}

            >

              {Object.entries(serverGroups()).map(([server, assignedTables]) =>

                serverSectionHighlight(server, assignedTables)

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

              <div style={{ position: "absolute", left: 1240, top: 0, width: 260, height: 650, borderLeft: "5px solid #111827", borderBottom: "5px solid #111827", background: "#fffdf7", zIndex: 3 }}>

                <div style={{ height: 110, padding: 14, fontWeight: "bold", fontSize: 18, whiteSpace: "pre-line" }}>{hostInfo}</div>

                <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 8, fontSize: 22, fontWeight: "bold", margin: "0 20px" }}>San Miguel</div>

                <div style={{ margin: "14px 22px", padding: 12, height: 165, border: "3px solid #111827", fontSize: 15, whiteSpace: "pre-line" }}>{sanMiguelInfo}</div>

              </div>

              <div style={{ position: "absolute", left: 1225, top: 735, width: 255, height: 290, border: "4px solid #111827", background: "#fffdf7", zIndex: 3 }}>

                <div style={{ background: "#111827", color: "white", textAlign: "center", padding: 8, fontSize: 20, fontWeight: "bold" }}>Casa 1884</div>

                <div style={{ padding: 16, fontSize: 16, whiteSpace: "pre-line" }}>{casaInfo}</div>

              </div>

              <div style={{ position: "absolute", left: 120, top: 405, fontSize: 25, fontStyle: "italic", fontWeight: "bold", zIndex: 3, whiteSpace: "pre-line" }}>{takeoutInfo}</div>

              <div style={{ position: "absolute", left: 310, top: 625, width: 335, height: 85, borderRadius: 20, border: "5px solid #64748b", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: "bold", zIndex: 3 }}>BAR</div>

              <div style={{ position: "absolute", left: 810, top: 600, width: 275, height: 48, background: "white", border: "3px solid #111827", textAlign: "center", paddingTop: 10, fontWeight: "bold", fontSize: 18, zIndex: 3 }}>Buffet</div>

              <div style={{ position: "absolute", left: 835, top: 675, width: 220, height: 45, background: "#dbeafe", border: "1px solid #64748b", textAlign: "center", paddingTop: 10, fontSize: 13, zIndex: 3 }}>Friday Lunch Buffet 11 - 2 pm</div>

              {tables.map((table, index) => {

                const fitsSelectedParty =

                  selectedParty &&

                  table.status === "Open" &&

                  availableSeats(table, tables) >= selectedSize;

                const isBestTable = bestTable?.id === table.id;

                const isSelectedForCombine = selectedCombineIds.includes(table.id);

                const assignedServer = assignedServerForTable(table.id) || table.server;

                const serverColor = getServerColor(assignedServer);

                const heldForReservation = holdingReservations.some(

                  (r) => parseInt(r.size, 10) <= availableSeats(table, tables) && table.status === "Open"

                );

                return (

                  <button

                    key={table.id}

                    onPointerDown={(e) => {

                      e.preventDefault();

                      startDrag(index);

                    }}

                    onDoubleClick={() => clearTable(index)}

                    onClick={() => updateTable(index)}

                    title={table.combinedLabel || ""}

                    style={{

                      position: "absolute",

                      left: table.x,

                      top: table.y,

                      width: table.w,

                      height: table.h,

                      background: heldForReservation

                        ? "#fef3c7"

                        : isSelectedForCombine

                        ? "#ddd6fe"

                        : fitsSelectedParty

                        ? isBestTable

                          ? "#86efac"

                          : "#dcfce7"

                        : turnBackground(table),

                      border: heldForReservation

                        ? "5px solid #dc2626"

                        : table.readyFlash

                        ? "5px solid #22c55e"

                        : isSelectedForCombine

                        ? "4px solid #7c3aed"

                        : table.combinedId

                        ? "4px solid #a855f7"

                        : assignedServer

                        ? `4px solid ${serverColor}`

                        : table.status === "Boxed"

                        ? "4px solid #f59e0b"

                        : isBestTable

                        ? "4px solid #16a34a"

                        : editMode

                        ? "3px dashed #111827"

                        : "2px solid #1e3a8a",

                      boxShadow: heldForReservation

                        ? "0 0 16px #dc2626"

                        : table.readyFlash

                        ? "0 0 14px #22c55e"

                        : "none",

                      borderRadius: 8,

                      color: "#006ee6",

                      fontWeight: "bold",

                      fontSize: 10,

                      lineHeight: 1.05,

                      overflow: "hidden",

                      zIndex: draggingIndex === index ? 20 : 5,

                      touchAction: "none",

                      cursor: editMode ? "grab" : "pointer",

                    }}

                  >

                    {table.id}

                    <br />

                    {table.guest

                      ? `${table.guest} ${table.partySize}`

                      : table.combinedId

                      ? `${availableSeats(table, tables)} seats`

                      : table.seats}

                    <br />

                    {heldForReservation

                      ? "RES HOLD"

                      : table.status === "Seated"

                      ? minutesSince(table.seatedAt)

                      : table.status}

                    {assignedServer && (

                      <>

                        <br />

                        {assignedServer}

                      </>

                    )}

                  </button>

                );

              })}

            </div>

          </div>

          <p style={{ marginTop: 8, fontSize: 14 }}>

            Reservations now connect to the host board. Tables that can fit active reservation holds highlight red/gold.

          </p>

        </>

      )}

    </main>

  );

}
