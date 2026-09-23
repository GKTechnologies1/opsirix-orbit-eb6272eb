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
      discovery_call_submissions: {
        Row: {
          business_stage: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          preferred_contact_method: string | null
          preferred_meeting_time: string | null
          service_interest: string | null
          source_page: string
          status: string
          updated_at: string | null
          user_agent: string | null
          website: string | null
        }
        Insert: {
          business_stage?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_meeting_time?: string | null
          service_interest?: string | null
          source_page?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
          website?: string | null
        }
        Update: {
          business_stage?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_meeting_time?: string | null
          service_interest?: string | null
          source_page?: string
          status?: string
          updated_at?: string | null
          user_agent?: string | null
          website?: string | null
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          city: string | null
          created_at: string
          id: string
          license_jurisdiction: string | null
          license_number: string | null
          organization_name: string
          phone: string | null
          professional_summary: string
          professional_type: string
          referral_code: string | null
          service_areas: string[]
          state_region: string | null
          status: Database["public"]["Enums"]["partner_application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          license_jurisdiction?: string | null
          license_number?: string | null
          organization_name?: string
          phone?: string | null
          professional_summary?: string
          professional_type?: string
          referral_code?: string | null
          service_areas?: string[]
          state_region?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          license_jurisdiction?: string | null
          license_number?: string | null
          organization_name?: string
          phone?: string | null
          professional_summary?: string
          professional_type?: string
          referral_code?: string | null
          service_areas?: string[]
          state_region?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      partner_attributions: {
        Row: {
          application_id: string | null
          campaign_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          campaign_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          campaign_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_attributions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_attributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "partner_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_campaigns: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      partner_credentials: {
        Row: {
          application_id: string
          created_at: string
          credential_type: string
          id: string
          original_filename: string
          reviewed_at: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["credential_status"]
          storage_path: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          credential_type: string
          id?: string
          original_filename: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          storage_path: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          credential_type?: string
          id?: string
          original_filename?: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_credentials_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_profiles: {
        Row: {
          city: string | null
          created_at: string
          display_name: string
          id: string
          is_published: boolean
          organization_name: string
          professional_summary: string
          professional_type: string
          service_areas: string[]
          state_region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_published?: boolean
          organization_name: string
          professional_summary?: string
          professional_type: string
          service_areas?: string[]
          state_region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_published?: boolean
          organization_name?: string
          professional_summary?: string
          professional_type?: string
          service_areas?: string[]
          state_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_review_events: {
        Row: {
          application_id: string
          created_at: string
          from_status:
            | Database["public"]["Enums"]["partner_application_status"]
            | null
          id: string
          note: string | null
          reviewer_id: string
          to_status: Database["public"]["Enums"]["partner_application_status"]
        }
        Insert: {
          application_id: string
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["partner_application_status"]
            | null
          id?: string
          note?: string | null
          reviewer_id: string
          to_status: Database["public"]["Enums"]["partner_application_status"]
        }
        Update: {
          application_id?: string
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["partner_application_status"]
            | null
          id?: string
          note?: string | null
          reviewer_id?: string
          to_status?: Database["public"]["Enums"]["partner_application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "partner_review_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "applicant" | "partner" | "admin"
      credential_status: "pending" | "verified" | "rejected"
      partner_application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "changes_requested"
        | "approved"
        | "declined"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["applicant", "partner", "admin"],
      credential_status: ["pending", "verified", "rejected"],
      partner_application_status: [
        "draft",
        "submitted",
        "under_review",
        "changes_requested",
        "approved",
        "declined",
      ],
    },
  },
} as const
