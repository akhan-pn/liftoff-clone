import type { LeaderboardUser } from "./types";

const NAMES = [
  "Maya Chen",
  "Diego Ruiz",
  "Aisha Patel",
  "Liam O'Connor",
  "Zara Khan",
  "Marcus Bell",
  "Yuki Tanaka",
  "Sofia Romano",
  "Kofi Asante",
  "Priya Iyer",
  "Noah Adler",
  "Lina Park",
  "Andre Nikolic",
  "Riya Bose",
  "Tomás Vidal",
  "Emma Hart",
  "Khaled Idris",
  "Ines Garcia",
  "Hiro Sato",
  "Imani Webb",
  "Bjorn Linden",
  "Fatima Rauf",
  "Sami Shah",
  "Ava Lee",
  "Jonas Mauer",
  "Teagan Cole",
  "Owen Wright",
  "Camille Roux",
  "Selma Knaus",
  "Adrian Voss",
  "Dante Brooks",
  "Hannah Yoon",
  "Mateo Vargas",
  "Elif Demir",
  "Ronan Ó Briain",
  "Mira Solberg",
  "Cyrus Reza",
  "Nadia Volkov",
  "Theo Marlow",
  "Amaya Diop",
  "Felix Strom",
  "Reina Akiyama",
  "Karim Yousef",
  "Jules Lefevre",
  "Pia Jansen",
  "Asher Ng",
  "Lia Kostas",
  "Roko Babic",
  "Vihaan Mehta",
  "Sage Whitman",
];

function avatarFromName(name: string) {
  return name
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

// Deterministic pseudo-random by index so the leaderboard is stable per device.
function pseudo(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateLeaderboard(seed = 7): LeaderboardUser[] {
  const rand = pseudo(seed);
  return NAMES.map((name, i) => {
    const monthly = Math.round(20_000 + rand() * 480_000);
    const weekly = Math.round(monthly * (0.18 + rand() * 0.1));
    const streak = Math.round(rand() * 28);
    return {
      id: `seed-${i}`,
      name,
      avatar: avatarFromName(name),
      weeklyVolumeKg: weekly,
      monthlyVolumeKg: monthly,
      streak,
      rank: "",
    };
  });
}
