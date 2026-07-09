type MealTypeEnum = "breakfast" | "lunch" | "snacks" | "dinner";

export type Database = {
  public: {
    Tables: {
      food_logs: {
        Row: {
          id: string;
          meal_type: MealTypeEnum;
          name: string;
          quantity: number;
          unit: string;
          calories: number;
          protein_grams: number;
          logged_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_type: MealTypeEnum;
          name: string;
          quantity: number;
          unit: string;
          calories: number;
          protein_grams: number;
          logged_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_type?: MealTypeEnum;
          name?: string;
          quantity?: number;
          unit?: string;
          calories?: number;
          protein_grams?: number;
          logged_on?: string;
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
