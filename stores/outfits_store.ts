// /stores/outfits_store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Outfit = Tables<"outfit"> & {
  layers: Tables<"layer">[];
};

type OutfitState = {
  outfits: Outfit[];
  setOutfits: (outfits: Outfit[]) => void;
  addOutfit: (outfit: {
    name: string;
    layer_ids?: string[];
  }) => Promise<void>;
  deleteOutfit: (outfitId: string) => Promise<void>;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useOutfitStore = create<OutfitState>()(
  devtools(
    (set) => ({
      outfits: [],

      setOutfits: (outfits) => set({ outfits }),

      addOutfit: async (outfitData) => {
        try {
          /* 1. Get user */
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) console.error("🔴 [OUTFITS] Error getting user:", userError);
          else console.log("🟢 [OUTFITS] User data:", { id: user?.id });

          /* 2. Insert outfit */
          const insertData = {
            name: outfitData.name,
            user_id: user?.id ?? null,
          };
          console.log("🔵 [OUTFITS] Inserting:", insertData);

          const { data: newOutfit, error: insertErr } = await supabase
            .from("outfit")
            .insert(insertData)
            .select()
            .single();

          if (insertErr) throw insertErr;
          console.log("🟢 [OUTFITS] Outfit inserted:", newOutfit);

          /* 3. Insert outfit-layer relations (if any) */
          if (outfitData.layer_ids?.length && newOutfit) {
            const relations = outfitData.layer_ids.map((layerId) => ({
              outfit_id: newOutfit.id,
              layer_id: layerId,
            }));
            console.log("🔵 [OUTFITS] Inserting relations:", relations);

            const { error: relErr } = await supabase
              .from("outfit_layer")
              .insert(relations);

            if (relErr) throw relErr;
            console.log("🟢 [OUTFITS] Relations inserted");
          }
        } catch (err) {
          console.error("🔴 [OUTFITS] Failed to add outfit:", err);
          throw err;
        }
      },

      deleteOutfit: async (outfitId) => {
        try {
          console.log("🔵 [OUTFITS] Deleting outfit:", outfitId);

          const { data, error } = await supabase
            .from("outfit")
            .delete()
            .eq("id", outfitId)
            .select();

          if (error) throw error;
          console.log("🟢 [OUTFITS] Deleted:", data);
        } catch (err) {
          console.error("🔴 [OUTFITS] Failed to delete outfit:", err);
          throw err;
        }
      },
    }),
    { name: "🧵 Outfit Store" }
  )
);

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export type { Outfit };
