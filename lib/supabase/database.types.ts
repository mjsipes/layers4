export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      base_scores: {
        Row: {
          breathability: Json
          factor_weights: Json
          id: string
          ideal_temperature: number
          inserted_at: string | null
          insulation: Json
          style: Json
          waterproof: Json
          wind_resistance: Json
        }
        Insert: {
          breathability: Json
          factor_weights: Json
          id?: string
          ideal_temperature: number
          inserted_at?: string | null
          insulation: Json
          style: Json
          waterproof: Json
          wind_resistance: Json
        }
        Update: {
          breathability?: Json
          factor_weights?: Json
          id?: string
          ideal_temperature?: number
          inserted_at?: string | null
          insulation?: Json
          style?: Json
          waterproof?: Json
          wind_resistance?: Json
        }
        Relationships: []
      }
      clothing_items: {
        Row: {
          ai_evaluation_notes: string | null
          category: string
          cold_score: number
          comfort_features: string[]
          created_at: string | null
          heat_score: number
          humidity_score: number
          id: string
          insulation_type: string
          material: string
          name: string
          quick_dry: boolean
          rain_score: number
          style: string
          style_keywords: string[]
          sun_protection: string
          sun_score: number
          thickness: number
          updated_at: string | null
          user_id: string | null
          water_resistance: string
          weather_adaptability: string[]
          wind_protection: string
          wind_score: number
        }
        Insert: {
          ai_evaluation_notes?: string | null
          category: string
          cold_score: number
          comfort_features?: string[]
          created_at?: string | null
          heat_score: number
          humidity_score: number
          id: string
          insulation_type: string
          material: string
          name: string
          quick_dry?: boolean
          rain_score: number
          style: string
          style_keywords?: string[]
          sun_protection: string
          sun_score: number
          thickness: number
          updated_at?: string | null
          user_id?: string | null
          water_resistance: string
          weather_adaptability?: string[]
          wind_protection: string
          wind_score: number
        }
        Update: {
          ai_evaluation_notes?: string | null
          category?: string
          cold_score?: number
          comfort_features?: string[]
          created_at?: string | null
          heat_score?: number
          humidity_score?: number
          id?: string
          insulation_type?: string
          material?: string
          name?: string
          quick_dry?: boolean
          rain_score?: number
          style?: string
          style_keywords?: string[]
          sun_protection?: string
          sun_score?: number
          thickness?: number
          updated_at?: string | null
          user_id?: string | null
          water_resistance?: string
          weather_adaptability?: string[]
          wind_protection?: string
          wind_score?: number
        }
        Relationships: []
      }
      layer: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          user_id: string | null
          warmth: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
          warmth?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
          warmth?: number | null
        }
        Relationships: []
      }
      log: {
        Row: {
          comfort_level: number | null
          created_at: string
          date: string | null
          feedback: string | null
          id: string
          outfit_id: string | null
          weather_id: string | null
        }
        Insert: {
          comfort_level?: number | null
          created_at?: string
          date?: string | null
          feedback?: string | null
          id?: string
          outfit_id?: string | null
          weather_id?: string | null
        }
        Update: {
          comfort_level?: number | null
          created_at?: string
          date?: string | null
          feedback?: string | null
          id?: string
          outfit_id?: string | null
          weather_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_log_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_log_weather_id_fkey"
            columns: ["weather_id"]
            isOneToOne: false
            referencedRelation: "weather"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit: {
        Row: {
          created_at: string
          id: string
          name: string | null
          total_warmth: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          total_warmth?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          total_warmth?: number | null
        }
        Relationships: []
      }
      outfit_layer: {
        Row: {
          created_at: string
          id: string
          layer_id: string | null
          outfit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          layer_id?: string | null
          outfit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          layer_id?: string | null
          outfit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_layer_layer_id_fkey"
            columns: ["layer_id"]
            isOneToOne: false
            referencedRelation: "layer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_layer_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit"
            referencedColumns: ["id"]
          },
        ]
      }
      user_style_preferences: {
        Row: {
          color_preferences: string[] | null
          comfort_priority: number
          created_at: string | null
          fit_preferences: string[] | null
          functionality_priority: number
          id: string
          material_preferences: string[] | null
          preference_name: string
          preferred_styles: string[]
          style_inspiration: string | null
          style_priority: number
          updated_at: string | null
          user_id: string | null
          weather_condition: string
        }
        Insert: {
          color_preferences?: string[] | null
          comfort_priority: number
          created_at?: string | null
          fit_preferences?: string[] | null
          functionality_priority: number
          id?: string
          material_preferences?: string[] | null
          preference_name: string
          preferred_styles?: string[]
          style_inspiration?: string | null
          style_priority: number
          updated_at?: string | null
          user_id?: string | null
          weather_condition: string
        }
        Update: {
          color_preferences?: string[] | null
          comfort_priority?: number
          created_at?: string | null
          fit_preferences?: string[] | null
          functionality_priority?: number
          id?: string
          material_preferences?: string[] | null
          preference_name?: string
          preferred_styles?: string[]
          style_inspiration?: string | null
          style_priority?: number
          updated_at?: string | null
          user_id?: string | null
          weather_condition?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
