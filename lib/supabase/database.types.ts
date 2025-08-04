export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      layer: {
        Row: {
          bottom: boolean | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          top: boolean | null
          user_id: string | null
          warmth: number | null
        }
        Insert: {
          bottom?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          top?: boolean | null
          user_id?: string | null
          warmth?: number | null
        }
        Update: {
          bottom?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          top?: boolean | null
          user_id?: string | null
          warmth?: number | null
        }
        Relationships: []
      }
      log: {
        Row: {
          address: string | null
          comfort_level: number | null
          created_at: string
          date: string | null
          feedback: string | null
          id: string
          latitude: number | null
          longitude: number | null
          user_id: string | null
          weather_id: string | null
        }
        Insert: {
          address?: string | null
          comfort_level?: number | null
          created_at?: string
          date?: string | null
          feedback?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
          weather_id?: string | null
        }
        Update: {
          address?: string | null
          comfort_level?: number | null
          created_at?: string
          date?: string | null
          feedback?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
          weather_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_log_weather_id_fkey"
            columns: ["weather_id"]
            isOneToOne: false
            referencedRelation: "weather"
            referencedColumns: ["id"]
          },
        ]
      }
      log_layer: {
        Row: {
          created_at: string
          id: string
          layer_id: string | null
          log_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          layer_id?: string | null
          log_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          layer_id?: string | null
          log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_layer_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_layer_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "layer"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          date: string | null
          id: number
          latitude: number | null
          layers: string[]
          longitude: number | null
          reasoning: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: number
          latitude?: number | null
          layers: string[]
          longitude?: number | null
          reasoning?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: number
          latitude?: number | null
          layers?: string[]
          longitude?: number | null
          reasoning?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weather: {
        Row: {
          created_at: string
          date: string | null
          id: string
          latitude: number | null
          longitude: number | null
          weather_data: Json | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          weather_data?: Json | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          weather_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_outfit_warmth: {
        Args: { outfit_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
