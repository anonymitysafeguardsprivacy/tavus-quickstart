import { atom } from "jotai";

export type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "settings"
  | "conversation";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "conversation",
};

export const screenAtom = atom<ScreenState>(initialScreenState);