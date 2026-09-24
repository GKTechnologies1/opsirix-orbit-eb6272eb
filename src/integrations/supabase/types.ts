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
      partner_licenses: {
        Row: {
          application_id: string
          created_at: string
          id: string
          license_number: string
          line_of_authority: string
          producer_id: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          state_code: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          license_number: string
          line_of_authority: string
          producer_id?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_code: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          license_number?: string
          line_of_authority?: string
          producer_id?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_licenses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_listing_types: {
        Row: {
          application_id: string
          created_at: string
          id: string
          partner_type_id: string
          review_note: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          partner_type_id: string
          review_note?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          partner_type_id?: string
          review_note?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_listing_types_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_listing_types_partner_type_id_fkey"
            columns: ["partner_type_id"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
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
          partner_type_id: string | null
          professional_summary: string
          professional_type: string
          profile_review_status: string
          profile_reviewed_at: string | null
          profile_reviewed_by: string | null
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
          partner_type_id?: string | null
          professional_summary?: string
          professional_type: string
          profile_review_status?: string
          profile_reviewed_at?: string | null
          profile_reviewed_by?: string | null
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
          partner_type_id?: string | null
          professional_summary?: string
          professional_type?: string
          profile_review_status?: string
          profile_reviewed_at?: string | null
          profile_reviewed_by?: string | null
          service_areas?: string[]
          state_region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_profiles_partner_type_id_fkey"
            columns: ["partner_type_id"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
        ]
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
      partner_service_selections: {
        Row: {
          accepting_inquiries: boolean
          application_id: string | null
          client_types: string | null
          created_at: string
          delivery_mode:
            | Database["public"]["Enums"]["service_delivery_mode"]
            | null
          engagement: Database["public"]["Enums"]["service_engagement"] | null
          geography: string | null
          id: string
          industries: string | null
          is_featured: boolean
          offering_description: string | null
          partner_type: string
          price_max: number | null
          price_min: number | null
          pricing: Database["public"]["Enums"]["service_pricing"] | null
          professional_jurisdiction: string | null
          qualification_verified: boolean
          responsible_professional: string | null
          review_status: string
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepting_inquiries?: boolean
          application_id?: string | null
          client_types?: string | null
          created_at?: string
          delivery_mode?:
            | Database["public"]["Enums"]["service_delivery_mode"]
            | null
          engagement?: Database["public"]["Enums"]["service_engagement"] | null
          geography?: string | null
          id?: string
          industries?: string | null
          is_featured?: boolean
          offering_description?: string | null
          partner_type: string
          price_max?: number | null
          price_min?: number | null
          pricing?: Database["public"]["Enums"]["service_pricing"] | null
          professional_jurisdiction?: string | null
          qualification_verified?: boolean
          responsible_professional?: string | null
          review_status?: string
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepting_inquiries?: boolean
          application_id?: string | null
          client_types?: string | null
          created_at?: string
          delivery_mode?:
            | Database["public"]["Enums"]["service_delivery_mode"]
            | null
          engagement?: Database["public"]["Enums"]["service_engagement"] | null
          geography?: string | null
          id?: string
          industries?: string | null
          is_featured?: boolean
          offering_description?: string | null
          partner_type?: string
          price_max?: number | null
          price_min?: number | null
          pricing?: Database["public"]["Enums"]["service_pricing"] | null
          professional_jurisdiction?: string | null
          qualification_verified?: boolean
          responsible_professional?: string | null
          review_status?: string
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_service_selections_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_selections_partner_type_fkey"
            columns: ["partner_type"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_selections_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_service_suggestions: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          label: string
          partner_type: string
          resulting_service_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["service_suggestion_status"]
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          label: string
          partner_type: string
          resulting_service_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["service_suggestion_status"]
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          label?: string
          partner_type?: string
          resulting_service_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["service_suggestion_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_service_suggestions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_suggestions_partner_type_fkey"
            columns: ["partner_type"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_suggestions_resulting_service_id_fkey"
            columns: ["resulting_service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_track_details: {
        Row: {
          application_id: string
          audiences: string[]
          authority_verified: boolean
          campus_or_program: string | null
          carriers_markets: string | null
          created_at: string
          geographic_reach: string | null
          introduction_method: string | null
          languages: string[]
          representative_authorized: boolean
          representative_email: string | null
          representative_name: string
          representative_title: string | null
          segments_served: string[]
          track: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          audiences?: string[]
          authority_verified?: boolean
          campus_or_program?: string | null
          carriers_markets?: string | null
          created_at?: string
          geographic_reach?: string | null
          introduction_method?: string | null
          languages?: string[]
          representative_authorized?: boolean
          representative_email?: string | null
          representative_name: string
          representative_title?: string | null
          segments_served?: string[]
          track: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          audiences?: string[]
          authority_verified?: boolean
          campus_or_program?: string | null
          carriers_markets?: string | null
          created_at?: string
          geographic_reach?: string | null
          introduction_method?: string | null
          languages?: string[]
          representative_authorized?: boolean
          representative_email?: string | null
          representative_name?: string
          representative_title?: string | null
          segments_served?: string[]
          track?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_track_details_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
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
      service_catalog: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          catalog_version: number
          category_id: string
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          partner_type: string
          qualification_note: string | null
          retired_at: string | null
          search_aliases: string[]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_version?: number
          category_id: string
          created_at?: string
          description: string
          display_order?: number
          id: string
          is_active?: boolean
          label: string
          partner_type: string
          qualification_note?: string | null
          retired_at?: string | null
          search_aliases?: string[]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_version?: number
          category_id?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          partner_type?: string
          qualification_note?: string | null
          retired_at?: string | null
          search_aliases?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_partner_type_fkey"
            columns: ["partner_type"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog_changes: {
        Row: {
          catalog_version: number
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_label: string | null
          previous_label: string | null
          service_id: string
        }
        Insert: {
          catalog_version: number
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_label?: string | null
          previous_label?: string | null
          service_id: string
        }
        Update: {
          catalog_version?: number
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_label?: string | null
          previous_label?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_changes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          display_order: number
          id: string
          is_active: boolean
          is_prominent: boolean
          label: string
          partner_type: string
        }
        Insert: {
          display_order?: number
          id: string
          is_active?: boolean
          is_prominent?: boolean
          label: string
          partner_type: string
        }
        Update: {
          display_order?: number
          id?: string
          is_active?: boolean
          is_prominent?: boolean
          label?: string
          partner_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_partner_type_fkey"
            columns: ["partner_type"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_partner_types: {
        Row: {
          display_order: number
          id: string
          is_active: boolean
          is_open_for_registration: boolean
          label: string
          short_description: string | null
          track: string
        }
        Insert: {
          display_order?: number
          id: string
          is_active?: boolean
          is_open_for_registration?: boolean
          label: string
          short_description?: string | null
          track?: string
        }
        Update: {
          display_order?: number
          id?: string
          is_active?: boolean
          is_open_for_registration?: boolean
          label?: string
          short_description?: string | null
          track?: string
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
      listing_type_is_public: {
        Args: { _type: string; _user: string }
        Returns: boolean
      }
      partner_type_is_open: { Args: { _type: string }; Returns: boolean }
      profile_is_public: { Args: { _user: string }; Returns: boolean }
      public_partner_services: {
        Args: never
        Returns: {
          accepting_inquiries: boolean
          is_featured: boolean
          label: string
          offering_description: string
          partner_type: string
          service_id: string
          user_id: string
        }[]
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
      service_delivery_mode: "remote" | "in_person" | "both"
      service_engagement: "project" | "ongoing" | "both"
      service_pricing: "starting_price" | "price_range" | "custom_quote"
      service_suggestion_status: "pending" | "approved" | "declined"
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
      service_delivery_mode: ["remote", "in_person", "both"],
      service_engagement: ["project", "ongoing", "both"],
      service_pricing: ["starting_price", "price_range", "custom_quote"],
      service_suggestion_status: ["pending", "approved", "declined"],
    },
  },
} as const
