"use client";

import { useEffect, useState } from "react";

import { supabase } from "./supabaseClient";

type Status = "Open" | "Seated" | "Boxed" | "Dirty";

type Section =

  | "Main"

  | "Patio"

  | "Lounge"

  | "Casa"

  | "San Miguel";

type WaitStatus = "Waiting" | "Paged" | "Returned" | "NoShow";

type ReservationStatus =

  | "Booked"

  | "Confirmed"

  | "Arrived"

  | "Seated"

  | "NoShow"

  | "Cancelled";

type GuestTag =

  | "VIP"

  | "Birthday"

  | "Anniversary"

  | "Large Party"

  | "Patio"

  | "High Top"

  | "Booth"

  | "Frequent Guest";

type PartyType =

  | "Walk-in"

  | "Call-ahead"

  | "Reservation overflow";

type SyncStatus = "Online" | "Offline" | "Pending Sync";

type TableShape = "rectangle" | "round" | "booth";

type TableItem = {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  shape?: TableShape;

  status: Status;

  section: Section;

  guest?: string;

  partySize?: string;

  seatedAt?: number;

  server?: string;

  combinedId?: string;

  combinedLabel?: string;

  readyFlash?: boolean;

  estimatedSales?: number;

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

  tags?: GuestTag[];

  textConfirmed?: boolean;

  reminderSent?: boolean;

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

  kitchenPacingLimit: number;

  averageTurnMinutes: number;

  avgSpendPerGuest: number;

};

type ServerInfo = {

  name: string;

  startTime: string;

  cut: boolean;

  salesGoal: number;

};

type ShiftReport = {

  createdAt: number;

  covers: number;

  reservations: number;

  waitlist: number;

  noShows: number;

  cancelled: number;

  estimatedSales: number;

  busiestTime: string;

};

type SyncLog = {

  id: number;

  message: string;

  createdAt: number;

};

type TextMessage = {

  id: number;

  guestName: string;

  phone: string;

  message: string;

  type:

    | "Reservation Confirmation"

    | "Reminder"

    | "Table Ready"

    | "Custom";

  status: "Drafted" | "Ready To Send" | "Sent Placeholder";

  createdAt: number;

};

type GuestHistoryItem = {

  id: number;

  name: string;

  phone: string;

  visits: number;

  lastVisit: number;

  notes: string;

  tags: GuestTag[];

};

type OfflineQueueItem = {

  id: number;

  action: string;

  createdAt: number;

  resolved: boolean;

};

type ServerSectionBox = {

  id: number;

  server: string;

  x: number;

  y: number;

  w: number;

  h: number;

};

const GRID = 5;

const STORAGE_TABLES = "hostTables_v40";

const STORAGE_TRAINING_TABLES = "hostTrainingTables_v40";

const STORAGE_WAITLIST = "hostWaitlist_v40";

const STORAGE_TRAINING_WAITLIST = "hostTrainingWaitlist_v40";

const STORAGE_ASSIGNMENTS = "hostServerAssignments_v40";

const STORAGE_SERVER_INFO = "hostServerInfo_v40";

const STORAGE_INFO = "hostInfoBoxes_v40";

const STORAGE_ROTATION_INDEX = "hostServerRotationIndex_v40";

const STORAGE_RESERVATIONS = "hostReservations_v40";

const STORAGE_TRAINING_RESERVATIONS = "hostTrainingReservations_v40";

const STORAGE_RESERVATION_SETTINGS = "hostReservationSettings_v40";

const STORAGE_TRAINING_MODE = "hostTrainingMode_v40";

const STORAGE_FLOOR_LOCKED = "hostFloorLocked_v40";

const STORAGE_APP_MODE = "hostAppMode_v40";

const STORAGE_NIGHT_MAP = "hostNightMap_v40";

const STORAGE_SHIFT_REPORTS = "hostShiftReports_v40";

const STORAGE_SYNC_LOGS = "hostSyncLogs_v40";

const STORAGE_TEXT_MESSAGES = "hostTextMessages_v40";

const STORAGE_GUEST_HISTORY = "hostGuestHistory_v40";

const STORAGE_OFFLINE_QUEUE = "hostOfflineQueue_v40";

const STORAGE_SYNC_STATUS = "hostSyncStatus_v40";

const STORAGE_SERVER_SECTION_BOXES =

  "hostServerSectionBoxes_v40";

type AppMode = "full" | "reservationsOnly";

type NightMapInfo = {

  date: string;

  manager: string;

  notes: string;

};

const snap = (n: number) => Math.round(n / GRID) * GRID;

const cycle: Status[] = ["Seated", "Boxed", "Dirty", "Open"];

const waitTimeOptions = [

  "0-10",

  "10-15",

  "15-20",

  "20-30",

  "30-45",

  "45-60",

  "60+",

];

const partyTypeOptions: PartyType[] = [

  "Walk-in",

  "Call-ahead",

  "Reservation overflow",

];

const guestTagOptions: GuestTag[] = [

  "VIP",

  "Birthday",

  "Anniversary",

  "Large Party",

  "Patio",

  "High Top",

  "Booth",

  "Frequent Guest",

];

const tableShapeOptions: TableShape[] = [

  "rectangle",

  "round",

  "booth",

];

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

  kitchenPacingLimit: 40,

  averageTurnMinutes: 80,

  avgSpendPerGuest: 25,

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

  section: Section = "Main",

  shape: TableShape = "rectangle"

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

    shape,

  };

}

function normalizeGuestKey(name: string, phone: string) {

  return `${name.trim().toLowerCase()}-${phone.trim()}`;

}

function formatPrintDate(time: number) {

  return new Date(time).toLocaleString();

}

function statusColor(status: Status) {

  if (status === "Open") return "#d8f5df";

  if (status === "Seated") return "#bfdbfe";

  if (status === "Boxed") return "#fde68a";

  if (status === "Dirty") return "#f87171";

  return "#e5e7eb";

}

function reservationStatusColor(status: ReservationStatus) {

  if (status === "Booked") return "#ffffff";

  if (status === "Confirmed") return "#dbeafe";

  if (status === "Arrived") return "#fde68a";

  if (status === "Seated") return "#bbf7d0";

  if (status === "NoShow") return "#fecaca";

  if (status === "Cancelled") return "#e5e7eb";

  return "#ffffff";

}

function minutesSince(time?: number) {

  if (!time) return "";

  const mins = Math.floor((Date.now() - time) / 60000);

  return mins >= 60

    ? `${Math.floor(mins / 60)}h ${mins % 60}m`

    : `${mins}m`;

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

  const waitedMinutes = Math.floor(

    (Date.now() - party.createdAt) / 60000

  );

  return waitedMinutes > maxMinutes;

}

function waitlistColor(party: WaitParty) {

  if (party.priority) return "#fef3c7";

  if (isOverQuotedWait(party)) return "#fecaca";

  if (party.status === "Paged") return "#fde68a";

  if (party.status === "Returned") return "#bbf7d0";

  if (party.status === "NoShow") return "#fecaca";

  return "#ffffff";

}

function reservationTotalGuests(

  reservation: Pick<Reservation, "adults" | "kids">

) {

  const adults = parseInt(reservation.adults || "0", 10) || 0;

  const kids = parseInt(reservation.kids || "0", 10) || 0;

  return adults + kids;

}

function reservationGuestLabel(

  reservation: Pick<Reservation, "adults" | "kids">

) {

  const adults = parseInt(reservation.adults || "0", 10) || 0;

  const kids = parseInt(reservation.kids || "0", 10) || 0;

  if (adults > 0 && kids > 0) return `${adults}A + ${kids}K = ${adults + kids}`;

  if (adults > 0) return `${adults}A`;

  if (kids > 0) return `${kids}K`;

  return "0";

}

