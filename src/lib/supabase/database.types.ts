type MealTypeEnum = "breakfast" | "lunch" | "snacks" | "dinner";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      food_logs: {
        Row: {
          id: string;
          meal_type: MealTypeEnum;
          raw_text: string;
          logged_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_type: MealTypeEnum;
          raw_text: string;
          logged_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_type?: MealTypeEnum;
          raw_text?: string;
          logged_on?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_logs: {
        Row: {
          id: string;
          raw_text: string;
          logged_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          raw_text: string;
          logged_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          raw_text?: string;
          logged_on?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_ai_reports: {
        Row: {
          id: string;
          report_date: string;
          prompt_markdown: string;
          raw_response: string;
          parsed_json: Json;
          nutrition_score: number;
          workout_score: number;
          overall_score: number;
          coach_summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_date: string;
          prompt_markdown: string;
          raw_response: string;
          parsed_json: Json;
          nutrition_score: number;
          workout_score: number;
          overall_score: number;
          coach_summary: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_date?: string;
          prompt_markdown?: string;
          raw_response?: string;
          parsed_json?: Json;
          nutrition_score?: number;
          workout_score?: number;
          overall_score?: number;
          coach_summary?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      meal_type: MealTypeEnum;
    };
    CompositeTypes: Record<string, never>;
  };
};
