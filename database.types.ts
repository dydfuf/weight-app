export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      equipment: {
        Row: {
          created_at: string;
          id: string;
          is_loadable: boolean;
          is_machine: boolean;
          name: string;
          notes: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_loadable?: boolean;
          is_machine?: boolean;
          name: string;
          notes?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_loadable?: boolean;
          is_machine?: boolean;
          name?: string;
          notes?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      exercise_equipment: {
        Row: {
          details: string | null;
          equipment_id: string;
          exercise_id: string;
          is_required: boolean;
        };
        Insert: {
          details?: string | null;
          equipment_id: string;
          exercise_id: string;
          is_required?: boolean;
        };
        Update: {
          details?: string | null;
          equipment_id?: string;
          exercise_id?: string;
          is_required?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_equipment_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_equipment_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_movement_patterns: {
        Row: {
          exercise_id: string;
          movement_pattern_id: string;
        };
        Insert: {
          exercise_id: string;
          movement_pattern_id: string;
        };
        Update: {
          exercise_id?: string;
          movement_pattern_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_movement_patterns_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_movement_patterns_movement_pattern_id_fkey";
            columns: ["movement_pattern_id"];
            isOneToOne: false;
            referencedRelation: "movement_patterns";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_muscle_targets: {
        Row: {
          exercise_id: string;
          importance: number;
          muscle_group_id: string;
          role: Database["public"]["Enums"]["muscle_role"];
        };
        Insert: {
          exercise_id: string;
          importance?: number;
          muscle_group_id: string;
          role?: Database["public"]["Enums"]["muscle_role"];
        };
        Update: {
          exercise_id?: string;
          importance?: number;
          muscle_group_id?: string;
          role?: Database["public"]["Enums"]["muscle_role"];
        };
        Relationships: [
          {
            foreignKeyName: "exercise_muscle_targets_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_muscle_targets_muscle_group_id_fkey";
            columns: ["muscle_group_id"];
            isOneToOne: false;
            referencedRelation: "muscle_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_relations: {
        Row: {
          from_exercise_id: string;
          note: string | null;
          relation_type: Database["public"]["Enums"]["exercise_relation_type"];
          to_exercise_id: string;
        };
        Insert: {
          from_exercise_id: string;
          note?: string | null;
          relation_type: Database["public"]["Enums"]["exercise_relation_type"];
          to_exercise_id: string;
        };
        Update: {
          from_exercise_id?: string;
          note?: string | null;
          relation_type?: Database["public"]["Enums"]["exercise_relation_type"];
          to_exercise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_relations_from_exercise_id_fkey";
            columns: ["from_exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_relations_to_exercise_id_fkey";
            columns: ["to_exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_tags: {
        Row: {
          exercise_id: string;
          tag_id: string;
        };
        Insert: {
          exercise_id: string;
          tag_id: string;
        };
        Update: {
          exercise_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_tags_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          coaching_cues: Json;
          common_mistakes: Json;
          created_at: string;
          created_by: string;
          description: string | null;
          difficulty: Database["public"]["Enums"]["difficulty_level"];
          external_links: Json;
          id: string;
          instruction_steps: Json;
          mechanic: Database["public"]["Enums"]["mechanic_type"];
          media: Json;
          name: string;
          plane: Database["public"]["Enums"]["plane_of_motion"];
          recommended_reps: unknown | null;
          recommended_sets: number | null;
          safety_notes: string | null;
          search_tsv: unknown | null;
          slug: string;
          synonyms: string[];
          tempo: string | null;
          unilateral: boolean;
          updated_at: string;
          visibility: Database["public"]["Enums"]["exercise_visibility"];
        };
        Insert: {
          coaching_cues?: Json;
          common_mistakes?: Json;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          external_links?: Json;
          id?: string;
          instruction_steps?: Json;
          mechanic?: Database["public"]["Enums"]["mechanic_type"];
          media?: Json;
          name: string;
          plane?: Database["public"]["Enums"]["plane_of_motion"];
          recommended_reps?: unknown | null;
          recommended_sets?: number | null;
          safety_notes?: string | null;
          search_tsv?: unknown | null;
          slug: string;
          synonyms?: string[];
          tempo?: string | null;
          unilateral?: boolean;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["exercise_visibility"];
        };
        Update: {
          coaching_cues?: Json;
          common_mistakes?: Json;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          external_links?: Json;
          id?: string;
          instruction_steps?: Json;
          mechanic?: Database["public"]["Enums"]["mechanic_type"];
          media?: Json;
          name?: string;
          plane?: Database["public"]["Enums"]["plane_of_motion"];
          recommended_reps?: unknown | null;
          recommended_sets?: number | null;
          safety_notes?: string | null;
          search_tsv?: unknown | null;
          slug?: string;
          synonyms?: string[];
          tempo?: string | null;
          unilateral?: boolean;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["exercise_visibility"];
        };
        Relationships: [];
      };
      movement_patterns: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      muscle_groups: {
        Row: {
          body_region: string | null;
          created_at: string;
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
        };
        Insert: {
          body_region?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          parent_id?: string | null;
          slug: string;
        };
        Update: {
          body_region?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          parent_id?: string | null;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "muscle_groups_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "muscle_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_sets: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          percent_of: Database["public"]["Enums"]["reference_lift"] | null;
          percent_value: number | null;
          planned_workout_id: string;
          rpe: number | null;
          target_reps: number;
          target_sets: number;
          target_weight_kg: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          percent_of?: Database["public"]["Enums"]["reference_lift"] | null;
          percent_value?: number | null;
          planned_workout_id: string;
          rpe?: number | null;
          target_reps: number;
          target_sets: number;
          target_weight_kg?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          percent_of?: Database["public"]["Enums"]["reference_lift"] | null;
          percent_value?: number | null;
          planned_workout_id?: string;
          rpe?: number | null;
          target_reps?: number;
          target_sets?: number;
          target_weight_kg?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_sets_exercise_fk";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planned_sets_planned_workout_id_fkey";
            columns: ["planned_workout_id"];
            isOneToOne: false;
            referencedRelation: "planned_workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_workouts: {
        Row: {
          created_at: string;
          id: string;
          planned_for: string;
          status: Database["public"]["Enums"]["workout_status"];
          title: string;
          updated_at: string;
          user_id: string;
          user_program_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          planned_for: string;
          status?: Database["public"]["Enums"]["workout_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
          user_program_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          planned_for?: string;
          status?: Database["public"]["Enums"]["workout_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
          user_program_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "planned_workouts_user_program_id_fkey";
            columns: ["user_program_id"];
            isOneToOne: false;
            referencedRelation: "user_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          nickname: string;
          target_weight: number | null;
          unit: Database["public"]["Enums"]["weight_unit"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nickname: string;
          target_weight?: number | null;
          unit?: Database["public"]["Enums"]["weight_unit"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nickname?: string;
          target_weight?: number | null;
          unit?: Database["public"]["Enums"]["weight_unit"];
          updated_at?: string;
        };
        Relationships: [];
      };
      program_templates: {
        Row: {
          created_at: string;
          days_per_week: number;
          description: string | null;
          id: string;
          key: string;
          name: string;
          template_json: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          days_per_week: number;
          description?: string | null;
          id?: string;
          key: string;
          name: string;
          template_json?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          days_per_week?: number;
          description?: string | null;
          id?: string;
          key?: string;
          name?: string;
          template_json?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      user_maxes: {
        Row: {
          bench_kg: number | null;
          bodyweight_kg: number | null;
          deadlift_kg: number | null;
          ohp_kg: number | null;
          source: Database["public"]["Enums"]["max_source"];
          squat_kg: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bench_kg?: number | null;
          bodyweight_kg?: number | null;
          deadlift_kg?: number | null;
          ohp_kg?: number | null;
          source?: Database["public"]["Enums"]["max_source"];
          squat_kg?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          bench_kg?: number | null;
          bodyweight_kg?: number | null;
          deadlift_kg?: number | null;
          ohp_kg?: number | null;
          source?: Database["public"]["Enums"]["max_source"];
          squat_kg?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_programs: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          start_date: string;
          status: Database["public"]["Enums"]["program_status"];
          template_key: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["program_status"];
          template_key?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["program_status"];
          template_key?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_programs_template_key_fkey";
            columns: ["template_key"];
            isOneToOne: false;
            referencedRelation: "program_templates";
            referencedColumns: ["key"];
          },
        ];
      };
      weights: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          recorded_at: string;
          updated_at: string;
          user_id: string;
          weight_kg: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          recorded_at: string;
          updated_at?: string;
          user_id?: string;
          weight_kg: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          recorded_at?: string;
          updated_at?: string;
          user_id?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
      workout_sets: {
        Row: {
          created_at: string;
          exercise: string;
          id: string;
          reps: number;
          rpe: number | null;
          updated_at: string;
          weight_kg: number;
          workout_id: string;
        };
        Insert: {
          created_at?: string;
          exercise: string;
          id?: string;
          reps: number;
          rpe?: number | null;
          updated_at?: string;
          weight_kg: number;
          workout_id: string;
        };
        Update: {
          created_at?: string;
          exercise?: string;
          id?: string;
          reps?: number;
          rpe?: number | null;
          updated_at?: string;
          weight_kg?: number;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          performed_at: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          performed_at: string;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          performed_at?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_read_exercise: {
        Args: { ex_id: string };
        Returns: boolean;
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      owns_exercise: {
        Args: { ex_id: string };
        Returns: boolean;
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
    };
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced";
      exercise_relation_type:
        | "variation"
        | "progression"
        | "regression"
        | "alternate"
        | "contraindicated_for";
      exercise_visibility: "public" | "private";
      max_source: "user" | "estimate";
      mechanic_type: "compound" | "isolation";
      muscle_role: "primary" | "secondary" | "synergist" | "stabilizer";
      plane_of_motion: "sagittal" | "frontal" | "transverse" | "multi";
      program_status: "active" | "paused" | "archived";
      reference_lift: "squat" | "bench" | "deadlift" | "ohp";
      weight_unit: "kg" | "lb";
      workout_status: "planned" | "in_progress" | "done" | "skipped";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["beginner", "intermediate", "advanced"],
      exercise_relation_type: [
        "variation",
        "progression",
        "regression",
        "alternate",
        "contraindicated_for",
      ],
      exercise_visibility: ["public", "private"],
      max_source: ["user", "estimate"],
      mechanic_type: ["compound", "isolation"],
      muscle_role: ["primary", "secondary", "synergist", "stabilizer"],
      plane_of_motion: ["sagittal", "frontal", "transverse", "multi"],
      program_status: ["active", "paused", "archived"],
      reference_lift: ["squat", "bench", "deadlift", "ohp"],
      weight_unit: ["kg", "lb"],
      workout_status: ["planned", "in_progress", "done", "skipped"],
    },
  },
} as const;
