import { TableItem } from "../types/host";

const snap = (n: number) => Math.round(n / 5) * 5;

function makeTable(

  id: string,

  seats: string,

  x: number,

  y: number,

  w = 62,

  h = 48,

  section: TableItem["section"] = "Main"

): TableItem {

  return {

    id,

    seats,

    x: snap(x),

    y: snap(y),

    w: snap(w),

    h: snap(h),

    section,

    status: "Open",

  };

}

export const ENRIQUES_TABLES: TableItem[] = [

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
