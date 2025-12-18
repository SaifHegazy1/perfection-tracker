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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      sessions: {
        Row: {
          attended: boolean | null
          created_at: string
          finish_time: string | null
          hw1_status: Database["public"]["Enums"]["hw_status"] | null
          hw2_status: Database["public"]["Enums"]["hw_status"] | null
          hw3_status: Database["public"]["Enums"]["hw_status"] | null
          hw4_status: Database["public"]["Enums"]["hw_status"] | null
          hw5_status: Database["public"]["Enums"]["hw_status"] | null
          hw6_status: Database["public"]["Enums"]["hw_status"] | null
          hw7_status: Database["public"]["Enums"]["hw_status"] | null
          hw8_status: Database["public"]["Enums"]["hw_status"] | null
          id: string
          payment: number | null
          quiz_mark: number | null
          session_number: number
          student_id: string
          time: string | null
          updated_at: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          finish_time?: string | null
          hw1_status?: Database["public"]["Enums"]["hw_status"] | null
          hw2_status?: Database["public"]["Enums"]["hw_status"] | null
          hw3_status?: Database["public"]["Enums"]["hw_status"] | null
          hw4_status?: Database["public"]["Enums"]["hw_status"] | null
          hw5_status?: Database["public"]["Enums"]["hw_status"] | null
          hw6_status?: Database["public"]["Enums"]["hw_status"] | null
          hw7_status?: Database["public"]["Enums"]["hw_status"] | null
          hw8_status?: Database["public"]["Enums"]["hw_status"] | null
          id?: string
          payment?: number | null
          quiz_mark?: number | null
          session_number: number
          student_id: string
          time?: string | null
          updated_at?: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          finish_time?: string | null
          hw1_status?: Database["public"]["Enums"]["hw_status"] | null
          hw2_status?: Database["public"]["Enums"]["hw_status"] | null
          hw3_status?: Database["public"]["Enums"]["hw_status"] | null
          hw4_status?: Database["public"]["Enums"]["hw_status"] | null
          hw5_status?: Database["public"]["Enums"]["hw_status"] | null
          hw6_status?: Database["public"]["Enums"]["hw_status"] | null
          hw7_status?: Database["public"]["Enums"]["hw_status"] | null
          hw8_status?: Database["public"]["Enums"]["hw_status"] | null
          id?: string
          payment?: number | null
          quiz_mark?: number | null
          session_number?: number
          student_id?: string
          time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      sheets: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_phone: string
          sheet_id: string
          student_code: string
          student_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_phone: string
          sheet_id: string
          student_code: string
          student_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_phone?: string
          sheet_id?: string
          student_code?: string
          student_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_sheet_id_fkey"
            columns: ["sheet_id"]
            isOneToOne: false
            referencedRelation: "sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_students: {
        Row: {
          id: string
          student_id: string
          user_id: string
        }
        Insert: {
          id?: string
          student_id: string
          user_id: string
        }
        Update: {
          id?: string
          student_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          id: string
          must_change_password: boolean | null
          phone_or_username: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          id?: string
          must_change_password?: boolean | null
          phone_or_username: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          id?: string
          must_change_password?: boolean | null
          phone_or_username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_for_login: {
        Args: { p_phone_or_username: string }
        Returns: {
          auth_id: string
          id: string
          must_change_password: boolean
          phone_or_username: string
        }[]
      }
      get_user_id: { Args: { _auth_id: string }; Returns: string }
      get_user_role_for_login: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "parent"
      hw_status: "complete" | "not_done" | "partial" | "cheated"
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
      app_role: ["admin", "parent"],
      hw_status: ["complete", "not_done", "partial", "cheated"],
    },
  },
} as const
