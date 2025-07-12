import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const getUserInfoTool = tool({
  description: "Get the authenticated user's profile information including location data",
  parameters: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("🔴 [USER_INFO] Error getting user:", userError);
        return `❌ Authentication error: ${userError.message}`;
      }

      if (!user) {
        return `❌ No authenticated user found. Please log in first.`;
      }

      console.log("🟢 [USER_INFO] User data received:", { id: user.id });

      // Fetch user profile from profiles table
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("🔴 [USER_INFO] Error fetching profile:", fetchError);
        return `❌ Failed to fetch user profile: ${fetchError.message}`;
      }

      if (!profile) {
        return "📝 No profile found for this user";
      }

      console.log("🟢 [USER_INFO] Profile fetched successfully:", profile);
      
      // Format the response with user info
      const userInfo = {
        id: user.id,
        email: user.email,
        profile: profile,
      };

      return `👤 User Profile Information:\n${JSON.stringify(userInfo, null, 2)}`;
    } catch (error: unknown) {
      console.error("🔴 [USER_INFO] Failed to fetch user info:", error);
      return `⚠️ Failed to fetch user info: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
