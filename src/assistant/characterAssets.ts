export type BuddyCharacterId = "female-office" | "male-office";

export interface CharacterAsset {
  id: BuddyCharacterId;
  label: string;
  spriteRows?: string[];
  palette?: Record<string, string>;
  spriteSize: { width: number; height: number };
  imageUrl?: string;
}

export const CHARACTER_ASSETS: Record<BuddyCharacterId, CharacterAsset> = {
  "female-office": {
    id: "female-office",
    label: "Office worker pixel character",
    spriteSize: { width: 1254, height: 1254 },
    imageUrl: "/assets/character.png",
  },
  "male-office": {
    id: "male-office",
    label: "Male office chibi pixel secretary",
    palette: {
      K: "#1b1222",
      H: "#3f2b25",
      h: "#85604f",
      S: "#ffd2aa",
      P: "#ee8a91",
      M: "#8e314c",
      W: "#f8f0d8",
      R: "#4c9a84",
      N: "#2e3f68",
      B: "#4d7fb3",
      D: "#5d4b4e",
    },
    spriteSize: { width: 20, height: 24 },
  },
};

export const DEFAULT_CHARACTER_ID: BuddyCharacterId = "female-office";

export function getCharacterAsset(id: BuddyCharacterId = DEFAULT_CHARACTER_ID) {
  return CHARACTER_ASSETS[id];
}
