export const CHARACTER_ICONS = [
  // 동물 아이콘
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐻‍❄️",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🦄",
  "🦋",
  "🐢",
  "🐙",
  "🦀",
  "🦞",
  "🦐",
  "🦑",
  "🐠",
  "🐬",
  "🐋",
  "🦈",
  "🦭",
  "🐝",
  "🪱",
  "🐛",
  "🦗",
  "🦟",
  "🪰",
  "🪲",
  "🐞",
  "🦂",
  "🕷️",
  "🦔",
  "🦇",
  "🐅",
  "🐆",
  "🦓",
  "🦍",
  "🦧",
  "🐘",
  "🦛",
  "🦏",
  "🐪",
  "🐫",
  "🦒",
  "🦘",
  "🦬",
  "🐃",
  "🦙",
  "🦣",

  // 이모지 아이콘
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "🙃",
  "😉",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😘",
  "😗",

  // 과일 아이콘
  "🍎",
  "🍐",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🫐",
  "🍈",
  "🍒",
  "🍑",
  "🥭",

  // 기타 아이콘
  "🌟",
  "⭐",
  "🌈",
  "🌞",
  "🌝",
  "🌚",
  "🔥",
  "💫",
  "✨",
  "💥",
  "🎵",
  "🎶",
  "🎸",
  "🥁",
  "🏆"
];

export const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 90 + 160)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(Math.random() * 90 + 160)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(Math.random() * 90 + 160)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
};

export const assignCharacters = (participants: string[]) => {
  const shuffledCharacters = [...CHARACTER_ICONS].sort(() => Math.random() - 0.5);
  return participants.map((name, index) => ({
    name,
    character: shuffledCharacters[index % shuffledCharacters.length],
    color: generatePastelColor()
  }));
};
