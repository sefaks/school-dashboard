// src/store/languageStore.ts
import { create } from "zustand";

interface LanguageState {
  language: "en" | "tr";
  setLanguage: (lang: "en" | "tr") => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
}));
