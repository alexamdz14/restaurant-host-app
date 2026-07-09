export type TableStatus =

  | "Open"

  | "Seated"

  | "Boxed"

  | "Dirty";

export type Section =

  | "Main"

  | "Patio"

  | "Lounge"

  | "Casa"

  | "San Miguel";

export interface TableItem {

  id: string;

  seats: string;

  x: number;

  y: number;

  w: number;

  h: number;

  section: Section;

  status: TableStatus;

  guest?: string;

  partySize?: string;

  server?: string;

  seatedAt?: number;

}

export const STATUS_COLORS = {

  Open: "#d8f5df",

  Seated: "#bfdbfe",

  Boxed: "#fde68a",

  Dirty: "#f87171",

};

export type WaitStatus = "Waiting" | "Paged" | "Seated" | "NoShow";

export interface WaitParty {

  id: number;

  name: string;

  size: string;

  phone: string;

  notes: string;

  status: WaitStatus;

  quotedWait: string;

  createdAt: number;

}

export type ServerStatus = "Off" | "Checked In" | "Break" | "Cut";

export interface ServerInfo {

  id: string;

  name: string;

  startTime: string;

  cutTime?: string;

  status: ServerStatus;

  color: string;

  tables: string[];

  checkedInAt?: number;

}
