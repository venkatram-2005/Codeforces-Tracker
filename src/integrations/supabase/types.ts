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
      app_settings: {
        Row: {
          auto_email_enabled: boolean | null
          created_at: string | null
          id: string
          inactivity_threshold_days: number | null
          last_sync: string | null
          sync_frequency: string | null
          sync_time: string | null
          updated_at: string | null
        }
        Insert: {
          auto_email_enabled?: boolean | null
          created_at?: string | null
          id?: string
          inactivity_threshold_days?: number | null
          last_sync?: string | null
          sync_frequency?: string | null
          sync_time?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_email_enabled?: boolean | null
          created_at?: string | null
          id?: string
          inactivity_threshold_days?: number | null
          last_sync?: string | null
          sync_frequency?: string | null
          sync_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contests: {
        Row: {
          contest_id: string
          created_at: string | null
          date: string
          id: string
          name: string
          new_rating: number | null
          problems_solved: number | null
          rank: number | null
          rating_change: number | null
          student_id: string | null
          total_problems: number | null
        }
        Insert: {
          contest_id: string
          created_at?: string | null
          date: string
          id?: string
          name: string
          new_rating?: number | null
          problems_solved?: number | null
          rank?: number | null
          rating_change?: number | null
          student_id?: string | null
          total_problems?: number | null
        }
        Update: {
          contest_id?: string
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          new_rating?: number | null
          problems_solved?: number | null
          rank?: number | null
          rating_change?: number | null
          student_id?: string | null
          total_problems?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          contest_id: string | null
          created_at: string | null
          id: string
          name: string
          problem_id: string
          rating: number | null
          solved_at: string
          student_id: string | null
          verdict: string | null
        }
        Insert: {
          contest_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          problem_id: string
          rating?: number | null
          solved_at: string
          student_id?: string | null
          verdict?: string | null
        }
        Update: {
          contest_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          problem_id?: string
          rating?: number | null
          solved_at?: string
          student_id?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "problems_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          codeforces_handle: string
          created_at: string | null
          current_rating: number | null
          email: string
          email_enabled: boolean | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          max_rating: number | null
          name: string
          phone: string | null
          reminder_emails_sent: number | null
          updated_at: string | null
        }
        Insert: {
          codeforces_handle: string
          created_at?: string | null
          current_rating?: number | null
          email: string
          email_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          max_rating?: number | null
          name: string
          phone?: string | null
          reminder_emails_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          codeforces_handle?: string
          created_at?: string | null
          current_rating?: number | null
          email?: string
          email_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          max_rating?: number | null
          name?: string
          phone?: string | null
          reminder_emails_sent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          contests_synced: number | null
          error_message: string | null
          id: string
          problems_synced: number | null
          status: string
          student_id: string | null
          sync_type: string
          synced_at: string | null
        }
        Insert: {
          contests_synced?: number | null
          error_message?: string | null
          id?: string
          problems_synced?: number | null
          status: string
          student_id?: string | null
          sync_type: string
          synced_at?: string | null
        }
        Update: {
          contests_synced?: number | null
          error_message?: string | null
          id?: string
          problems_synced?: number | null
          status?: string
          student_id?: string | null
          sync_type?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
