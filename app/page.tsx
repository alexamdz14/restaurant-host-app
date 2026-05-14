"use client";

import { useEffect, useState } from "react";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Section = "Main" | "Patio" | "Lounge" | "Casa" | "San Miguel";

type WaitStatus = "Waiting" | "Paged" | "Returned" | "NoShow";

type PartyType = "Walk-in" | "Call-ahead" | "Reservation overflow";

type ReservationStatus = "Booked" | "Arrived" | "Seated" | "NoShow" | "Cancelled";

type AppMode = "full" | "reservationsOnly";

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

};

type WaitParty = {

  id: number;

  name: string;

  size: string;

  pager?: string;

  status?: WaitStatus;

  quotedWait?: string;

  pagedAt?: number;

  priority?: boolean;

  notes?: string;

  partyType?: PartyType;

  textReadySent?: boolean;

  createdAt: number;

};

type Reservation = {

  id: number;

  date: string;

  time: string;

  name: string;

  phone: string;

  adults: string;

  kids: string;

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

  managerPin: string;

};

type ServerInfo = {

  name: string;

  startTime: string;

  cut: boolean;

};

type NightMapInfo = {

  date: string;

  manager: string;

  notes: string;

};

const GRID = 5;

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const waitTimeOptions = ["0-10", "10-15", "15-20", "20-30", "30-45", "45-60", "60+"];

const partyTypeOptions: PartyType[] = [

  "Walk-in",

  "Call-ahead",

  "Reservation overflow",

];

const STORAGE_TABLES = "hostTables_v14";

const STORAGE_WAITLIST = "hostWaitlist_v14";

const STORAGE_ASSIGNMENTS = "hostServerAssignments_v14";

const STORAGE_SERVER_INFO = "hostServerInfo_v14";

const STORAGE_INFO = "hostInfoBoxes_v14";

const STORAGE_ROTATION_INDEX = "hostServerRotationIndex_v14";

const STORAGE_RESERVATIONS = "hostReservations_v14";

const STORAGE_RESERVATION_SETTINGS = "hostReservationSettings_v14";

const STORAGE_TRAINING_MODE = "hostTrainingMode_v14";

const STORAGE_TRAINING_RESERVATIONS = "hostTrainingReservations_v14";

const STORAGE_TRAINING_WAITLIST = "hostTrainingWaitlist_v14";

const STORAGE_TRAINING_TABLES = "hostTrainingTables_v14";

const STORAGE_FLOOR_LOCKED = "hostFloorLocked_v14";

const STORAGE_APP_MODE = "hostAppMode_v14";

const STORAGE_NIGHT_MAP = "hostNightMap_v14";

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

  managerPin: "1884",

};

