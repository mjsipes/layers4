// /stores/global_state.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */


type SelectedItemType = "selectlayer" | "selectoutfit" | "selectlog" | "addlayer" | "addoutfit" | "addlog" | "recommendations";
type ViewMode = "table" | "grid";
type WardrobeTab = "layers" | "outfits" | "logs";

type GlobalState = {
  selectedItemId: string | null;
  selectedType: SelectedItemType;
  wardrobeViewMode: ViewMode;
  wardrobeActiveTab: WardrobeTab;
  setSelectedItem: (itemId: string | null, type: SelectedItemType) => void;
  setWardrobeViewMode: (mode: ViewMode) => void;
  setWardrobeActiveTab: (tab: WardrobeTab) => void;
  toggleWardrobeViewMode: () => void;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */


export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedItemId: null,
        selectedType: "addlayer",
        wardrobeViewMode: "grid",
        wardrobeActiveTab: "layers",
        setSelectedItem: (itemId, type) =>
          set({ selectedItemId: itemId, selectedType: type }),
        setWardrobeViewMode: (mode) =>
          set({ wardrobeViewMode: mode }),
        setWardrobeActiveTab: (tab) =>
          set({ wardrobeActiveTab: tab }),
        toggleWardrobeViewMode: () =>
          set((state) => ({
            wardrobeViewMode: state.wardrobeViewMode === "table" ? "grid" : "table",
          })),
      }),
      {
        name: 'layers-global-state', // localStorage key
        partialize: (state) => ({
          // Only persist these specific fields
          wardrobeViewMode: state.wardrobeViewMode,
          wardrobeActiveTab: state.wardrobeActiveTab,
        }),
      }
    ),
    { name: '🌐 Global Store' }
  )
);