function turnBackground(table: TableItem) {

  if (table.status !== "Seated" || !table.seatedAt) {

    return statusColor(table.status);

  }

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

function generateReservationSlots(

  dateString: string,

  settings: ReservationSettings

) {

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

  const reservationMs = reservationDateTimeMs(

    reservation.date,

    reservation.time

  );

  const startHold = reservationMs - settings.holdMinutes * 60000;

  const endHold = reservationMs + settings.holdMinutes * 60000;

  return (

    now >= startHold &&

    now <= endHold &&

    reservation.status === "Booked"

  );

}

function reservationTagColor(tag: GuestTag) {

  if (tag === "VIP") return "#fef3c7";

  if (tag === "Birthday") return "#fce7f3";

  if (tag === "Anniversary") return "#ede9fe";

  if (tag === "Large Party") return "#ffedd5";

  if (tag === "Patio") return "#e0f2fe";

  if (tag === "High Top") return "#dcfce7";

  if (tag === "Booth") return "#dbeafe";

  if (tag === "Frequent Guest") return "#ccfbf1";

  return "#e5e7eb";

}

function estimatedSalesFromCovers(

  covers: number,

  settings: ReservationSettings

) {

  return covers * settings.avgSpendPerGuest;

}

function estimateTableAvailableMinutes(

  table: TableItem,

  settings: ReservationSettings

) {

  if (table.status === "Open") return 0;

  if (table.status === "Dirty") return 10;

  if (table.status === "Boxed") return 20;

  if (table.status === "Seated") {

    const minsSat = table.seatedAt

      ? Math.floor((Date.now() - table.seatedAt) / 60000)

      : 0;

    return Math.max(0, settings.averageTurnMinutes - minsSat);

  }

  return 30;

}

function tablePredictionLabel(

  table: TableItem,

  settings: ReservationSettings

) {

  const mins = estimateTableAvailableMinutes(table, settings);

  if (mins === 0) return "Open now";

  return `Est. open in ${mins} min`;

}

function turnPredictionDetail(

  table: TableItem,

  settings: ReservationSettings

) {

  if (table.status === "Open") return "Available now";

  if (table.status === "Dirty") return "Needs cleaning — approx. 10 min";

  if (table.status === "Boxed") return "Boxed — approx. 20 min";

  if (table.status === "Seated" && table.seatedAt) {

    const satMinutes = Math.floor((Date.now() - table.seatedAt) / 60000);

    const remaining = Math.max(0, settings.averageTurnMinutes - satMinutes);

    if (remaining === 0) return "Past expected turn time";

    return `Expected open in ${remaining} min`;

  }

  return "No prediction";

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

function reservationConflictWarnings(

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

  if (slotCovers + partySize > settings.kitchenPacingLimit) {

    warnings.push(

      `Kitchen pacing warning: ${slotCovers + partySize} guests around this time`

    );

  }

  if (partySize >= settings.largePartySize) {

    warnings.push("Large party: 20% auto gratuity applies");

  }

  warnings.push(`Hold policy: reservations held for ${settings.holdMinutes} minutes only`);

  warnings.push("Seating policy: majority of party must be present to be seated");

  return warnings;

}

function serverIsCut(serverName: string, serverInfo: ServerInfo[]) {

  return serverInfo.some(

    (server) =>

      server.name.toLowerCase() === serverName.toLowerCase() && server.cut

  );

}

function findBestTablesForParty(

  partySize: number,

  tables: TableItem[]

) {

  return tables

    .filter(

      (table) =>

        table.status === "Open" &&

        seatNumber(table.seats) >= partySize

    )

    .sort((a, b) => seatNumber(a.seats) - seatNumber(b.seats));

}

function suggestCombinedTablesForParty(

  partySize: number,

  tables: TableItem[]

) {

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

function reservationTableSuggestionText(

  reservation: Reservation,

  tables: TableItem[]

) {

  const totalGuests = reservationTotalGuests(reservation);

  const directFits = findBestTablesForParty(totalGuests, tables);

  if (directFits.length > 0) {

    return `Best table: ${directFits[0].id}`;

  }

  const combo = suggestCombinedTablesForParty(totalGuests, tables);

  if (combo.fits) {

    return `Combine: ${combo.tables

      .map((table) => table.id)

      .join(" + ")} = ${combo.totalSeats}`;

  }

  return "No table fit right now";

}

function isOverdueTurn(

  table: TableItem,

  settings: ReservationSettings

) {

  if (table.status !== "Seated" || !table.seatedAt) return false;

  const minsSat = Math.floor((Date.now() - table.seatedAt) / 60000);

  return minsSat > settings.averageTurnMinutes;

}

function estimatedTurnReadyTime(

  seatedAt: number,

  averageTurnMinutes: number

) {

  const readyTime = new Date(seatedAt + averageTurnMinutes * 60000);

  return readyTime.toLocaleTimeString([], {

    hour: "numeric",

    minute: "2-digit",

  });

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

  const [activeTab, setActiveTab] = useState<

    "host" | "reservations" | "timeline" | "reports"

  >("host");

  const [appMode, setAppMode] = useState<AppMode>("full");

  const [trainingMode, setTrainingMode] = useState(false);

  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const [managerPinInput, setManagerPinInput] = useState("");

  const [floorCheckMode, setFloorCheckMode] = useState(false);

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

    { name: "Maria", startTime: "4:00 PM", cut: false, salesGoal: 500 },

    { name: "Jose", startTime: "4:00 PM", cut: false, salesGoal: 500 },

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

  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);

  const [guestHistory, setGuestHistory] = useState<GuestHistoryItem[]>([]);

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("Online");

  const [serverSectionBoxes, setServerSectionBoxes] = useState<ServerSectionBox[]>([]);

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

  const [reservationTags, setReservationTags] = useState<GuestTag[]>([]);

  const [newTableId, setNewTableId] = useState("");

  const [newTableSeats, setNewTableSeats] = useState("");

  const [newTableSection, setNewTableSection] = useState<Section>("Main");

  const [newTableShape, setNewTableShape] = useState<TableShape>("rectangle");

  const [, setTick] = useState(0);

  const [cloudLoaded, setCloudLoaded] = useState(false);

  const activeReservations = trainingMode ? trainingReservations : reservations;

  const activeWaitlist = trainingMode ? trainingWaitlist : waitlist;

  const activeTables = trainingMode ? trainingTables : tables;

  function setActiveReservations(

    updater: Reservation[] | ((prev: Reservation[]) => Reservation[])

  ) {

    if (trainingMode) setTrainingReservations(updater);

    else setReservations(updater);

  }

  function setActiveWaitlist(

    updater: WaitParty[] | ((prev: WaitParty[]) => WaitParty[])

  ) {

    if (trainingMode) setTrainingWaitlist(updater);

    else setWaitlist(updater);

  }

  function setActiveTables(

    updater: TableItem[] | ((prev: TableItem[]) => TableItem[])

  ) {

    if (trainingMode) setTrainingTables(updater);

    else setTables(updater);

  }

  function addSyncLog(message: string) {

    setSyncLogs((prev) => [

      { id: Date.now(), message, createdAt: Date.now() },

      ...prev.slice(0, 19),

    ]);

    if (syncStatus !== "Online") {

      setOfflineQueue((prev) => [

        {

          id: Date.now(),

          action: message,

          createdAt: Date.now(),

          resolved: false,

        },

        ...prev,

      ]);

    }

  }

  function markOfflineQueueResolved(id: number) {

    setOfflineQueue((prev) =>

      prev.map((item) =>

        item.id === id ? { ...item, resolved: true } : item

      )

    );

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

  function updateGuestHistory(

    name: string,

    phone: string,

    notes: string,

    tags: GuestTag[]

  ) {

    if (!name.trim()) return;

    const key = normalizeGuestKey(name, phone);

    setGuestHistory((prev) => {

      const existing = prev.find(

        (guest) => normalizeGuestKey(guest.name, guest.phone) === key

      );

      if (existing) {

        return prev.map((guest) =>

          guest.id === existing.id

            ? {

                ...guest,

                visits: guest.visits + 1,

                lastVisit: Date.now(),

                notes: notes || guest.notes,

                tags: Array.from(new Set([...(guest.tags || []), ...tags])),

              }

            : guest

        );

      }

      return [

        {

          id: Date.now(),

          name,

          phone,

          visits: 1,

          lastVisit: Date.now(),

          notes,

          tags,

        },

        ...prev,

      ];

    });

  }

  function createTextMessage(

    guestName: string,

    phone: string,

    type: TextMessage["type"],

    message: string

  ) {

    const newMessage: TextMessage = {

      id: Date.now(),

      guestName,

      phone,

      type,

      message,

      status: "Drafted",

      createdAt: Date.now(),

    };

    setTextMessages((prev) => [newMessage, ...prev]);

    addSyncLog(`${type} text drafted`);

  }

  function markTextMessageReady(id: number) {

    setTextMessages((prev) =>

      prev.map((message) =>

        message.id === id ? { ...message, status: "Ready To Send" } : message

      )

    );

  }

  function markTextMessageSentPlaceholder(id: number) {

    setTextMessages((prev) =>

      prev.map((message) =>

        message.id === id

          ? { ...message, status: "Sent Placeholder" }

          : message

      )

    );

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

    addSyncLog("Waitlist status updated");

  }

  function markTextReadySent(id: number) {

    const party = activeWaitlist.find((p) => p.id === id);

    if (party?.pager) {

      createTextMessage(

        party.name,

        party.pager,

        "Table Ready",

        `Hi ${party.name}, your table at Enrique's is ready. Please check in with the host stand.`

      );

    }

    setActiveWaitlist((prev) =>

      prev.map((p) =>

        p.id === id

          ? {

              ...p,

              textReadySent: true,

              status: "Paged",

              pagedAt: Date.now(),

            }

          : p

      )

    );

    addSyncLog("Text-ready placeholder marked");

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

        return existing || { name, startTime: "", cut: false, salesGoal: 500 };

      })

    );

    addSyncLog("Server assignments synced locally");

  }

  function updateServerStartTime(serverName: string, startTime: string) {

    setServerInfo((prev) =>

      prev.map((server) =>

        server.name === serverName ? { ...server, startTime } : server

      )

    );

  }

  function updateServerSalesGoal(serverName: string, salesGoal: string) {

    setServerInfo((prev) =>

      prev.map((server) =>

        server.name === serverName

          ? { ...server, salesGoal: Number(salesGoal) || 0 }

          : server

      )

    );

  }

  function toggleServerCut(serverName: string) {

    setServerInfo((prev) =>

      prev.map((server) =>

        server.name === serverName ? { ...server, cut: !server.cut } : server

      )

    );

    addSyncLog(`${serverName} cut status changed`);

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

    const seatedTables = serverTables.filter(

      (table) => table.status === "Seated"

    );

    const covers = seatedTables.reduce((sum, table) => {

      if (table.partySize) return sum + (parseInt(table.partySize, 10) || 0);

      return sum + seatNumber(table.seats);

    }, 0);

    return {

      seatedTables: seatedTables.length,

      covers,

      estimatedSales: estimatedSalesFromCovers(covers, reservationSettings),

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

        if (table.partySize) return sum + (parseInt(table.partySize, 10) || 0);

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

        estimatedSales: estimatedSalesFromCovers(covers, reservationSettings),

        startTime: info?.startTime || "",

        cut: info?.cut || false,

        salesGoal: info?.salesGoal || 0,

      };

    });

  }

  function sectionBalanceSuggestion() {

    const activeServers = serverWorkloads().filter((server) => !server.cut);

    if (activeServers.length === 0) {

      return "Add active servers to use section balancing.";

    }

    const sorted = [...activeServers].sort((a, b) => {

      if (a.seatedCount !== b.seatedCount) return a.seatedCount - b.seatedCount;

      return a.covers - b.covers;

    });

    const best = sorted[0];

    const busiest = sorted[sorted.length - 1];

    if (!best || !busiest) return "No balancing suggestion yet.";

    if (busiest.seatedCount - best.seatedCount >= 2) {

      return `Balance suggestion: seat ${best.server} next. ${busiest.server} is heavier.`;

    }

    return `Balanced: ${best.server} is still the best next option.`;

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

  function dynamicWaitQuote(size: string) {

    const party = parseInt(size, 10);

    if (Number.isNaN(party)) return "~?";

    const fittingTables = activeTables

      .filter((table) => availableSeats(table, activeTables) >= party)

      .map((table) =>

        estimateTableAvailableMinutes(table, reservationSettings)

      );

    if (fittingTables.length === 0) return "no fit";

    const bestMinutes = Math.min(...fittingTables);

    if (bestMinutes <= 0) return "now";

    if (bestMinutes <= 10) return "0-10";

    if (bestMinutes <= 15) return "10-15";

    if (bestMinutes <= 20) return "15-20";

    if (bestMinutes <= 30) return "20-30";

    if (bestMinutes <= 45) return "30-45";

    if (bestMinutes <= 60) return "45-60";

    return "60+";

  }

  function estimatedWait(size: string) {

    return dynamicWaitQuote(size);

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

    const warnings = reservationConflictWarnings(

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

    const totalGuests =

      (parseInt(reservationAdults || "0", 10) || 0) +

      (parseInt(reservationKids || "0", 10) || 0);

    const finalTags = [...reservationTags];

    if (

      totalGuests >= reservationSettings.largePartySize &&

      !finalTags.includes("Large Party")

    ) {

      finalTags.push("Large Party");

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

      tags: finalTags,

      textConfirmed: false,

      reminderSent: false,

    };

    setActiveReservations((prev) => [...prev, newReservation]);

    updateGuestHistory(

      newReservation.name,

      newReservation.phone,

      newReservation.notes,

      finalTags

    );

    createTextMessage(

      newReservation.name,

      newReservation.phone,

      "Reservation Confirmation",

      `Hi ${newReservation.name}, your reservation at Enrique's is booked for ${displayStandardTime(

        newReservation.time

      )}. Reservations are held for ${reservationSettings.holdMinutes} minutes and majority of the party must be present to be seated.`

    );

    addSyncLog("Reservation added locally");

    setReservationName("");

    setReservationPhone("");

    setReservationAdults("");

    setReservationKids("");

    setReservationNotes("");

    setReservationTags([]);

  }

  function deleteReservation(id: number) {

    const okay = window.confirm("Delete this reservation completely?");

    if (!okay) return;

    setActiveReservations((prev) => prev.filter((r) => r.id !== id));

    addSyncLog("Reservation deleted locally");

  }

  function updateReservationStatus(id: number, status: ReservationStatus) {

    setActiveReservations((prev) =>

      prev.map((r) => (r.id === id ? { ...r, status } : r))

    );

    addSyncLog(`Reservation marked ${status}`);

  }

  function toggleReservationTag(tag: GuestTag) {

    setReservationTags((prev) =>

      prev.includes(tag)

        ? prev.filter((item) => item !== tag)

        : [...prev, tag]

    );

  }

  function toggleSavedReservationTag(id: number, tag: GuestTag) {

    setActiveReservations((prev) =>

      prev.map((reservation) => {

        if (reservation.id !== id) return reservation;

        const currentTags = reservation.tags || [];

        const nextTags = currentTags.includes(tag)

          ? currentTags.filter((item) => item !== tag)

          : [...currentTags, tag];

        return { ...reservation, tags: nextTags };

      })

    );

    addSyncLog("Reservation tag updated");

  }

  function markReservationTextConfirmed(id: number) {

    const reservation = activeReservations.find((r) => r.id === id);

    if (reservation) {

      createTextMessage(

        reservation.name,

        reservation.phone,

        "Reservation Confirmation",

        `Hi ${reservation.name}, confirming your reservation at Enrique's for ${displayStandardTime(

          reservation.time

        )}.`

      );

    }

    setActiveReservations((prev) =>

      prev.map((reservation) =>

        reservation.id === id

          ? { ...reservation, textConfirmed: true, status: "Confirmed" }

          : reservation

      )

    );

    addSyncLog("Text confirmation placeholder marked");

  }

  function markReservationReminderSent(id: number) {

    const reservation = activeReservations.find((r) => r.id === id);

    if (reservation) {

      createTextMessage(

        reservation.name,

        reservation.phone,

        "Reminder",

        `Hi ${reservation.name}, this is a reminder for your reservation at Enrique's at ${displayStandardTime(

          reservation.time

        )}.`

      );

    }

    setActiveReservations((prev) =>

      prev.map((reservation) =>

        reservation.id === id

          ? { ...reservation, reminderSent: true }

          : reservation

      )

    );

    addSyncLog("Reminder placeholder marked");

  }

  function reservationMatchesSearch(reservation: Reservation) {

    if (!reservationSearch.trim()) return true;

    const search = reservationSearch.toLowerCase();

    return (

      reservation.name.toLowerCase().includes(search) ||

      reservation.phone.toLowerCase().includes(search) ||

      (reservation.notes || "").toLowerCase().includes(search) ||

      (reservation.tags || []).some((tag) =>

        tag.toLowerCase().includes(search)

      )

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

        pager: reservation.phone || "",

        status: "Waiting",

        quotedWait: dynamicWaitQuote(String(reservationTotalGuests(reservation))),

        pagedAt: undefined,

        priority: reservation.tags?.includes("VIP") || false,

        notes: reservation.notes || "Reservation overflow",

        partyType: "Reservation overflow",

        textReadySent: false,

        createdAt: Date.now(),

      },

    ]);

    addSyncLog("Reservation moved to waitlist locally");

  }

  function chooseBestTableForParty(party: number) {

    const openTables = activeTables

      .filter((table) => table.status === "Open")

      .filter((table) => availableSeats(table, activeTables) >= party)

      .sort((a, b) => {

        const serverA = assignedServerForTable(a.id);

        const serverB = assignedServerForTable(b.id);

        const workloadA = serverA

          ? getServerWorkload(serverA)

          : { seatedTables: 0, covers: 0 };

        const workloadB = serverB

          ? getServerWorkload(serverB)

          : { seatedTables: 0, covers: 0 };

        if (workloadA.seatedTables !== workloadB.seatedTables) {

          return workloadA.seatedTables - workloadB.seatedTables;

        }

        if (workloadA.covers !== workloadB.covers) {

          return workloadA.covers - workloadB.covers;

        }

        return availableSeats(a, activeTables) - availableSeats(b, activeTables);

      });

    return openTables[0];

  }

  function seatReservation(reservation: Reservation) {

    const party = reservationTotalGuests(reservation);

    const best = chooseBestTableForParty(party);

    if (!best) {

      alert("No open table fits this reservation right now.");

      return;

    }

    const assignedServer = assignedServerForTable(best.id);

    const rotationServer = nextServerName();

    const server = assignedServer || rotationServer;

    setActiveTables((prev) =>

      prev.map((table) =>

        table.id === best.id

          ? {

              ...table,

              status: "Seated",

              guest: reservation.name,

              partySize: String(party),

              seatedAt: Date.now(),

              server,

              readyFlash: false,

              estimatedSales: estimatedSalesFromCovers(

                party,

                reservationSettings

              ),

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

    updateGuestHistory(

      reservation.name,

      reservation.phone,

      reservation.notes,

      reservation.tags || []

    );

    rotateServer();

    addSyncLog("Reservation seated locally");

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

      newTableShape === "round" ? 58 : 70,

      newTableShape === "round" ? 58 : 50,

      newTableSection,

      newTableShape

    );

    setActiveTables((prev) => [...prev, newTable]);

    setNewTableId("");

    setNewTableSeats("");

    setNewTableSection("Main");

    setNewTableShape("rectangle");

    addSyncLog("Table added locally");

  }

  function removeTable(tableId: string) {

    if (!requireManager()) return;

    const okay = window.confirm(`Remove table ${tableId}?`);

    if (!okay) return;

    setActiveTables((prev) => prev.filter((table) => table.id !== tableId));

    addSyncLog("Table removed locally");

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

    const noShows = activeReservations.filter((r) => r.status === "NoShow").length;

    const cancelled = activeReservations.filter((r) => r.status === "Cancelled").length;

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

      noShows,

      cancelled,

      estimatedSales: estimatedSalesFromCovers(currentCovers, reservationSettings),

    };

  }

  function generateShiftReport() {

    const summary = shiftSummary();

    const countsByTime: Record<string, number> = {};

    for (const reservation of activeReservations) {

      if (reservation.status === "Cancelled") continue;

      countsByTime[reservation.time] =

        (countsByTime[reservation.time] || 0) +

        reservationTotalGuests(reservation);

    }

    const busiestTime =

      Object.entries(countsByTime).sort((a, b) => b[1] - a[1])[0]?.[0] ||

      "N/A";

    const report: ShiftReport = {

      createdAt: Date.now(),

      covers: summary.covers,

      reservations: summary.reservationsToday,

      waitlist: summary.wait,

      noShows: summary.noShows,

      cancelled: summary.cancelled,

      estimatedSales: summary.estimatedSales,

      busiestTime,

    };

    setShiftReports((prev) => [report, ...prev]);

    addSyncLog("Shift report generated");

  }

  function printShiftReport() {

    window.print();

  }

  function updateTable(index: number) {

    if (editMode && !floorCheckMode) return;

    if (combineMode && !floorCheckMode) {

      const id = activeTables[index].id;

      setSelectedCombineIds((prev) =>

        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]

      );

      return;

    }

    if (selectedParty && activeTables[index].status === "Open" && !floorCheckMode) {

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

              estimatedSales: estimatedSalesFromCovers(

                parseInt(selectedParty.size, 10) || 0,

                reservationSettings

              ),

            };

          }

          return table;

        })

      );

      rotateServer();

      setActiveWaitlist((prev) => prev.filter((p) => p.id !== selectedPartyId));

      setSelectedPartyId(null);

      addSyncLog("Waitlist party seated locally");

      return;

    }

    setActiveTables((prev) =>

      prev.map((table, i) => {

        if (i !== index) return table;

        const nextStatus = cycle[(cycle.indexOf(table.status) + 1) % cycle.length];

        const assignedServer = assignedServerForTable(table.id);

        const rotationServer = nextServerName();

        const server = assignedServer || rotationServer;

        if (nextStatus === "Seated" && !floorCheckMode) rotateServer();

        return {

          ...table,

          status: nextStatus,

          seatedAt: nextStatus === "Seated" ? Date.now() : undefined,

          guest: nextStatus === "Open" ? undefined : table.guest,

          partySize: nextStatus === "Open" ? undefined : table.partySize,

          server: nextStatus === "Open" ? undefined : server || table.server,

          readyFlash: nextStatus === "Open",

          estimatedSales: nextStatus === "Open" ? undefined : table.estimatedSales,

        };

      })

    );

    addSyncLog(

      floorCheckMode ? "Floor check table status updated" : "Table status updated"

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

        quotedWait: quotedWait || dynamicWaitQuote(partySize),

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

    addSyncLog("Waitlist party added locally");

  }

  function removeFromWaitlist(id: number) {

    setActiveWaitlist((prev) => prev.filter((p) => p.id !== id));

    if (selectedPartyId === id) setSelectedPartyId(null);

    addSyncLog("Waitlist party removed locally");

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

            estimatedSales: undefined,

          };

        }

        return table;

      })

    );

    addSyncLog("Table cleared locally");

  }

  function combineSelectedTables() {

    if (selectedCombineIds.length < 2) return;

    const comboId = `combo-${Date.now()}`;

    const selectedTables = activeTables.filter((t) =>

      selectedCombineIds.includes(t.id)

    );

    const totalSeats = selectedTables.reduce(

      (sum, t) => sum + seatNumber(t.seats),

      0

    );

    const label = `${selectedCombineIds.join("+")} = ${totalSeats}`;

    setActiveTables((prev) =>

      prev.map((table) =>

        selectedCombineIds.includes(table.id)

          ? { ...table, combinedId: comboId, combinedLabel: label }

          : table

      )

    );

    setSelectedCombineIds([]);

    addSyncLog("Tables combined locally");

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

    addSyncLog("Tables uncombined locally");

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

    const x = snap(

      (e.clientX - map.left) / scale - activeTables[draggingIndex].w / 2

    );

    const y = snap(

      (e.clientY - map.top) / scale - activeTables[draggingIndex].h / 2

    );

    setActiveTables((prev) =>

      prev.map((table, i) =>

        i === draggingIndex ? { ...table, x, y } : table

      )

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

      "Reset everything? This clears tables, waitlist, reservations, settings, reports, texts, guest history, sync logs, and training data."

    );

    if (!okay) return;

    localStorage.removeItem(STORAGE_TABLES);

    localStorage.removeItem(STORAGE_TRAINING_TABLES);

    localStorage.removeItem(STORAGE_WAITLIST);

    localStorage.removeItem(STORAGE_TRAINING_WAITLIST);

    localStorage.removeItem(STORAGE_ASSIGNMENTS);

    localStorage.removeItem(STORAGE_SERVER_INFO);

    localStorage.removeItem(STORAGE_INFO);

    localStorage.removeItem(STORAGE_ROTATION_INDEX);

    localStorage.removeItem(STORAGE_RESERVATIONS);

    localStorage.removeItem(STORAGE_TRAINING_RESERVATIONS);

    localStorage.removeItem(STORAGE_RESERVATION_SETTINGS);

    localStorage.removeItem(STORAGE_TRAINING_MODE);

    localStorage.removeItem(STORAGE_FLOOR_LOCKED);

    localStorage.removeItem(STORAGE_APP_MODE);

    localStorage.removeItem(STORAGE_NIGHT_MAP);

    localStorage.removeItem(STORAGE_SHIFT_REPORTS);

    localStorage.removeItem(STORAGE_SYNC_LOGS);

    localStorage.removeItem(STORAGE_TEXT_MESSAGES);

    localStorage.removeItem(STORAGE_GUEST_HISTORY);

    localStorage.removeItem(STORAGE_OFFLINE_QUEUE);

    localStorage.removeItem(STORAGE_SYNC_STATUS);

    localStorage.removeItem(STORAGE_SERVER_SECTION_BOXES);

    setTables(defaultTables);

    setTrainingTables(defaultTables);

    setWaitlist([]);

    setTrainingWaitlist([]);

    setReservations([]);

    setTrainingReservations([]);

    setShiftReports([]);

    setSyncLogs([]);

    setTextMessages([]);

    setGuestHistory([]);

    setOfflineQueue([]);

    setSyncStatus("Online");

    setServerSectionBoxes([]);

    setReservationSettings(defaultReservationSettings);

    setTrainingMode(false);

    setAppMode("full");

    setFloorCheckMode(false);

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

      { name: "Maria", startTime: "4:00 PM", cut: false, salesGoal: 500 },

      { name: "Jose", startTime: "4:00 PM", cut: false, salesGoal: 500 },

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

    const loadCloudState = async () => {

    const { data } = await supabase

    .from("host_app_state")

    .select("*")

    .eq("id", "main")

    .single();

  if (!data?.data) {

    setCloudLoaded(true);

    return;

  }

  const cloud = data.data;

  if (cloud.tables) setTables(cloud.tables);

  if (cloud.waitlist) setWaitlist(cloud.waitlist);

  if (cloud.reservations) setReservations(cloud.reservations);

  if (cloud.serverAssignments)

    setServerAssignments(cloud.serverAssignments);

  if (cloud.serverInfo) setServerInfo(cloud.serverInfo);

  setCloudLoaded(true);

};

loadCloudState();

      const savedTables = localStorage.getItem(STORAGE_TABLES);

      const savedTrainingTables = localStorage.getItem(STORAGE_TRAINING_TABLES);

      const savedWaitlist = localStorage.getItem(STORAGE_WAITLIST);

      const savedTrainingWaitlist = localStorage.getItem(STORAGE_TRAINING_WAITLIST);

      const savedAssignments = localStorage.getItem(STORAGE_ASSIGNMENTS);

      const savedServerInfo = localStorage.getItem(STORAGE_SERVER_INFO);

      const savedInfo = localStorage.getItem(STORAGE_INFO);

      const savedRotationIndex = localStorage.getItem(STORAGE_ROTATION_INDEX);

      const savedReservations = localStorage.getItem(STORAGE_RESERVATIONS);

      const savedTrainingReservations = localStorage.getItem(STORAGE_TRAINING_RESERVATIONS);

      const savedReservationSettings = localStorage.getItem(STORAGE_RESERVATION_SETTINGS);

      const savedTrainingMode = localStorage.getItem(STORAGE_TRAINING_MODE);

      const savedFloorLocked = localStorage.getItem(STORAGE_FLOOR_LOCKED);

      const savedAppMode = localStorage.getItem(STORAGE_APP_MODE);

      const savedNightMap = localStorage.getItem(STORAGE_NIGHT_MAP);

      const savedShiftReports = localStorage.getItem(STORAGE_SHIFT_REPORTS);

      const savedSyncLogs = localStorage.getItem(STORAGE_SYNC_LOGS);

      const savedTextMessages = localStorage.getItem(STORAGE_TEXT_MESSAGES);

      const savedGuestHistory = localStorage.getItem(STORAGE_GUEST_HISTORY);

      const savedOfflineQueue = localStorage.getItem(STORAGE_OFFLINE_QUEUE);

      const savedSyncStatus = localStorage.getItem(STORAGE_SYNC_STATUS);

      const savedServerSectionBoxes = localStorage.getItem(STORAGE_SERVER_SECTION_BOXES);

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

      if (savedRotationIndex) setRotationIndex(Number(savedRotationIndex) || 0);

      if (savedReservations) setReservations(JSON.parse(savedReservations));

      if (savedTrainingReservations) setTrainingReservations(JSON.parse(savedTrainingReservations));

      if (savedReservationSettings) {

        setReservationSettings({

          ...defaultReservationSettings,

          ...JSON.parse(savedReservationSettings),

        });

      }

      if (savedTrainingMode) setTrainingMode(savedTrainingMode === "true");

      if (savedFloorLocked) setFloorLocked(savedFloorLocked === "true");

      if (savedAppMode === "reservationsOnly" || savedAppMode === "full") {

        setAppMode(savedAppMode);

        if (savedAppMode === "reservationsOnly") setActiveTab("reservations");

      }

      if (savedNightMap) setNightMap({ ...defaultNightMap, ...JSON.parse(savedNightMap) });

      if (savedShiftReports) setShiftReports(JSON.parse(savedShiftReports));

      if (savedSyncLogs) setSyncLogs(JSON.parse(savedSyncLogs));

      if (savedTextMessages) setTextMessages(JSON.parse(savedTextMessages));

      if (savedGuestHistory) setGuestHistory(JSON.parse(savedGuestHistory));

      if (savedOfflineQueue) setOfflineQueue(JSON.parse(savedOfflineQueue));

      if (

        savedSyncStatus === "Online" ||

        savedSyncStatus === "Offline" ||

        savedSyncStatus === "Pending Sync"

      ) {

        setSyncStatus(savedSyncStatus);

      }

      if (savedServerSectionBoxes) {

        setServerSectionBoxes(JSON.parse(savedServerSectionBoxes));

      }

      if (savedInfo) {

        const info = JSON.parse(savedInfo);

        if (info.hostInfo !== undefined) setHostInfo(info.hostInfo);

        if (info.takeoutInfo !== undefined) setTakeoutInfo(info.takeoutInfo);

        if (info.casaInfo !== undefined) setCasaInfo(info.casaInfo);

        if (info.sanMiguelInfo !== undefined) setSanMiguelInfo(info.sanMiguelInfo);

      }

    } catch {

      localStorage.clear();

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(STORAGE_TABLES, JSON.stringify(tables));

  }, [tables]);

  useEffect(() => {

  if (!cloudLoaded) return;

  async function syncCloud() {

    await supabase.from("host_app_state").upsert({

      id: "main",

      data: {

        tables,

        waitlist,

        reservations,

        serverAssignments,

        serverInfo,

      },

    });

  }

  syncCloud();

}, [

  tables,

  waitlist,

  reservations,

  serverAssignments,

  serverInfo,

  cloudLoaded,

]);
  
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

    localStorage.setItem(

      STORAGE_RESERVATION_SETTINGS,

      JSON.stringify(reservationSettings)

    );

  }, [reservationSettings]);

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

    localStorage.setItem(STORAGE_SHIFT_REPORTS, JSON.stringify(shiftReports));

  }, [shiftReports]);

  useEffect(() => {

    localStorage.setItem(STORAGE_SYNC_LOGS, JSON.stringify(syncLogs));

  }, [syncLogs]);

  useEffect(() => {

    localStorage.setItem(STORAGE_TEXT_MESSAGES, JSON.stringify(textMessages));

  }, [textMessages]);

  useEffect(() => {

    localStorage.setItem(STORAGE_GUEST_HISTORY, JSON.stringify(guestHistory));

  }, [guestHistory]);

  useEffect(() => {

    localStorage.setItem(STORAGE_OFFLINE_QUEUE, JSON.stringify(offlineQueue));

  }, [offlineQueue]);

  useEffect(() => {

    localStorage.setItem(STORAGE_SYNC_STATUS, syncStatus);

  }, [syncStatus]);

  useEffect(() => {

    localStorage.setItem(

      STORAGE_SERVER_SECTION_BOXES,

      JSON.stringify(serverSectionBoxes)

    );

  }, [serverSectionBoxes]);

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

  useEffect(() => {

  const channel = supabase

    .channel("host-live-sync")

    .on(

      "postgres_changes",

      {

        event: "*",

        schema: "public",

        table: "host_app_state",

      },

      async () => {

        const { data } = await supabase

          .from("host_app_state")

          .select("*")

          .eq("id", "main")

          .single();

        if (!data?.data) return;

        const cloud = data.data;

        if (cloud.tables) setTables(cloud.tables);

        if (cloud.waitlist) setWaitlist(cloud.waitlist);

        if (cloud.reservations)

          setReservations(cloud.reservations);

        if (cloud.serverAssignments)

          setServerAssignments(cloud.serverAssignments);

        if (cloud.serverInfo)

          setServerInfo(cloud.serverInfo);

      }

    )

    .subscribe();

  return () => {

    supabase.removeChannel(channel);

  };

}, []);

  const slots = generateReservationSlots(

    reservationDate,

    reservationSettings

  );

  const upcomingReservations = todaysUpcomingReservations();

  const holdingReservations = reservedTablesNow();

  const nextUp = nextServerName();

  const summary = shiftSummary();

  const activeReservationWarnings = reservationConflictWarnings(

    {

      date: reservationDate,

      time: reservationTime,

      adults: reservationAdults || "0",

      kids: reservationKids || "0",

    },

    activeReservations,

    reservationSettings

  );

  return (

    <main

      style={{

        padding: 16,

        fontFamily: "Arial",

        background: "#f4f1e8",

        minHeight: "100vh",

      }}

    >

      <div

        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          marginBottom: 10,

          alignItems: "center",

        }}

      >

        <button

          onClick={() => setActiveTab("host")}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: activeTab === "host" ? "#dbeafe" : "white",

            fontWeight: "bold",

          }}

        >

          Host Board

        </button>

        <button

          onClick={() => setActiveTab("reservations")}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background:

              activeTab === "reservations" ? "#dbeafe" : "white",

            fontWeight: "bold",

          }}

        >

          Reservations

        </button>

        <button

          onClick={() => setActiveTab("timeline")}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: activeTab === "timeline" ? "#dbeafe" : "white",

            fontWeight: "bold",

          }}

        >

          Timeline

        </button>

        <button

          onClick={() => setActiveTab("reports")}

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: activeTab === "reports" ? "#dbeafe" : "white",

            fontWeight: "bold",

          }}

        >

          Reports

        </button>

        <button

          onClick={() =>

            setTrainingMode((prev) => !prev)

          }

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: trainingMode ? "#fde68a" : "white",

            fontWeight: "bold",

          }}

        >

          {trainingMode ? "Training ON" : "Training OFF"}

        </button>

        <button

          onClick={() =>

            setFloorCheckMode((prev) => !prev)

          }

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background: floorCheckMode ? "#bbf7d0" : "white",

            fontWeight: "bold",

          }}

        >

          {floorCheckMode ? "Floor Check ON" : "Floor Check OFF"}

        </button>

        <button

          onClick={() =>

            setAppMode((prev) =>

              prev === "full"

                ? "reservationsOnly"

                : "full"

            )

          }

          style={{

            padding: "8px 12px",

            borderRadius: 8,

            border: "2px solid #111827",

            background:

              appMode === "reservationsOnly"

                ? "#e9d5ff"

                : "white",

            fontWeight: "bold",

          }}

        >

          {appMode === "reservationsOnly"

            ? "Reservations iPad"

            : "Full App"}

        </button>

                {!managerUnlocked ? (

          <>

            <input

              type="password"

              value={managerPinInput}

              onChange={(e) => setManagerPinInput(e.target.value)}

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

                padding: "8px 12px",

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

              padding: "8px 12px",

              borderRadius: 8,

              border: "2px solid #111827",

              background: "#dcfce7",

              fontWeight: "bold",

            }}

          >

            Manager Unlocked

          </button>

        )}

        <select

          value={syncStatus}

          onChange={(e) => setSyncStatus(e.target.value as SyncStatus)}

          style={{

            padding: 8,

            borderRadius: 8,

            border: "2px solid #111827",

            fontWeight: "bold",

          }}

        >

          <option>Online</option>

          <option>Offline</option>

          <option>Pending Sync</option>

        </select>

      </div>

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

          TRAINING MODE ON — practice data is separate from live data.

        </div>

      )}

      {floorCheckMode && (

        <div

          style={{

            padding: 10,

            marginBottom: 8,

            background: "#dcfce7",

            border: "3px solid #166534",

            borderRadius: 8,

            fontWeight: "bold",

            textAlign: "center",

            fontSize: 18,

          }}

        >

          FLOOR CHECK MODE — tap tables to update status only.

        </div>

      )}

      {syncStatus !== "Online" && (

        <div

          style={{

            padding: 10,

            marginBottom: 8,

            background: "#fee2e2",

            border: "3px solid #991b1b",

            borderRadius: 8,

            fontWeight: "bold",

            textAlign: "center",

          }}

        >

          {syncStatus} — changes are saved locally and added to offline recovery.

        </div>

      )}

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

                minWidth: 310,

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

                Max Reservations / Slot{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.maxReservationsPerSlot}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      maxReservationsPerSlot: Number(e.target.value) || 5,

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

                      maxCoversPerSlot: Number(e.target.value) || 30,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Kitchen Pacing Limit{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.kitchenPacingLimit}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      kitchenPacingLimit: Number(e.target.value) || 40,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Average Turn Minutes{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.averageTurnMinutes}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      averageTurnMinutes: Number(e.target.value) || 80,

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

                      holdMinutes: Number(e.target.value) || 15,

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

                      largePartySize: Number(e.target.value) || 10,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

              <div style={{ marginTop: 6 }}>

                Average Spend / Guest{" "}

                <input

                  type="number"

                  disabled={!managerUnlocked}

                  value={reservationSettings.avgSpendPerGuest}

                  onChange={(e) =>

                    setReservationSettings((p) => ({

                      ...p,

                      avgSpendPerGuest: Number(e.target.value) || 25,

                    }))

                  }

                  style={{ width: 70 }}

                />

              </div>

            </div>

                        <div

              style={{

                background: "white",

                padding: 10,

                border: "2px solid #111827",

                borderRadius: 8,

                minWidth: 590,

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

                  value={reservationAdults}

                  onChange={(e) => setReservationAdults(e.target.value)}

                  placeholder="Adults"

                  style={{ padding: 6, width: 70 }}

                />

                <input

                  value={reservationKids}

                  onChange={(e) => setReservationKids(e.target.value)}

                  placeholder="Kids"

                  style={{ padding: 6, width: 60 }}

                />

                <input

                  value={reservationNotes}

                  onChange={(e) => setReservationNotes(e.target.value)}

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

              <div style={{ marginTop: 8 }}>

                {guestTagOptions.map((tag) => (

                  <button

                    key={tag}

                    onClick={() => toggleReservationTag(tag)}

                    style={{

                      marginRight: 5,

                      marginBottom: 5,

                      padding: "4px 8px",

                      borderRadius: 12,

                      border: reservationTags.includes(tag)

                        ? "3px solid #111827"

                        : "1px solid #94a3b8",

                      background: reservationTagColor(tag),

                      fontWeight: reservationTags.includes(tag)

                        ? "bold"

                        : "normal",

                    }}

                  >

                    {tag}

                  </button>

                ))}

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

                    <input

            value={reservationSearch}

            onChange={(e) => setReservationSearch(e.target.value)}

            placeholder="Search name, phone, notes, or tag"

            style={{ padding: 8, width: 330, marginBottom: 8 }}

          />

          <div

            style={{

              display: "grid",

              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",

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

              const slotReservations = reservationsForSlot(reservationDate, slot);

              const selected = reservationTime === slot;

              return (

                <div

                  key={slot}

                  onClick={() => setReservationTime(slot)}

                  style={{

                    border: selected ? "4px solid #2563eb" : "2px solid #111827",

                    borderRadius: 8,

                    background: stats.full ? "#fecaca" : "white",

                    padding: 8,

                    cursor: "pointer",

                  }}

                >

                  <div style={{ fontWeight: "bold", fontSize: 16 }}>

                    {displayStandardTime(slot)}

                  </div>

                  <div style={{ fontSize: 13, fontWeight: "bold" }}>

                    {stats.reservations}/{reservationSettings.maxReservationsPerSlot}

                    {" reservations | "}

                    {stats.covers}/{reservationSettings.maxCoversPerSlot}

                    {" covers"}

                  </div>

                  {stats.full && (

                    <div style={{ color: "#991b1b", fontWeight: "bold" }}>

                      FULL

                    </div>

                  )}

                  {slotReservations.length === 0 && (

                    <div style={{ fontSize: 12, color: "#475569" }}>

                      Open slot

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

                        background: reservationStatusColor(r.status),

                        fontSize: 12,

                      }}

                    >

                      <b>{r.name}</b>

                      <br />

                      {reservationGuestLabel(r)}

                      <br />

                      {r.phone && (

                        <>

                          Phone: {r.phone}

                          <br />

                        </>

                      )}

                      Status: {r.status}

                      <br />

                      Suggestion: {reservationTableSuggestionText(r, activeTables)}

                      <br />

                      {(r.tags || []).map((tag) => (

                        <span

                          key={tag}

                          style={{

                            display: "inline-block",

                            marginRight: 4,

                            marginTop: 4,

                            padding: "2px 6px",

                            borderRadius: 10,

                            background: reservationTagColor(tag),

                            border: "1px solid #94a3b8",

                          }}

                        >

                          {tag}

                        </span>

                      ))}

                      {r.notes && (

                        <>

                          <br />

                          Notes: {r.notes}

                        </>

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

                            markReservationTextConfirmed(r.id);

                          }}

                        >

                          Text Confirm

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            markReservationReminderSent(r.id);

                          }}

                        >

                          Reminder

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            updateReservationStatus(r.id, "Arrived");

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

                            updateReservationStatus(r.id, "NoShow");

                          }}

                        >

                          No-show

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            updateReservationStatus(r.id, "Cancelled");

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

            {activeTab === "timeline" && appMode === "full" && (

        <div>

          <h1 style={{ marginTop: 0 }}>Reservation Timeline</h1>

          <input

            type="date"

            min={`${reservationSettings.year}-01-01`}

            max={`${reservationSettings.year}-12-31`}

            value={reservationDate}

            onChange={(e) => setReservationDate(e.target.value)}

            style={{

              padding: 8,

              border: "2px solid #111827",

              borderRadius: 8,

              marginBottom: 10,

            }}

          />

          <div

            style={{

              display: "grid",

              gridTemplateColumns: "120px 1fr",

              gap: 6,

              background: "white",

              border: "2px solid #111827",

              borderRadius: 8,

              padding: 8,

            }}

          >

            {slots.map((slot) => {

              const slotReservations = reservationsForSlot(reservationDate, slot);

              const stats = slotStats(

                reservationDate,

                slot,

                activeReservations,

                reservationSettings

              );

              return (

                <div key={slot} style={{ display: "contents" }}>

                  <div

                    style={{

                      fontWeight: "bold",

                      padding: 8,

                      borderRight: "2px solid #111827",

                    }}

                  >

                    {displayStandardTime(slot)}

                    <br />

                    <span style={{ fontSize: 11 }}>

                      {stats.covers}/{reservationSettings.maxCoversPerSlot} covers

                    </span>

                  </div>

                  <div

                    style={{

                      display: "flex",

                      gap: 6,

                      flexWrap: "wrap",

                      padding: 6,

                      minHeight: 48,

                      background: stats.full ? "#fecaca" : "#f8fafc",

                      borderRadius: 6,

                    }}

                  >

                    {slotReservations.length === 0 && (

                      <span style={{ color: "#64748b", fontSize: 12 }}>

                        Open

                      </span>

                    )}

                    {slotReservations.map((reservation) => (

                      <div

                        key={reservation.id}

                        style={{

                          minWidth: 190,

                          padding: 8,

                          border: "2px solid #111827",

                          borderRadius: 8,

                          background: reservationStatusColor(reservation.status),

                          fontSize: 12,

                        }}

                      >

                        <b>{reservation.name}</b> —{" "}

                        {reservationGuestLabel(reservation)}

                        <br />

                        Status: {reservation.status}

                        <br />

                        {reservationTableSuggestionText(reservation, activeTables)}

                        <div style={{ marginTop: 6 }}>

                          <button

                            onClick={() =>

                              updateReservationStatus(reservation.id, "Arrived")

                            }

                          >

                            Arrived

                          </button>{" "}

                          <button onClick={() => seatReservation(reservation)}>

                            Seat

                          </button>{" "}

                          <button

                            onClick={() => addReservationAsWaitlist(reservation)}

                          >

                            Waitlist

                          </button>{" "}

                          <button

                            onClick={() =>

                              updateReservationStatus(reservation.id, "NoShow")

                            }

                          >

                            No-show

                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      )}

            {activeTab === "reports" && appMode === "full" && (

        <div>

          <h1 style={{ marginTop: 0 }}>Reports, Texts & Sync</h1>

          <button onClick={generateShiftReport} style={{ padding: "9px 14px", fontWeight: "bold" }}>

            Generate Shift Report

          </button>{" "}

          <button onClick={printShiftReport} style={{ padding: "9px 14px", fontWeight: "bold" }}>

            Print Report

          </button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>

            <div style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10 }}>

              Covers: <b>{summary.covers}</b>

            </div>

            <div style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10 }}>

              Waitlist: <b>{summary.wait}</b>

            </div>

            <div style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10 }}>

              No-shows: <b>{summary.noShows}</b>

            </div>

            <div style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10 }}>

              Estimated Sales: <b>${summary.estimatedSales}</b>

            </div>

          </div>

          <h2>Text Message Queue</h2>

          {textMessages.map((message) => (

            <div key={message.id} style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10, marginBottom: 8 }}>

              <b>{message.type}</b> — {message.guestName}

              <br />

              Phone: {message.phone}

              <br />

              Status: {message.status}

              <br />

              {message.message}

              <br />

              <button onClick={() => markTextMessageReady(message.id)}>Ready</button>{" "}

              <button onClick={() => markTextMessageSentPlaceholder(message.id)}>Sent Placeholder</button>

            </div>

          ))}

          <h2>Guest History</h2>

          {guestHistory.map((guest) => (

            <div key={guest.id} style={{ background: "white", border: "2px solid #111827", borderRadius: 8, padding: 10, marginBottom: 8 }}>

              <b>{guest.name}</b> — Visits: {guest.visits}

              <br />

              Phone: {guest.phone}

              <br />

              Last Visit: {formatPrintDate(guest.lastVisit)}

              <br />

              Notes: {guest.notes}

            </div>

          ))}

          <h2>Offline Recovery Queue</h2>

          {offlineQueue.map((item) => (

            <div key={item.id} style={{ background: item.resolved ? "#dcfce7" : "#fee2e2", border: "2px solid #111827", borderRadius: 8, padding: 10, marginBottom: 8 }}>

              {item.action} — {formatPrintDate(item.createdAt)}

              <br />

              Status: {item.resolved ? "Resolved" : "Needs Sync"}

              <br />

              {!item.resolved && (

                <button onClick={() => markOfflineQueueResolved(item.id)}>Mark Resolved</button>

              )}

            </div>

          ))}

                    <h2>Sync Logs</h2>

          {syncLogs.map((log) => (

            <div

              key={log.id}

              style={{

                background: "white",

                border: "2px solid #111827",

                borderRadius: 8,

                padding: 10,

                marginBottom: 8,

                fontSize: 13,

              }}

            >

              {formatPrintDate(log.createdAt)} — {log.message}

            </div>

          ))}

          {shiftReports.map((report) => (

            <div

              key={report.createdAt}

              style={{

                background: "white",

                border: "2px solid #111827",

                borderRadius: 8,

                padding: 10,

                marginTop: 8,

              }}

            >

              <b>{formatPrintDate(report.createdAt)}</b>

              <br />

              Covers: {report.covers} | Reservations: {report.reservations} | Waitlist:{" "}

              {report.waitlist}

              <br />

              No-shows: {report.noShows} | Cancelled: {report.cancelled}

              <br />

              Estimated Sales: ${report.estimatedSales}

              <br />

              Busiest Time:{" "}

              {report.busiestTime === "N/A"

                ? "N/A"

                : displayStandardTime(report.busiestTime)}

            </div>

          ))}

        </div>

      )}

            {activeTab === "host" && appMode === "full" && (

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

            <button

              onClick={() => setEditMode(!editMode)}

              disabled={floorCheckMode}

              style={{

                padding: "8px 12px",

                borderRadius: 8,

                border: "2px solid #111827",

                background: editMode ? "#fde68a" : "white",

                fontWeight: "bold",

              }}

            >

              {editMode ? "Editing ON" : "Service Mode"}

            </button>

            <button

              onClick={() => {

                if (!requireManager()) return;

                setFloorLocked((prev) => !prev);

              }}

              style={{

                padding: "8px 12px",

                borderRadius: 8,

                border: "2px solid #111827",

                background: floorLocked ? "#dcfce7" : "#fecaca",

                fontWeight: "bold",

              }}

            >

              {floorLocked ? "Floor Locked" : "Floor Unlocked"}

            </button>

            <button

              onClick={() => setCombineMode(!combineMode)}

              disabled={floorCheckMode}

              style={{

                padding: "8px 12px",

                borderRadius: 8,

                border: "2px solid #111827",

                background: combineMode ? "#c4b5fd" : "white",

                fontWeight: "bold",

              }}

            >

              {combineMode ? "Combining ON" : "Combine Tables"}

            </button>

            {combineMode && !floorCheckMode && (

              <>

                <button onClick={combineSelectedTables}>

                  Combine Selected

                </button>

                <button onClick={uncombineSelectedTables}>

                  Uncombine Selected

                </button>

                <button onClick={() => setSelectedCombineIds([])}>

                  Clear Selection

                </button>

              </>

            )}

            <button

              onClick={resetAll}

              style={{

                padding: "8px 12px",

                borderRadius: 8,

                border: "2px solid #111827",

                background: "#fee2e2",

                fontWeight: "bold",

              }}

            >

              Reset All

            </button>

          </div>

                    <div

            style={{

              display: "flex",

              gap: 8,

              flexWrap: "wrap",

              marginBottom: 8,

            }}

          >

            <div

              style={{

                border: "3px solid #111827",

                borderRadius: 10,

                background: "white",

                padding: 10,

                minWidth: 260,

                fontSize: 13,

              }}

            >

              <div style={{ fontWeight: "bold", fontSize: 15 }}>

                Shift Dashboard

              </div>

              <div>

                Seated: {summary.seated} | Covers: {summary.covers}

              </div>

              <div>

                Wait: {summary.wait} | Over Wait: {summary.overWait}

              </div>

              <div>

                Priority/VIP: {summary.priority}

              </div>

              <div>

                Open: {summary.open} | Boxed: {summary.boxed} | Dirty:{" "}

                {summary.dirty}

              </div>

              <div>

                Reservations: {summary.reservationsToday}

              </div>

              <div>

                Servers Cut: {summary.serversCut}

              </div>

              <div>

                Est. Sales: ${summary.estimatedSales}

              </div>

              <div style={{ marginTop: 6, fontWeight: "bold" }}>

                {sectionBalanceSuggestion()}

              </div>

            </div>

            <div

              style={{

                border: "3px solid #111827",

                borderRadius: 10,

                background: "white",

                padding: 10,

                minWidth: 320,

                fontSize: 13,

              }}

            >

              <div style={{ fontWeight: "bold", fontSize: 15 }}>

                Night Map

              </div>

              <input

                value={nightMap.date}

                onChange={(e) => {

                  if (!managerUnlocked) return;

                  setNightMap((prev) => ({

                    ...prev,

                    date: e.target.value,

                  }));

                }}

                placeholder="Date"

                style={{ padding: 5, width: 90 }}

              />

              <input

                value={nightMap.manager}

                onChange={(e) => {

                  if (!managerUnlocked) return;

                  setNightMap((prev) => ({

                    ...prev,

                    manager: e.target.value,

                  }));

                }}

                placeholder="Manager"

                style={{ padding: 5, width: 110 }}

              />

              <br />

              <textarea

                value={nightMap.notes}

                onChange={(e) => {

                  if (!managerUnlocked) return;

                  setNightMap((prev) => ({

                    ...prev,

                    notes: e.target.value,

                  }));

                }}

                placeholder="Night notes, sections, cuts, specials..."

                style={{

                  marginTop: 5,

                  width: 295,

                  height: 55,

                  padding: 6,

                  fontFamily: "Arial",

                }}

              />

            </div>

            <label style={{ fontSize: 12 }}>

              Host / Podium:

              <br />

              <textarea

                value={hostInfo}

                onChange={(e) => setHostInfo(e.target.value)}

                style={{

                  width: 210,

                  height: 85,

                  padding: 8,

                }}

              />

            </label>

            <label style={{ fontSize: 12 }}>

              Takeout:

              <br />

              <input

                value={takeoutInfo}

                onChange={(e) => setTakeoutInfo(e.target.value)}

                style={{

                  width: 160,

                  padding: 8,

                }}

              />

            </label>

            <label style={{ fontSize: 12 }}>

              Casa Box:

              <br />

              <textarea

                value={casaInfo}

                onChange={(e) => setCasaInfo(e.target.value)}

                style={{

                  width: 210,

                  height: 85,

                  padding: 8,

                }}

              />

            </label>

            <label style={{ fontSize: 12 }}>

              San Miguel Box:

              <br />

              <textarea

                value={sanMiguelInfo}

                onChange={(e) => setSanMiguelInfo(e.target.value)}

                style={{

                  width: 210,

                  height: 85,

                  padding: 8,

                }}

              />

            </label>

          </div>

                    {!floorCheckMode && (

            <div

              style={{

                display: "flex",

                gap: 8,

                flexWrap: "wrap",

                marginBottom: 8,

              }}

            >

              <label style={{ fontSize: 12 }}>

                Server table assignments:

                <br />

                <textarea

                  value={serverAssignments}

                  onChange={(e) => setServerAssignments(e.target.value)}

                  onBlur={syncServerInfoFromAssignments}

                  placeholder={`Maria: 1,2,3\nJose: 20,21,22\nAna: Casa 1,Casa 2`}

                  style={{

                    width: 330,

                    height: 85,

                    padding: 8,

                    border: "2px solid #111827",

                    borderRadius: 8,

                    fontFamily: "Arial",

                  }}

                />

              </label>

              <div

                style={{

                  border: "2px solid #111827",

                  borderRadius: 8,

                  background: "white",

                  padding: 10,

                  minWidth: 180,

                  height: 85,

                  fontSize: 14,

                }}

              >

                <div style={{ fontWeight: "bold" }}>Smart Rotation</div>

                <div>

                  Next Up: <b>{nextUp || "Add active servers"}</b>

                </div>

                <button

                  onClick={rotateServer}

                  disabled={serverNamesFromAssignments().length === 0}

                  style={{

                    marginTop: 8,

                    padding: "6px 10px",

                    borderRadius: 6,

                    border: "2px solid #111827",

                    background: "#f8fafc",

                    fontWeight: "bold",

                  }}

                >

                  Next →

                </button>

              </div>

              {serverWorkloads().map((workload) => (

                <div

                  key={workload.server}

                  style={{

                    border: `3px solid ${

                      workload.cut ? "#64748b" : workload.color

                    }`,

                    borderRadius: 8,

                    background: workload.cut ? "#e5e7eb" : "white",

                    padding: 10,

                    minWidth: 170,

                    minHeight: 135,

                    fontSize: 13,

                  }}

                >

                  <div

                    style={{

                      fontWeight: "bold",

                      color: workload.cut

                        ? "#475569"

                        : workload.color,

                    }}

                  >

                    {workload.server}{" "}

                    {workload.cut ? "(CUT)" : ""}

                  </div>

                  <div>

                    Start:

                    <input

                      value={workload.startTime}

                      onChange={(e) =>

                        updateServerStartTime(

                          workload.server,

                          e.target.value

                        )

                      }

                      placeholder="4:00 PM"

                      style={{

                        width: 78,

                        marginLeft: 5,

                      }}

                    />

                  </div>

                  <div>

                    Goal:

                    <input

                      value={workload.salesGoal}

                      onChange={(e) =>

                        updateServerSalesGoal(

                          workload.server,

                          e.target.value

                        )

                      }

                      style={{

                        width: 70,

                        marginLeft: 5,

                      }}

                    />

                  </div>

                  <div>

                    Assigned: {workload.assignedCount}

                  </div>

                  <div>

                    Seated: {workload.seatedCount}

                  </div>

                  <div>

                    Covers: {workload.covers}

                  </div>

                  <div>

                    Est: ${workload.estimatedSales}

                  </div>

                  <button

                    onClick={() =>

                      toggleServerCut(workload.server)

                    }

                    style={{

                      marginTop: 4,

                      padding: "4px 8px",

                      borderRadius: 6,

                      border: "2px solid #111827",

                      background: workload.cut

                        ? "#dcfce7"

                        : "#fee2e2",

                      fontWeight: "bold",

                    }}

                  >

                    {workload.cut ? "Uncut" : "Cut"}

                  </button>

                </div>

              ))}

            </div>

          )}

                    {managerUnlocked && !floorCheckMode && (

            <div

              style={{

                display: "flex",

                gap: 8,

                flexWrap: "wrap",

                marginBottom: 8,

                padding: 8,

                background: "#f8fafc",

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            >

              <b>Manager Table Tools:</b>

              <input

                value={newTableId}

                onChange={(e) => setNewTableId(e.target.value)}

                placeholder="Table ID"

                style={{ padding: 6, width: 90 }}

              />

              <input

                value={newTableSeats}

                onChange={(e) => setNewTableSeats(e.target.value)}

                placeholder="Seats"

                style={{ padding: 6, width: 70 }}

              />

              <select

                value={newTableSection}

                onChange={(e) => setNewTableSection(e.target.value as Section)}

                style={{ padding: 6 }}

              >

                <option>Main</option>

                <option>Patio</option>

                <option>Lounge</option>

                <option>Casa</option>

                <option>San Miguel</option>

              </select>

              <select

                value={newTableShape}

                onChange={(e) => setNewTableShape(e.target.value as TableShape)}

                style={{ padding: 6 }}

              >

                {tableShapeOptions.map((shape) => (

                  <option key={shape}>{shape}</option>

                ))}

              </select>

              <button

                onClick={addNewTable}

                style={{

                  padding: "6px 10px",

                  borderRadius: 6,

                  border: "2px solid #111827",

                  fontWeight: "bold",

                }}

              >

                Add Table

              </button>

            </div>

          )}

          {!floorCheckMode && (

            <div

              style={{

                display: "flex",

                gap: 6,

                flexWrap: "wrap",

                marginBottom: 8,

                padding: 8,

                background: "white",

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            >

              <b>Add Wait:</b>

              <input

                value={guestName}

                onChange={(e) => setGuestName(e.target.value)}

                placeholder="Guest name"

                style={{ padding: 7 }}

              />

              <input

                value={partySize}

                onChange={(e) => {

                  setPartySize(e.target.value);

                  setQuotedWait(dynamicWaitQuote(e.target.value));

                }}

                placeholder="#"

                style={{ padding: 7, width: 50 }}

              />

              <input

                value={pager}

                onChange={(e) => setPager(e.target.value)}

                placeholder="Phone/Pager"

                style={{ padding: 7, width: 105 }}

              />

              <select

                value={quotedWait}

                onChange={(e) => setQuotedWait(e.target.value)}

                style={{ padding: 7 }}

              >

                {waitTimeOptions.map((option) => (

                  <option key={option}>{option}</option>

                ))}

              </select>

              <select

                value={partyType}

                onChange={(e) => setPartyType(e.target.value as PartyType)}

                style={{ padding: 7 }}

              >

                {partyTypeOptions.map((option) => (

                  <option key={option}>{option}</option>

                ))}

              </select>

              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>

                <input

                  type="checkbox"

                  checked={waitPriority}

                  onChange={(e) => setWaitPriority(e.target.checked)}

                />

                VIP

              </label>

              <input

                value={waitNotes}

                onChange={(e) => setWaitNotes(e.target.value)}

                placeholder="Notes: allergy, stroller, high chair, patio..."

                style={{ padding: 7, width: 260 }}

              />

              <button

                onClick={addToWaitlist}

                style={{

                  padding: "7px 10px",

                  borderRadius: 6,

                  border: "2px solid #111827",

                  fontWeight: "bold",

                }}

              >

                Add Wait

              </button>

            </div>

          )}

                    {!floorCheckMode && upcomingReservations.length > 0 && (

            <div

              style={{

                marginBottom: 8,

                padding: 8,

                background: "white",

                border: "2px solid #111827",

                borderRadius: 8,

              }}

            >

              <div style={{ fontWeight: "bold", marginBottom: 6 }}>

                Today’s Reservations on Host Page

              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                {upcomingReservations.map((reservation) => (

                  <div

                    key={reservation.id}

                    style={{

                      padding: 8,

                      borderRadius: 8,

                      border: "2px solid #111827",

                      background: reservationStatusColor(reservation.status),

                      minWidth: 220,

                      fontSize: 12,

                    }}

                  >

                    <b>

                      {displayStandardTime(reservation.time)} — {reservation.name}

                    </b>

                    <br />

                    {reservationGuestLabel(reservation)}

                    <br />

                    Status: {reservation.status}

                    <br />

                    Suggestion: {reservationTableSuggestionText(

                      reservation,

                      activeTables

                    )}

                    {(reservation.tags || []).length > 0 && (

                      <div style={{ marginTop: 4 }}>

                        {(reservation.tags || []).map((tag) => (

                          <span

                            key={tag}

                            style={{

                              display: "inline-block",

                              marginRight: 4,

                              marginBottom: 3,

                              padding: "2px 6px",

                              borderRadius: 10,

                              background: reservationTagColor(tag),

                              border: "1px solid #94a3b8",

                            }}

                          >

                            {tag}

                          </span>

                        ))}

                      </div>

                    )}

                    {reservation.notes && (

                      <>

                        <br />

                        Notes: {reservation.notes}

                      </>

                    )}

                    {reservationTotalGuests(reservation) >=

                      reservationSettings.largePartySize && (

                      <div>⚠️ 20% auto gratuity</div>

                    )}

                    {isReservationWithinHoldWindow(

                      reservation,

                      reservationSettings

                    ) && (

                      <div style={{ color: "#dc2626", fontWeight: "bold" }}>

                        🚨 Hold window active

                      </div>

                    )}

                    <div style={{ marginTop: 5 }}>

                      <button

                        onClick={() =>

                          updateReservationStatus(reservation.id, "Arrived")

                        }

                      >

                        Arrived

                      </button>{" "}

                      <button onClick={() => seatReservation(reservation)}>

                        Seat

                      </button>{" "}

                      <button

                        onClick={() => addReservationAsWaitlist(reservation)}

                      >

                        Waitlist

                      </button>{" "}

                      <button

                        onClick={() =>

                          updateReservationStatus(reservation.id, "NoShow")

                        }

                      >

                        No-show

                      </button>{" "}

                      <button

                        onClick={() =>

                          updateReservationStatus(reservation.id, "Cancelled")

                        }

                      >

                        Cancel

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

                    {holdingReservations.length > 0 && (

            <div

              style={{

                marginBottom: 8,

                padding: 8,

                background: "#fecaca",

                border: "2px solid #991b1b",

                borderRadius: 8,

                fontWeight: "bold",

              }}

            >

              Reservation hold active:{" "}

              {holdingReservations

                .map(

                  (r) =>

                    `${r.name} ${displayStandardTime(r.time)} (${reservationGuestLabel(r)})`

                )

                .join(", ")}

            </div>

          )}

          {!floorCheckMode && selectedParty && (

            <div

              style={{

                marginBottom: 8,

                padding: 8,

                background: "#fde68a",

                border: "2px solid #111827",

                borderRadius: 8,

                fontWeight: "bold",

                display: "inline-flex",

                gap: 10,

                alignItems: "center",

              }}

            >

              <span>

                Selected: {selectedParty.name} - {selectedParty.size}

                {bestTable ? ` | Best table: ${bestTable.id}` : " | No open table fits"}

              </span>

              {bestTable && (

                <button

                  onClick={seatSelectedPartyAtBestTable}

                  style={{

                    padding: "5px 9px",

                    borderRadius: 6,

                    border: "2px solid #111827",

                    fontWeight: "bold",

                  }}

                >

                  Seat Best

                </button>

              )}

            </div>

          )}

          {!floorCheckMode && (

            <div

              style={{

                display: "flex",

                gap: 8,

                marginBottom: 8,

                flexWrap: "wrap",

              }}

            >

              {activeWaitlist.map((party) => (

                <div

                  key={party.id}

                  style={{

                    display: "flex",

                    gap: 5,

                    alignItems: "center",

                    padding: 7,

                    borderRadius: 8,

                    border:

                      selectedPartyId === party.id

                        ? "3px solid #f59e0b"

                        : "2px solid #111827",

                    background: waitlistColor(party),

                    fontWeight: "bold",

                    flexWrap: "wrap",

                  }}

                >

                  <button

                    onClick={() => setSelectedPartyId(party.id)}

                    style={{

                      border: "none",

                      background: "transparent",

                      fontWeight: "bold",

                      textAlign: "left",

                    }}

                  >

                    {party.priority ? "⭐ " : ""}

                    {party.name} - {party.size}

                    {party.pager ? ` | ${party.pager}` : ""}

                    <br />

                    Actual: {minutesSince(party.createdAt)} | Quote:{" "}

                    {party.quotedWait || "N/A"} | {party.partyType || "Walk-in"}

                    {party.pagedAt && (

                      <>

                        <br />

                        Paged: {minutesSince(party.pagedAt)} ago

                      </>

                    )}

                    {party.notes && (

                      <>

                        <br />

                        Notes: {party.notes}

                      </>

                    )}

                    {isOverQuotedWait(party) && (

                      <>

                        <br />

                        ⚠️ Over quoted wait

                      </>

                    )}

                    {party.textReadySent && (

                      <>

                        <br />

                        ✅ Text ready marked

                      </>

                    )}

                  </button>

                  <button onClick={() => cycleWaitStatus(party.id)}>

                    {party.status || "Waiting"}

                  </button>

                  <button onClick={() => markTextReadySent(party.id)}>

                    Text Ready

                  </button>

                  <button onClick={() => removeFromWaitlist(party.id)}>X</button>

                </div>

              ))}

            </div>

          )}

                    {combineMode && !floorCheckMode && (

            <div style={{ marginBottom: 8, fontWeight: "bold" }}>

              Selected to combine:{" "}

              {selectedCombineIds.length > 0

                ? selectedCombineIds.join(", ")

                : "none"}

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

                transform: floorCheckMode ? "scale(0.82)" : "scale(0.74)",

                transformOrigin: "top left",

                marginBottom: floorCheckMode ? -190 : -270,

                touchAction: editMode && !floorLocked ? "none" : "auto",

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

              <div

                style={{

                  position: "absolute",

                  left: 1240,

                  top: 0,

                  width: 260,

                  height: 650,

                  borderLeft: "5px solid #111827",

                  borderBottom: "5px solid #111827",

                  background: "#fffdf7",

                  zIndex: 3,

                }}

              >

                <div

                  style={{

                    height: 110,

                    padding: 14,

                    fontWeight: "bold",

                    fontSize: 18,

                    whiteSpace: "pre-line",

                  }}

                >

                  {hostInfo}

                </div>

                <div

                  style={{

                    background: "#111827",

                    color: "white",

                    textAlign: "center",

                    padding: 8,

                    fontSize: 22,

                    fontWeight: "bold",

                    margin: "0 20px",

                  }}

                >

                  San Miguel

                </div>

                <div

                  style={{

                    margin: "14px 22px",

                    padding: 12,

                    height: 165,

                    border: "3px solid #111827",

                    fontSize: 15,

                    whiteSpace: "pre-line",

                  }}

                >

                  {sanMiguelInfo}

                </div>

              </div>

                            <div

                style={{

                  position: "absolute",

                  left: 1225,

                  top: 735,

                  width: 255,

                  height: 290,

                  border: "4px solid #111827",

                  background: "#fffdf7",

                  zIndex: 3,

                }}

              >

                <div

                  style={{

                    background: "#111827",

                    color: "white",

                    textAlign: "center",

                    padding: 8,

                    fontSize: 20,

                    fontWeight: "bold",

                  }}

                >

                  Casa 1884

                </div>

                <div

                  style={{

                    padding: 16,

                    fontSize: 16,

                    whiteSpace: "pre-line",

                  }}

                >

                  {casaInfo}

                </div>

              </div>

              <div

                style={{

                  position: "absolute",

                  left: 120,

                  top: 405,

                  fontSize: 25,

                  fontStyle: "italic",

                  fontWeight: "bold",

                  zIndex: 3,

                  whiteSpace: "pre-line",

                }}

              >

                {takeoutInfo}

              </div>

              <div

                style={{

                  position: "absolute",

                  left: 310,

                  top: 625,

                  width: 335,

                  height: 85,

                  borderRadius: 20,

                  border: "5px solid #64748b",

                  background: "#dbeafe",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  fontSize: 36,

                  fontWeight: "bold",

                  zIndex: 3,

                }}

              >

                BAR

              </div>

              <div

                style={{

                  position: "absolute",

                  left: 810,

                  top: 600,

                  width: 275,

                  height: 48,

                  background: "white",

                  border: "3px solid #111827",

                  textAlign: "center",

                  paddingTop: 10,

                  fontWeight: "bold",

                  fontSize: 18,

                  zIndex: 3,

                }}

              >

                Buffet

              </div>

                            {activeTables.map((table, index) => {

                const selected = selectedCombineIds.includes(table.id);

                const assignedServer =

                  assignedServerForTable(table.id) || table.server;

                const overdue =

                  table.status === "Seated" &&

                  isOverdueTurn(table, reservationSettings);

                return (

                  <div

                    key={table.id}

                    onPointerDown={() => startDrag(index)}

                    onClick={() => updateTable(index)}

                    style={{

                      position: "absolute",

                      left: table.x,

                      top: table.y,

                      width: table.w,

                      height: table.h,

                      borderRadius:

                        table.shape === "round"

                          ? "999px"

                          : table.shape === "booth"

                          ? "16px"

                          : "8px",

                      border: selected

                        ? "5px solid #7c3aed"

                        : overdue

                        ? "5px solid #dc2626"

                        : "3px solid #111827",

                      background: turnBackground(table),

                      display: "flex",

                      flexDirection: "column",

                      alignItems: "center",

                      justifyContent: "center",

                      fontWeight: "bold",

                      cursor:

                        editMode && !floorLocked

                          ? "grab"

                          : "pointer",

                      userSelect: "none",

                      zIndex: selected ? 6 : 4,

                      boxShadow: table.readyFlash

                        ? "0 0 0 5px rgba(34,197,94,.4)"

                        : undefined,

                      transition: "all .15s ease",

                    }}

                  >

                    <div style={{ fontSize: 14 }}>

                      {table.id}

                    </div>

                    <div style={{ fontSize: 12 }}>

                      {table.seats}

                    </div>

                    {table.guest && (

                      <div

                        style={{

                          fontSize: 10,

                          textAlign: "center",

                          padding: "0 2px",

                        }}

                      >

                        {table.guest}

                      </div>

                    )}

                    {table.partySize && (

                      <div style={{ fontSize: 10 }}>

                        {table.partySize} guests

                      </div>

                    )}

                    {assignedServer && (

                      <div

                        style={{

                          fontSize: 10,

                          background: getServerColor(assignedServer),

                          color: "white",

                          padding: "1px 5px",

                          borderRadius: 10,

                          marginTop: 2,

                        }}

                      >

                        {assignedServer}

                      </div>

                    )}

                    {table.status === "Seated" &&

                      table.seatedAt && (

                        <div

                          style={{

                            fontSize: 9,

                            marginTop: 2,

                            textAlign: "center",

                          }}

                        >

                          {minutesSince(table.seatedAt)}

                        </div>

                      )}

                    {table.combinedLabel && (

                      <div

                        style={{

                          position: "absolute",

                          bottom: -18,

                          background: "#ede9fe",

                          border: "1px solid #7c3aed",

                          borderRadius: 10,

                          padding: "1px 5px",

                          fontSize: 9,

                          whiteSpace: "nowrap",

                        }}

                      >

                        {table.combinedLabel}

                      </div>

                    )}

                    {overdue && (

                      <div

                        style={{

                          position: "absolute",

                          top: -16,

                          background: "#dc2626",

                          color: "white",

                          borderRadius: 8,

                          padding: "1px 6px",

                          fontSize: 9,

                        }}

                      >

                        OVERDUE

                      </div>

                    )}

                  </div>

                );

              })}

                          </div>

          </div>

          <p style={{ marginTop: 8, fontSize: 14 }}>

            Floor Check Mode is for quick table updates only. Texting, live sync, and

            offline recovery are structured as placeholders until connected to a backend.

          </p>

        </>

      )}

    </main>

  );
  
}