const defaultNightMap: NightMapInfo = {

  date: "",

  manager: "",

  notes: "",

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

function waitlistColor(party: WaitParty) {

  if (party.priority) return "#fef3c7";

  if (isOverQuotedWait(party)) return "#fecaca";

  if (party.status === "Paged") return "#fde68a";

  if (party.status === "Returned") return "#bbf7d0";

  if (party.status === "NoShow") return "#fecaca";

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

function quotedWaitMaxMinutes(quotedWait?: string) {

  if (!quotedWait) return 0;

  if (quotedWait === "60+") return 60;

  const parts = quotedWait.split("-");

  const max = parseInt(parts[1] || "0", 10);

  return Number.isNaN(max) ? 0 : max;

}

function isOverQuotedWait(party: WaitParty) {

  if (!party.quotedWait || party.status === "NoShow") return false;

  const maxMinutes = quotedWaitMaxMinutes(party.quotedWait);

  if (!maxMinutes) return false;

  const waitedMinutes = Math.floor((Date.now() - party.createdAt) / 60000);

  return waitedMinutes > maxMinutes;

}

function reservationTotalGuests(reservation: Pick<Reservation, "adults" | "kids">) {

  const adults = parseInt(reservation.adults || "0", 10) || 0;

  const kids = parseInt(reservation.kids || "0", 10) || 0;

  return adults + kids;

}

function reservationGuestLabel(reservation: Pick<Reservation, "adults" | "kids">) {

  const adults = parseInt(reservation.adults || "0", 10) || 0;

  const kids = parseInt(reservation.kids || "0", 10) || 0;

  if (adults > 0 && kids > 0) return `${adults}A + ${kids}K = ${adults + kids}`;

  if (adults > 0) return `${adults}A`;

  if (kids > 0) return `${kids}K`;

  return "0";

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

  if (!time) return "";

  const [h, m] = time.split(":").map(Number);

  const suffix = h >= 12 ? "PM" : "AM";

  const hour = h % 12 || 12;

  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;

}

function displayStandardTime(time: string) {

  if (!time) return "";

  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {

    return time;

  }

  if (!time.includes(":")) return time;

  return displayTime(time);

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

  if (!date || !time) return false;

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

function reservationWarnings(

  reservation: Pick<Reservation, "date" | "time" | "adults" | "kids">,

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

    (sum, r) => sum + reservationTotalGuests(r),

    0

  );

  const partySize = reservationTotalGuests(reservation);

  if (sameSlot.length >= settings.maxReservationsPerSlot) {

    warnings.push(

      `Slot full: ${settings.maxReservationsPerSlot} reservations already booked`

    );

  }

  if (slotCovers + partySize > settings.maxCoversPerSlot) {

    warnings.push(

      `Cover warning: this slot would exceed ${settings.maxCoversPerSlot} guests`

    );

  }

  if (partySize >= settings.largePartySize) {

    warnings.push("Large party: 20% auto gratuity applies");

  }

  warnings.push(`Hold policy: reservations held for ${settings.holdMinutes} minutes only`);

  warnings.push("Seating policy: majority of party must be present to be seated");

  return warnings;

}

function slotStats(

  date: string,

  time: string,

  reservations: Reservation[],

  settings: ReservationSettings

) {

  const slotReservations = reservations.filter(

    (r) => r.date === date && r.time === time && r.status !== "Cancelled"

  );

  const covers = slotReservations.reduce(

    (sum, r) => sum + reservationTotalGuests(r),

    0

  );

  const fullByReservations =

    slotReservations.length >= settings.maxReservationsPerSlot;

  const fullByCovers = covers >= settings.maxCoversPerSlot;

  return {

    reservations: slotReservations.length,

    covers,

    fullByReservations,

    fullByCovers,

    full: fullByReservations || fullByCovers,

  };

}

function findBestTablesForParty(partySize: number, tables: TableItem[]) {

  return tables

    .filter((table) => table.status === "Open" && seatNumber(table.seats) >= partySize)

    .sort((a, b) => seatNumber(a.seats) - seatNumber(b.seats));

}

function suggestCombinedTablesForParty(partySize: number, tables: TableItem[]) {

  const openTables = tables

    .filter((table) => table.status === "Open")

    .filter((table) => seatNumber(table.seats) > 0)

    .sort((a, b) => seatNumber(b.seats) - seatNumber(a.seats));

  const selected: TableItem[] = [];

  let total = 0;

  for (const table of openTables) {

    if (total >= partySize) break;

    selected.push(table);

    total += seatNumber(table.seats);

  }

  return {

    tables: selected,

    totalSeats: total,

    fits: total >= partySize,

  };

}

function reservationTableSuggestionText(reservation: Reservation, tables: TableItem[]) {

  const totalGuests = reservationTotalGuests(reservation);

  const directFits = findBestTablesForParty(totalGuests, tables);

  if (directFits.length > 0) {

    return `Best table: ${directFits[0].id}`;

  }

  const combo = suggestCombinedTablesForParty(totalGuests, tables);

  if (combo.fits) {

    return `Combine: ${combo.tables.map((table) => table.id).join(" + ")} = ${

      combo.totalSeats

    }`;

  }

  return "No table fit right now";

}

function serverIsCut(serverName: string, serverInfo: ServerInfo[]) {

  return serverInfo.some(

    (server) => server.name.toLowerCase() === serverName.toLowerCase() && server.cut

  );

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

  const [appMode, setAppMode] = useState<AppMode>("full");

  const [trainingMode, setTrainingMode] = useState(false);

  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const [managerPinInput, setManagerPinInput] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [floorLocked, setFloorLocked] = useState(true);

  const [combineMode, setCombineMode] = useState(false);

  const [selectedCombineIds, setSelectedCombineIds] = useState<string[]>([]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [tables, setTables] = useState<TableItem[]>(defaultTables);

  const [trainingTables, setTrainingTables] = useState<TableItem[]>(defaultTables);

  const [waitlist, setWaitlist] = useState<WaitParty[]>([]);

  const [trainingWaitlist, setTrainingWaitlist] = useState<WaitParty[]>([]);

  const [guestName, setGuestName] = useState("");

  const [partySize, setPartySize] = useState("");

  const [pager, setPager] = useState("");

  const [quotedWait, setQuotedWait] = useState("15-20");

  const [waitNotes, setWaitNotes] = useState("");

  const [waitPriority, setWaitPriority] = useState(false);

  const [partyType, setPartyType] = useState<PartyType>("Walk-in");

  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  const [serverAssignments, setServerAssignments] = useState(

    "Maria: 1,2,3\nJose: 20,21,22"

  );

  const [serverInfo, setServerInfo] = useState<ServerInfo[]>([

    { name: "Maria", startTime: "4:00 PM", cut: false },

    { name: "Jose", startTime: "4:00 PM", cut: false },

  ]);

  const [rotationIndex, setRotationIndex] = useState(0);

  const [hostInfo, setHostInfo] = useState(

    "PODIUM:\nSEATER 1:\nSEATER 2:\nSEATER 3:"

  );

  const [takeoutInfo, setTakeoutInfo] = useState("Take-Out");

  const [casaInfo, setCasaInfo] = useState(

    "GUEST NAME:\n\nARRIVAL TIME:\n\nGUEST COUNT:\n\nSERVER:"

  );

  const [sanMiguelInfo, setSanMiguelInfo] = useState(

    "GUEST NAME:\n\nARRIVAL TIME:\n\nGUESTS:\n\nSERVER:"

  );

  const [nightMap, setNightMap] = useState<NightMapInfo>(defaultNightMap);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [trainingReservations, setTrainingReservations] = useState<Reservation[]>([]);

  const [reservationSettings, setReservationSettings] =

    useState<ReservationSettings>(defaultReservationSettings);

  const [reservationDate, setReservationDate] = useState("2026-01-01");

  const [reservationTime, setReservationTime] = useState("");

  const [reservationName, setReservationName] = useState("");

  const [reservationPhone, setReservationPhone] = useState("");

  const [reservationAdults, setReservationAdults] = useState("");

  const [reservationKids, setReservationKids] = useState("");

  const [reservationNotes, setReservationNotes] = useState("");

  const [reservationSearch, setReservationSearch] = useState("");

  const [newTableId, setNewTableId] = useState("");

  const [newTableSeats, setNewTableSeats] = useState("");

  const [newTableSection, setNewTableSection] = useState<Section>("Main");

  const [, setTick] = useState(0);

  const activeReservations = trainingMode ? trainingReservations : reservations;

  const activeWaitlist = trainingMode ? trainingWaitlist : waitlist;

  const activeTables = trainingMode ? trainingTables : tables;

  function setActiveReservations(

    updater: Reservation[] | ((prev: Reservation[]) => Reservation[])

  ) {

    if (trainingMode) {

      setTrainingReservations(updater);

    } else {

      setReservations(updater);

    }

  }

  function setActiveWaitlist(

    updater: WaitParty[] | ((prev: WaitParty[]) => WaitParty[])

  ) {

    if (trainingMode) {

      setTrainingWaitlist(updater);

    } else {

      setWaitlist(updater);

    }

  }

  function setActiveTables(

    updater: TableItem[] | ((prev: TableItem[]) => TableItem[])

  ) {

    if (trainingMode) {

      setTrainingTables(updater);

    } else {

      setTables(updater);

    }

  }

  function unlockManager() {

    const enteredPin = managerPinInput.trim();

    const correctPin = reservationSettings.managerPin.trim();

    if (enteredPin === correctPin) {

      setManagerUnlocked(true);

      setManagerPinInput("");

    } else {

      alert("Incorrect manager PIN");

    }

  }

  function requireManager() {

    if (managerUnlocked) return true;

    alert("Manager must unlock this first.");

    return false;

  }

  function cycleWaitStatus(id: number) {

    setActiveWaitlist((prev) =>

      prev.map((p) => {

        if (p.id !== id) return p;

        const order: WaitStatus[] = ["Waiting", "Paged", "Returned", "NoShow"];

        const currentStatus = p.status || "Waiting";

        const next = order[(order.indexOf(currentStatus) + 1) % order.length];

        return {

          ...p,

          status: next,

          pagedAt: next === "Paged" ? Date.now() : p.pagedAt,

        };

      })

    );

  }

  function markTextReadySent(id: number) {

    setActiveWaitlist((prev) =>

      prev.map((p) =>

        p.id === id ? { ...p, textReadySent: true, status: "Paged", pagedAt: Date.now() } : p

      )

    );

  }

  function serverNamesFromAssignments() {

    return serverAssignments

      .split("\n")

      .map((line) => line.split(":")[0]?.trim())

      .filter((name): name is string => Boolean(name));

  }

  function syncServerInfoFromAssignments() {

    const names = serverNamesFromAssignments();

    setServerInfo((prev) =>

      names.map((name) => {

        const existing = prev.find(

          (server) => server.name.toLowerCase() === name.toLowerCase()

        );

        return existing || { name, startTime: "", cut: false };

      })

    );

  }

  function updateServerStartTime(serverName: string, startTime: string) {

    setServerInfo((prev) =>

      prev.map((server) =>

        server.name === serverName ? { ...server, startTime } : server

      )

    );

  }

  function toggleServerCut(serverName: string) {

    setServerInfo((prev) =>

      prev.map((server) =>

        server.name === serverName ? { ...server, cut: !server.cut } : server

      )

    );

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

    const serverTables = activeTables.filter((table) => {

      const assigned = assignedServerForTable(table.id) || table.server;

      return assigned === server;

    });

    const seatedTables = serverTables.filter((table) => table.status === "Seated");

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

    const names = serverNamesFromAssignments().filter(

      (name) => !serverIsCut(name, serverInfo)

    );

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

    const names = serverNamesFromAssignments().filter(

      (name) => !serverIsCut(name, serverInfo)

    );

    const smartNext = nextServerName();

    if (names.length === 0 || !smartNext) return;

    const currentIndex = names.indexOf(smartNext);

    setRotationIndex((currentIndex + 1) % names.length);

  }

  function serverGroups() {

    const groups: Record<string, TableItem[]> = {};

    for (const table of activeTables) {

      const server = assignedServerForTable(table.id);

      if (!server) continue;

      if (!groups[server]) groups[server] = [];

      groups[server].push(table);

    }

    return groups;

  }

  function serverWorkloads() {

    return serverNamesFromAssignments().map((server) => {

      const assignedTables = activeTables.filter(

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

      const info = serverInfo.find(

        (serverItem) => serverItem.name.toLowerCase() === server.toLowerCase()

      );

      return {

        server,

        color: getServerColor(server),

        assignedCount: assignedTables.length,

        seatedCount: seatedTables.length,

        covers,

        startTime: info?.startTime || "",

        cut: info?.cut || false,

      };

    });

  }

  const selectedParty = activeWaitlist.find((p) => p.id === selectedPartyId);

  const selectedSize = selectedParty ? parseInt(selectedParty.size, 10) : 0;

  function availableSeats(table: TableItem, allTables: TableItem[]) {

    if (!table.combinedId) return seatNumber(table.seats);

    return allTables

      .filter((t) => t.combinedId === table.combinedId)

      .reduce((sum, t) => sum + seatNumber(t.seats), 0);

  }

  const bestTable =

    selectedParty && !Number.isNaN(selectedSize)

      ? activeTables

          .filter(

            (t) =>

              t.status === "Open" &&

              availableSeats(t, activeTables) >= selectedSize

          )

          .sort(

            (a, b) =>

              availableSeats(a, activeTables) -

              selectedSize -

              (availableSeats(b, activeTables) - selectedSize)

          )[0]

      : undefined;

  function estimatedWait(size: string) {

    const party = parseInt(size, 10);

    if (Number.isNaN(party)) return "~?";

    const openFit = activeTables.some(

      (t) => t.status === "Open" && availableSeats(t, activeTables) >= party

    );

    if (openFit) return "now";

    const seatedFits = activeTables

      .filter(

        (t) => t.status === "Seated" && availableSeats(t, activeTables) >= party

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

    const dirtyFit = activeTables.some(

      (t) => t.status === "Dirty" && availableSeats(t, activeTables) >= party

    );

    if (dirtyFit) return "~10 min";

    const boxedFit = activeTables.some(

      (t) => t.status === "Boxed" && availableSeats(t, activeTables) >= party

    );

    if (boxedFit) return "~20 min";

    return "no fit";

  }

  function addReservation() {

    if (

      !reservationDate ||

      !reservationTime ||

      !reservationName.trim() ||

      (!reservationAdults.trim() && !reservationKids.trim())

    ) {

      return;

    }

    const warnings = reservationWarnings(

      {

        date: reservationDate,

        time: reservationTime,

        adults: reservationAdults || "0",

        kids: reservationKids || "0",

      },

      activeReservations,

      reservationSettings

    );

    const hasBlockingWarning = warnings.some(

      (warning) =>

        warning.startsWith("Closed day") ||

        warning.startsWith("Slot full") ||

        warning.startsWith("Cover warning")

    );

    if (hasBlockingWarning) {

      alert(warnings.join("\n"));

      return;

    }

    const newReservation: Reservation = {

      id: Date.now(),

      name: reservationName.trim(),

      phone: reservationPhone.trim(),

      adults: reservationAdults.trim() || "0",

      kids: reservationKids.trim() || "0",

      date: reservationDate,

      time: reservationTime,

      notes: reservationNotes.trim(),

      createdAt: Date.now(),

      status: "Booked",

    };

    setActiveReservations((prev) => [...prev, newReservation]);

    setReservationName("");

    setReservationPhone("");

    setReservationAdults("");

    setReservationKids("");

    setReservationNotes("");

  }

  function deleteReservation(id: number) {

    const okay = window.confirm("Delete this reservation completely?");

    if (!okay) return;

    setActiveReservations((prev) => prev.filter((r) => r.id !== id));

  }

  function updateReservationStatus(id: number, status: ReservationStatus) {

    setActiveReservations((prev) =>

      prev.map((r) => (r.id === id ? { ...r, status } : r))

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

    return activeReservations

      .filter((r) => r.date === date && reservationMatchesSearch(r))

      .sort((a, b) => a.time.localeCompare(b.time));

  }

  function reservationsForSlot(date: string, time: string) {

    return activeReservations

      .filter(

        (r) =>

          r.date === date &&

          r.time === time &&

          r.status !== "Cancelled" &&

          reservationMatchesSearch(r)

      )

      .sort((a, b) => a.name.localeCompare(b.name));

  }

  function todaysUpcomingReservations() {

    return reservationsForDate(reservationDate)

      .filter((r) => r.status !== "Cancelled")

      .sort((a, b) => a.time.localeCompare(b.time));

  }

  function reservedTablesNow() {

    return activeReservations.filter((reservation) =>

      isReservationWithinHoldWindow(reservation, reservationSettings)

    );

  }

  function addReservationAsWaitlist(reservation: Reservation) {

    setActiveWaitlist((prev) => [

      ...prev,

      {

        id: Date.now(),

        name: reservation.name,

        size: String(reservationTotalGuests(reservation)),

        pager: "",

        status: "Waiting",

        quotedWait: "15-20",

        pagedAt: undefined,

        priority: false,

        notes: reservation.notes || "Reservation overflow",

        partyType: "Reservation overflow",

        textReadySent: false,

        createdAt: Date.now(),

      },

    ]);

  }

  function seatReservation(reservation: Reservation) {

    const party = reservationTotalGuests(reservation);

    const best = activeTables

      .filter((t) => t.status === "Open" && availableSeats(t, activeTables) >= party)

      .sort(

        (a, b) =>

          availableSeats(a, activeTables) -

          party -

          (availableSeats(b, activeTables) - party)

      )[0];

    if (!best) {

      alert("No open table fits this reservation right now.");

      return;

    }

    const index = activeTables.findIndex((t) => t.id === best.id);

    const assignedServer = assignedServerForTable(best.id);

    const rotationServer = nextServerName();

    const server = assignedServer || rotationServer;

    setActiveTables((prev) =>

      prev.map((table, i) =>

        i === index

          ? {

              ...table,

              status: "Seated",

              guest: reservation.name,

              partySize: String(party),

              seatedAt: Date.now(),

              server,

              readyFlash: false,

            }

          : table

      )

    );

    setActiveReservations((prev) =>

      prev.map((r) =>

        r.id === reservation.id

          ? { ...r, status: "Seated", tableId: best.id }

          : r

      )

    );

    rotateServer();

  }

  function addNewTable() {

    if (!requireManager()) return;

    if (!newTableId.trim() || !newTableSeats.trim()) return;

    const alreadyExists = activeTables.some(

      (table) => table.id.toLowerCase() === newTableId.trim().toLowerCase()

    );

    if (alreadyExists) {

      alert("That table already exists.");

      return;

    }

    const newTable = makeTable(

      newTableId.trim(),

      newTableSeats.trim(),

      80,

      80,

      70,

      50,

      newTableSection

    );

    setActiveTables((prev) => [...prev, newTable]);

    setNewTableId("");

    setNewTableSeats("");

    setNewTableSection("Main");

  }

  function removeTable(tableId: string) {

    if (!requireManager()) return;

    const okay = window.confirm(`Remove table ${tableId}?`);

    if (!okay) return;

    setActiveTables((prev) => prev.filter((table) => table.id !== tableId));

  }

  function shiftSummary() {

    const seatedTables = activeTables.filter((table) => table.status === "Seated");

    const dirtyTables = activeTables.filter((table) => table.status === "Dirty");

    const boxedTables = activeTables.filter((table) => table.status === "Boxed");

    const openTables = activeTables.filter((table) => table.status === "Open");

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

      wait: activeWaitlist.length,

      reservationsToday: reservationsForDate(reservationDate).length,

      serversCut: serverInfo.filter((server) => server.cut).length,

      overWait: activeWaitlist.filter((party) => isOverQuotedWait(party)).length,

      priority: activeWaitlist.filter((party) => party.priority).length,

    };

  }

  function updateTable(index: number) {

    if (editMode) return;

    if (combineMode) {

      const id = activeTables[index].id;

      setSelectedCombineIds((prev) =>

        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]

      );

      return;

    }

    if (selectedParty && activeTables[index].status === "Open") {

      const assignedServer = assignedServerForTable(activeTables[index].id);

      const rotationServer = nextServerName();

      const server = assignedServer || rotationServer;

      const combinedId = activeTables[index].combinedId;

      setActiveTables((prev) =>

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

      setActiveWaitlist((prev) => prev.filter((p) => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      return;

    }

    setActiveTables((prev) =>

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

    setActiveWaitlist((prev) => [

      ...prev,

      {

        id: Date.now(),

        name: guestName.trim(),

        size: partySize.trim(),

        pager: pager.trim(),

        status: "Waiting",

        quotedWait,

        pagedAt: undefined,

        priority: waitPriority,

        notes: waitNotes.trim(),

        partyType,

        textReadySent: false,

        createdAt: Date.now(),

      },

    ]);

    setGuestName("");

    setPartySize("");

    setPager("");

    setQuotedWait("15-20");

    setWaitNotes("");

    setWaitPriority(false);

    setPartyType("Walk-in");

  }

  function removeFromWaitlist(id: number) {

    setActiveWaitlist((prev) => prev.filter((p) => p.id !== id));

    if (selectedPartyId === id) setSelectedPartyId(null);

  }

  function clearTable(index: number) {

    const combinedId = activeTables[index].combinedId;

    setActiveTables((prev) =>

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

    const selectedTables = activeTables.filter((t) => selectedCombineIds.includes(t.id));

    const totalSeats = selectedTables.reduce((sum, t) => sum + seatNumber(t.seats), 0);

    const label = `${selectedCombineIds.join("+")} = ${totalSeats}`;

    setActiveTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? { ...table, combinedId: comboId, combinedLabel: label }

          : table

      )

    );

    setSelectedCombineIds([]);

  }

  function uncombineSelectedTables() {

    setActiveTables((prev) =>

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

    if (floorLocked) {

      alert("Floor is locked. Manager must unlock the floor before moving tables.");

      return;

    }

    setDraggingIndex(index);

  }

  function dragTable(e: React.PointerEvent<HTMLDivElement>) {

    if (!editMode || floorLocked || draggingIndex === null) return;

    const map = e.currentTarget.getBoundingClientRect();

    const scale = map.width / 1500;

    const x = snap((e.clientX - map.left) / scale - activeTables[draggingIndex].w / 2);

    const y = snap((e.clientY - map.top) / scale - activeTables[draggingIndex].h / 2);

    setActiveTables((prev) =>

      prev.map((table, i) => (i === draggingIndex ? { ...table, x, y } : table))

    );

  }

  function stopDrag() {

    setDraggingIndex(null);

  }

  function seatSelectedPartyAtBestTable() {

    if (!selectedParty || !bestTable) return;

    const index = activeTables.findIndex((table) => table.id === bestTable.id);

    if (index >= 0) updateTable(index);

  }

  function resetAll() {

    if (!requireManager()) return;

    const okay = window.confirm(

      "Reset everything? This clears tables, waitlist, reservations, settings, and training data."

    );

    if (!okay) return;

    localStorage.removeItem(STORAGE_TABLES);

    localStorage.removeItem(STORAGE_WAITLIST);

    localStorage.removeItem(STORAGE_ASSIGNMENTS);

    localStorage.removeItem(STORAGE_SERVER_INFO);

    localStorage.removeItem(STORAGE_INFO);

    localStorage.removeItem(STORAGE_ROTATION_INDEX);

    localStorage.removeItem(STORAGE_RESERVATIONS);

    localStorage.removeItem(STORAGE_RESERVATION_SETTINGS);

    localStorage.removeItem(STORAGE_TRAINING_MODE);

    localStorage.removeItem(STORAGE_TRAINING_RESERVATIONS);

    localStorage.removeItem(STORAGE_TRAINING_WAITLIST);

    localStorage.removeItem(STORAGE_TRAINING_TABLES);

    localStorage.removeItem(STORAGE_FLOOR_LOCKED);

    localStorage.removeItem(STORAGE_APP_MODE);

    localStorage.removeItem(STORAGE_NIGHT_MAP);

    setTables(defaultTables);

    setTrainingTables(defaultTables);

    setWaitlist([]);

    setTrainingWaitlist([]);

    setReservations([]);

    setTrainingReservations([]);

    setReservationSettings(defaultReservationSettings);

    setTrainingMode(false);

    setAppMode("full");

    setFloorLocked(true);

    setManagerUnlocked(false);

    setSelectedPartyId(null);

    setSelectedCombineIds([]);

    setGuestName("");

    setPartySize("");

    setPager("");

    setQuotedWait("15-20");

    setWaitNotes("");

    setWaitPriority(false);

    setPartyType("Walk-in");

    setServerAssignments("Maria: 1,2,3\nJose: 20,21,22");

    setServerInfo([

      { name: "Maria", startTime: "4:00 PM", cut: false },

      { name: "Jose", startTime: "4:00 PM", cut: false },

    ]);

    setRotationIndex(0);

    setNightMap(defaultNightMap);

    setHostInfo("PODIUM:\nSEATER 1:\nSEATER 2:\nSEATER 3:");

    setTakeoutInfo("Take-Out");

    setCasaInfo("GUEST NAME:\n\nARRIVAL TIME:\n\nGUEST COUNT:\n\nSERVER:");

    setSanMiguelInfo("GUEST NAME:\n\nARRIVAL TIME:\n\nGUESTS:\n\nSERVER:");

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

    const isCut = serverIsCut(server, serverInfo);

    return (

      <div

        key={server}

        style={{

          position: "absolute",

          left: minX,

          top: minY,

          width: maxX - minX,

          height: maxY - minY,

          background: isCut ? "rgba(148,163,184,0.18)" : hexToRgba(color, 0.12),

          border: isCut

            ? "3px dashed rgba(71,85,105,0.75)"

            : `3px solid ${hexToRgba(color, 0.45)}`,

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

            background: isCut ? "#64748b" : color,

            color: "white",

            padding: "3px 8px",

            borderRadius: 8,

            fontWeight: "bold",

            fontSize: 12,

          }}

        >

          {server} {isCut ? "CUT" : ""}

        </div>

      </div>

    );

  };

  useEffect(() => {

    try {

      const savedTables = localStorage.getItem(STORAGE_TABLES);

      const savedTrainingTables = localStorage.getItem(STORAGE_TRAINING_TABLES);

      const savedWaitlist = localStorage.getItem(STORAGE_WAITLIST);

      const savedTrainingWaitlist = localStorage.getItem(STORAGE_TRAINING_WAITLIST);

      const savedAssignments = localStorage.getItem(STORAGE_ASSIGNMENTS);

      const savedServerInfo = localStorage.getItem(STORAGE_SERVER_INFO);

      const savedInfo = localStorage.getItem(STORAGE_INFO);

      const savedRotationIndex = localStorage.getItem(STORAGE_ROTATION_INDEX);

      const savedReservations = localStorage.getItem(STORAGE_RESERVATIONS);

      const savedReservationSettings = localStorage.getItem(STORAGE_RESERVATION_SETTINGS);

      const savedTrainingMode = localStorage.getItem(STORAGE_TRAINING_MODE);

      const savedTrainingReservations = localStorage.getItem(STORAGE_TRAINING_RESERVATIONS);

      const savedFloorLocked = localStorage.getItem(STORAGE_FLOOR_LOCKED);

      const savedAppMode = localStorage.getItem(STORAGE_APP_MODE);

      const savedNightMap = localStorage.getItem(STORAGE_NIGHT_MAP);

      if (savedTables) setTables(JSON.parse(savedTables));

      if (savedTrainingTables) setTrainingTables(JSON.parse(savedTrainingTables));

      if (savedWaitlist) {

        const parsedWaitlist = JSON.parse(savedWaitlist);

        setWaitlist(

          parsedWaitlist.map((p: WaitParty) => ({

            ...p,

            status: p.status || "Waiting",

            quotedWait: p.quotedWait || "15-20",

            priority: Boolean(p.priority),

            partyType: p.partyType || "Walk-in",

            textReadySent: Boolean(p.textReadySent),

          }))

        );

      }

      if (savedTrainingWaitlist) {

        const parsedTrainingWaitlist = JSON.parse(savedTrainingWaitlist);

        setTrainingWaitlist(

          parsedTrainingWaitlist.map((p: WaitParty) => ({

            ...p,

            status: p.status || "Waiting",

            quotedWait: p.quotedWait || "15-20",

            priority: Boolean(p.priority),

            partyType: p.partyType || "Walk-in",

            textReadySent: Boolean(p.textReadySent),

          }))

        );

      }

      if (savedAssignments) setServerAssignments(savedAssignments);

      if (savedServerInfo) setServerInfo(JSON.parse(savedServerInfo));

      if (savedRotationIndex) {

        setRotationIndex(Number(savedRotationIndex) || 0);

      }

      if (savedReservations) setReservations(JSON.parse(savedReservations));

      if (savedTrainingReservations) {

        setTrainingReservations(JSON.parse(savedTrainingReservations));

      }

      if (savedTrainingMode) {

        setTrainingMode(savedTrainingMode === "true");

      }

      if (savedFloorLocked) {

        setFloorLocked(savedFloorLocked === "true");

      }

      if (savedAppMode === "reservationsOnly" || savedAppMode === "full") {

        setAppMode(savedAppMode);

        if (savedAppMode === "reservationsOnly") setActiveTab("reservations");

      }

      if (savedNightMap) {

        setNightMap({ ...defaultNightMap, ...JSON.parse(savedNightMap) });

      }

      if (savedReservationSettings) {

        setReservationSettings({

          ...defaultReservationSettings,

          ...JSON.parse(savedReservationSettings),

        });

      }

      if (savedInfo) {

        const info = JSON.parse(savedInfo);

        if (info.hostInfo !== undefined) setHostInfo(info.hostInfo);

        if (info.takeoutInfo !== undefined) setTakeoutInfo(info.takeoutInfo);

        if (info.casaInfo !== undefined) setCasaInfo(info.casaInfo);

        if (info.sanMiguelInfo !== undefined) setSanMiguelInfo(info.sanMiguelInfo);

      }

    } catch {

      localStorage.removeItem(STORAGE_TABLES);

      localStorage.removeItem(STORAGE_WAITLIST);

      localStorage.removeItem(STORAGE_ASSIGNMENTS);

      localStorage.removeItem(STORAGE_SERVER_INFO);

      localStorage.removeItem(STORAGE_INFO);

      localStorage.removeItem(STORAGE_ROTATION_INDEX);

      localStorage.removeItem(STORAGE_RESERVATIONS);

      localStorage.removeItem(STORAGE_RESERVATION_SETTINGS);

      localStorage.removeItem(STORAGE_TRAINING_MODE);

      localStorage.removeItem(STORAGE_TRAINING_RESERVATIONS);

      localStorage.removeItem(STORAGE_TRAINING_WAITLIST);

      localStorage.removeItem(STORAGE_TRAINING_TABLES);

      localStorage.removeItem(STORAGE_FLOOR_LOCKED);

      localStorage.removeItem(STORAGE_APP_MODE);

      localStorage.removeItem(STORAGE_NIGHT_MAP);

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(STORAGE_TABLES, JSON.stringify(tables));

  }, [tables]);

  useEffect(() => {

    localStorage.setItem(STORAGE_TRAINING_TABLES, JSON.stringify(trainingTables));

  }, [trainingTables]);

  useEffect(() => {

    localStorage.setItem(STORAGE_WAITLIST, JSON.stringify(waitlist));

  }, [waitlist]);

  useEffect(() => {

    localStorage.setItem(STORAGE_TRAINING_WAITLIST, JSON.stringify(trainingWaitlist));

  }, [trainingWaitlist]);

  useEffect(() => {

    localStorage.setItem(STORAGE_ASSIGNMENTS, serverAssignments);

  }, [serverAssignments]);

  useEffect(() => {

    localStorage.setItem(STORAGE_SERVER_INFO, JSON.stringify(serverInfo));

  }, [serverInfo]);

  useEffect(() => {

    localStorage.setItem(STORAGE_ROTATION_INDEX, String(rotationIndex));

  }, [rotationIndex]);

  useEffect(() => {

    localStorage.setItem(STORAGE_RESERVATIONS, JSON.stringify(reservations));

  }, [reservations]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_TRAINING_RESERVATIONS,

      JSON.stringify(trainingReservations)

    );

  }, [trainingReservations]);

  useEffect(() => {

    localStorage.setItem(STORAGE_TRAINING_MODE, String(trainingMode));

  }, [trainingMode]);

  useEffect(() => {

    localStorage.setItem(STORAGE_FLOOR_LOCKED, String(floorLocked));

  }, [floorLocked]);

  useEffect(() => {

    localStorage.setItem(STORAGE_APP_MODE, appMode);

  }, [appMode]);

  useEffect(() => {

    localStorage.setItem(STORAGE_NIGHT_MAP, JSON.stringify(nightMap));

  }, [nightMap]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_RESERVATION_SETTINGS,

      JSON.stringify(reservationSettings)

    );

  }, [reservationSettings]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_INFO,

      JSON.stringify({

        hostInfo,

        takeoutInfo,

        casaInfo,

        sanMiguelInfo,

      })

    );

  }, [hostInfo, takeoutInfo, casaInfo, sanMiguelInfo]);

  useEffect(() => {

    const timer = setInterval(() => setTick((n) => n + 1), 60000);

    return () => clearInterval(timer);

  }, []);

  const rotationNames = serverNamesFromAssignments().filter(

    (name) => !serverIsCut(name, serverInfo)

  );

  const nextUp = nextServerName();

  const summary = shiftSummary();

  const slots = generateReservationSlots(

    reservationDate,

    reservationSettings

  );

  const holdingReservations = reservedTablesNow();

  const upcomingReservations = todaysUpcomingReservations();

  const activeReservationWarnings =

    reservationDate && reservationTime

      ? reservationWarnings(

          {

            date: reservationDate,

            time: reservationTime,

            adults: reservationAdults || "0",

            kids: reservationKids || "0",

          },

          activeReservations,

          reservationSettings

        )

      : [];

  return (

    <main

      style={{

        padding: 4,

        fontFamily: "Arial",

        background: "#f3f4f6",

      }}

    >

      {trainingMode && (

        <div

          style={{

            padding: 10,

            marginBottom: 8,

            background: "#fde68a",

            border: "3px solid #92400e",

            borderRadius: 8,

            fontWeight: "bold",

            textAlign: "center",

          }}

        >

          TRAINING MODE ON — host board and reservations are using practice data.

        </div>

      )}

      {appMode === "reservationsOnly" && (

        <div

          style={{

            padding: 10,

            marginBottom: 8,

            background: "#dbeafe",

            border: "3px solid #1d4ed8",

            borderRadius: 8,

            fontWeight: "bold",

            textAlign: "center",

          }}

        >

          RESERVATION IPAD MODE — Host Board is locked on this iPad.

        </div>

      )}

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          marginBottom: 8,

        }}

      >

        {appMode === "full" && (

          <button

            onClick={() => setActiveTab("host")}

            style={{

              padding: "9px 14px",

              borderRadius: 8,

              border: "2px solid #111827",

              background:

                activeTab === "host" ? "#bfdbfe" : "white",

              fontWeight: "bold",

            }}

          >

            Host Board

          </button>

        )}

        <button

          onClick={() => setActiveTab("reservations")}

          style={{

            padding: "9px 14px",

            borderRadius: 8,

            border: "2px solid #111827",

            background:

              activeTab === "reservations"

                ? "#bfdbfe"

                : "white",

            fontWeight: "bold",

          }}

        >

          Reservations

        </button>

        <button

          onClick={() => setTrainingMode((prev) => !prev)}

          style={{

            padding: "9px 14px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: trainingMode ? "#fde68a" : "white",

            fontWeight: "bold",

          }}

        >

          {trainingMode ? "Training ON" : "Training Mode"}

        </button>

        <button

          onClick={() => {

            if (!requireManager()) return;

            if (appMode === "full") {

              setAppMode("reservationsOnly");

              setActiveTab("reservations");

            } else {

              setAppMode("full");

            }

          }}

          style={{

            padding: "9px 14px",

            borderRadius: 8,

            border: "2px solid #111827",

            background:

              appMode === "reservationsOnly"

                ? "#dbeafe"

                : "white",

            fontWeight: "bold",

          }}

        >

          {appMode === "reservationsOnly"

            ? "Exit Reservation iPad Mode"

            : "Reservation iPad Mode"}

        </button>

        {!managerUnlocked ? (

          <>

            <input

              type="password"

              value={managerPinInput}

              onChange={(e) =>

                setManagerPinInput(e.target.value)

              }

              placeholder="Manager PIN"

              style={{

                padding: 8,

                width: 125,

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            />

            <button

              onClick={unlockManager}

              style={{

                padding: "9px 14px",

                borderRadius: 8,

                border: "2px solid #111827",

                background: "white",

                fontWeight: "bold",

              }}

            >

              Unlock

            </button>

          </>

        ) : (

          <button

            onClick={() => setManagerUnlocked(false)}

            style={{

              padding: "9px 14px",

              borderRadius: 8,

              border: "2px solid #111827",

              background: "#dcfce7",

              fontWeight: "bold",

            }}

          >

            Manager Unlocked

          </button>

        )}

      </div>

            {activeTab === "reservations" && (

        <div>

          <h1 style={{ marginTop: 0 }}>Reservations</h1>

          <div

            style={{

              display: "flex",

              gap: 8,

              flexWrap: "wrap",

              marginBottom: 10,

            }}

          >

            <div

              style={{

                background: "white",

                padding: 10,

                border: "2px solid #111827",

                borderRadius: 8,

                minWidth: 300,

              }}

            >

              <b>Reservation Settings</b>

              <div style={{ marginTop: 8 }}>

                Year{" "}

                <input

                  type="number"

                  value={reservationSettings.year}

                  disabled={!managerUnlocked}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      year: Number(e.target.value) || 2026,

                    }))

                  }

                  style={{ width: 80 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Min Reservations / Slot{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.maxReservationsPerSlot}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      maxReservationsPerSlot:

                        Number(e.target.value) || 5,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Max Covers / Slot{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.maxCoversPerSlot}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      maxCoversPerSlot:

                        Number(e.target.value) || 30,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Hold Minutes{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.holdMinutes}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      holdMinutes:

                        Number(e.target.value) || 15,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Large Party Size{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.largePartySize}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      largePartySize:

                        Number(e.target.value) || 10,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 10, fontSize: 12 }}>

                Sunday & Monday automatically blocked.

              </div>

            </div>

            <div

              style={{

                background: "white",

                padding: 10,

                border: "2px solid #111827",

                borderRadius: 8,

                minWidth: 560,

              }}

            >

              <b>Add Reservation</b>

              <div

                style={{

                  display: "flex",

                  gap: 6,

                  flexWrap: "wrap",

                  marginTop: 8,

                }}

              >

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

                <input

                  value={reservationName}

                  onChange={(e) =>

                    setReservationName(e.target.value)

                  }

                  placeholder="Guest name"

                  style={{ padding: 6 }}

                />

                <input

                  value={reservationPhone}

                  onChange={(e) =>

                    setReservationPhone(e.target.value)

                  }

                  placeholder="Phone"

                  style={{ padding: 6 }}

                />

                <input

                  value={reservationAdults}

                  onChange={(e) =>

                    setReservationAdults(e.target.value)

                  }

                  placeholder="Adults"

                  style={{ padding: 6, width: 70 }}

                />

                <input

                  value={reservationKids}

                  onChange={(e) =>

                    setReservationKids(e.target.value)

                  }

                  placeholder="Kids"

                  style={{ padding: 6, width: 60 }}

                />

                <input

                  value={reservationNotes}

                  onChange={(e) =>

                    setReservationNotes(e.target.value)

                  }

                  placeholder="Notes"

                  style={{ padding: 6, width: 180 }}

                />

                <button

                  onClick={addReservation}

                  style={{

                    padding: "7px 10px",

                    border: "2px solid #111827",

                    borderRadius: 6,

                    fontWeight: "bold",

                  }}

                >

                  Add

                </button>

              </div>

              <div style={{ marginTop: 10, fontWeight: "bold" }}>

                Selected Time:{" "}

                {reservationTime

                  ? displayStandardTime(reservationTime)

                  : "Tap slot"}

              </div>

              {activeReservationWarnings.length > 0 && (

                <div

                  style={{

                    marginTop: 8,

                    background: "#fff7ed",

                    border: "2px solid #f97316",

                    borderRadius: 8,

                    padding: 8,

                    fontSize: 13,

                  }}

                >

                  {activeReservationWarnings.map((warning) => (

                    <div key={warning}>⚠️ {warning}</div>

                  ))}

                </div>

              )}

            </div>

          </div>

          <div

            style={{

              display: "grid",

              gridTemplateColumns:

                "repeat(auto-fill, minmax(250px, 1fr))",

              gap: 8,

            }}

          >

            {slots.map((slot) => {

              const stats = slotStats(

                reservationDate,

                slot,

                activeReservations,

                reservationSettings

              );

              const slotReservations = reservationsForSlot(

                reservationDate,

                slot

              );

              const selected = reservationTime === slot;

              return (

                <div

                  key={slot}

                  onClick={() => setReservationTime(slot)}

                  style={{

                    border: selected

                      ? "4px solid #2563eb"

                      : "2px solid #111827",

                    borderRadius: 8,

                    background: stats.full

                      ? "#fecaca"

                      : "white",

                    padding: 8,

                    cursor: "pointer",

                  }}

                >

                  <div

                    style={{

                      fontWeight: "bold",

                      fontSize: 16,

                    }}

                  >

                    {displayStandardTime(slot)}

                  </div>

                  <div

                    style={{

                      fontSize: 13,

                      fontWeight: "bold",

                    }}

                  >

                    {stats.reservations}/

                    {reservationSettings.maxReservationsPerSlot}

                    {" reservations | "}

                    {stats.covers}/

                    {reservationSettings.maxCoversPerSlot}

                    {" covers"}

                  </div>

                  {stats.full && (

                    <div

                      style={{

                        color: "#991b1b",

                        fontWeight: "bold",

                      }}

                    >

                      FULL

                    </div>

                  )}

                  {slotReservations.map((r) => (

                    <div

                      key={r.id}

                      style={{

                        marginTop: 6,

                        padding: 6,

                        borderRadius: 6,

                        border: "1px solid #111827",

                        background:

                          reservationStatusColor(r.status),

                        fontSize: 12,

                      }}

                    >

                      <b>{r.name}</b>

                      <br />

                      {reservationGuestLabel(r)}

                      <br />

                      {r.phone}

                      <br />

                      {r.status}

                      <br />

                      {r.notes && (

                        <>

                          Notes: {r.notes}

                          <br />

                        </>

                      )}

                      {reservationTotalGuests(r) >=

                        reservationSettings.largePartySize && (

                        <div>

                          ⚠️ 20% auto gratuity

                        </div>

                      )}

                      <div

                        style={{

                          marginTop: 6,

                          display: "flex",

                          gap: 4,

                          flexWrap: "wrap",

                        }}

                      >

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            updateReservationStatus(

                              r.id,

                              "Arrived"

                            );

                          }}

                        >

                          Arrived

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            seatReservation(r);

                          }}

                        >

                          Seat

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            addReservationAsWaitlist(r);

                          }}

                        >

                          Waitlist

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            updateReservationStatus(

                              r.id,

                              "NoShow"

                            );

                          }}

                        >

                          No-show

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            updateReservationStatus(

                              r.id,

                              "Cancelled"

                            );

                          }}

                        >

                          Cancel

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            deleteReservation(r.id);

                          }}

                        >

                          Delete

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              );

            })}

          </div>

        </div>

      )}
