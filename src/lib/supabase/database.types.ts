export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_ai_reports: {
        Row: {
          coach_summary: string
          created_at: string
          id: string
          nutrition_score: number
          overall_score: number
          parsed_json: Json
          profile_snapshot: Json | null
          prompt_markdown: string
          raw_response: string
          report_date: string
          user_id: string
          workout_score: number
        }
        Insert: {
          coach_summary: string
          created_at?: string
          id?: string
          nutrition_score: number
          overall_score: number
          parsed_json: Json
          profile_snapshot?: Json | null
          prompt_markdown: string
          raw_response: string
          report_date: string
          user_id: string
          workout_score: number
        }
        Update: {
          coach_summary?: string
          created_at?: string
          id?: string
          nutrition_score?: number
          overall_score?: number
          parsed_json?: Json
          profile_snapshot?: Json | null
          prompt_markdown?: string
          raw_response?: string
          report_date?: string
          user_id?: string
          workout_score?: number
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          created_at: string
          id: string
          logged_on: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          raw_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_on: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          raw_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_on?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          raw_text?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          biological_sex: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          height_cm: number | null
          id: string
          onboarding_completed_at: string | null
          primary_goal: string | null
          protein_target_g: number | null
          target_weight_kg: number | null
          training_frequency: string | null
          units_preference: string
          updated_at: string
        }
        Insert: {
          activity_level?: string | null
          biological_sex?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          height_cm?: number | null
          id: string
          onboarding_completed_at?: string | null
          primary_goal?: string | null
          protein_target_g?: number | null
          target_weight_kg?: number | null
          training_frequency?: string | null
          units_preference?: string
          updated_at?: string
        }
        Update: {
          activity_level?: string | null
          biological_sex?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          height_cm?: number | null
          id?: string
          onboarding_completed_at?: string | null
          primary_goal?: string | null
          protein_target_g?: number | null
          target_weight_kg?: number | null
          training_frequency?: string | null
          units_preference?: string
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          captured_on: string
          created_at: string
          id: string
          storage_path: string
          user_id: string
          view_type: string
        }
        Insert: {
          captured_on: string
          created_at?: string
          id?: string
          storage_path: string
          user_id: string
          view_type: string
        }
        Update: {
          captured_on?: string
          created_at?: string
          id?: string
          storage_path?: string
          user_id?: string
          view_type?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          id: string
          target_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes: number
          id?: string
          target_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          target_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          created_at: string
          date: string
          glass_count: number
          glass_size_ml: number
          id: string
          target_glasses: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          glass_count?: number
          glass_size_ml?: number
          id?: string
          target_glasses?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          glass_count?: number
          glass_size_ml?: number
          id?: string
          target_glasses?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          measured_on: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_on: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_on?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          id: string
          logged_on: string
          raw_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_on: string
          raw_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_on?: string
          raw_text?: string
          user_id?: string
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
      meal_type: "breakfast" | "lunch" | "snacks" | "dinner"
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
    Enums: {
      meal_type: ["breakfast", "lunch", "snacks", "dinner"],
    },
  },
} as const
