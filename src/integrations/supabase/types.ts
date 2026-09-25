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
      audit_events: {
        Row: {
          actor_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          organization_id: string | null
          subject_id: string
          subject_type: string
          summary: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          subject_id: string
          subject_type: string
          summary: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          subject_id?: string
          subject_type?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      nexus_consent_versions: {
        Row: {
          category_lines: Json
          consent_template: string
          created_at: string
          is_current: boolean
          version: string
        }
        Insert: {
          category_lines: Json
          consent_template: string
          created_at?: string
          is_current?: boolean
          version: string
        }
        Update: {
          category_lines?: Json
          consent_template?: string
          created_at?: string
          is_current?: boolean
          version?: string
        }
        Relationships: []
      }
      nexus_inquiries: {
        Row: {
          acknowledged_at: string
          category_id: string
          client_hash: string | null
          contact_consent_at: string
          created_at: string
          description: string
          disclosure_version: string
          email: string
          email_hash: string
          full_name: string
          id: string
          is_test: boolean
          location: string | null
          phone: string | null
          source: string
          status: string
          triage_role: string
          updated_at: string
        }
        Insert: {
          acknowledged_at: string
          category_id: string
          client_hash?: string | null
          contact_consent_at: string
          created_at?: string
          description: string
          disclosure_version: string
          email: string
          email_hash: string
          full_name: string
          id?: string
          is_test?: boolean
          location?: string | null
          phone?: string | null
          source?: string
          status?: string
          triage_role?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string
          category_id?: string
          client_hash?: string | null
          contact_consent_at?: string
          created_at?: string
          description?: string
          disclosure_version?: string
          email?: string
          email_hash?: string
          full_name?: string
          id?: string
          is_test?: boolean
          location?: string | null
          phone?: string | null
          source?: string
          status?: string
          triage_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_inquiries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_inquiry_assignments: {
        Row: {
          assigned_by: string
          assignee_id: string
          created_at: string
          id: string
          inquiry_id: string
          purpose: string
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          assigned_by: string
          assignee_id: string
          created_at?: string
          id?: string
          inquiry_id: string
          purpose: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          assigned_by?: string
          assignee_id?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          purpose?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nexus_inquiry_assignments_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "nexus_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_introduction_events: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: Json
          event: string
          id: string
          introduction_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          event: string
          id?: string
          introduction_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: Json
          event?: string
          id?: string
          introduction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_introduction_events_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "nexus_introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      nexus_introductions: {
        Row: {
          authorized_at: string | null
          category_id: string
          consent_payload: Json | null
          consent_payload_hash: string | null
          consent_text: string | null
          consent_version: string | null
          created_at: string
          decided_at: string | null
          id: string
          inquiry_id: string
          last_send_error: string | null
          partner_name: string
          partner_notice_at: string | null
          partner_notice_attempts: number
          partner_notice_status: string | null
          partner_profile_id: string
          partner_user_id: string
          proposed_at: string
          proposed_by: string
          selected_fields: string[]
          send_attempts: number
          sent_at: string | null
          sent_by: string | null
          sent_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          authorized_at?: string | null
          category_id: string
          consent_payload?: Json | null
          consent_payload_hash?: string | null
          consent_text?: string | null
          consent_version?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          inquiry_id: string
          last_send_error?: string | null
          partner_name: string
          partner_notice_at?: string | null
          partner_notice_attempts?: number
          partner_notice_status?: string | null
          partner_profile_id: string
          partner_user_id: string
          proposed_at?: string
          proposed_by: string
          selected_fields?: string[]
          send_attempts?: number
          sent_at?: string | null
          sent_by?: string | null
          sent_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          authorized_at?: string | null
          category_id?: string
          consent_payload?: Json | null
          consent_payload_hash?: string | null
          consent_text?: string | null
          consent_version?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          inquiry_id?: string
          last_send_error?: string | null
          partner_name?: string
          partner_notice_at?: string | null
          partner_notice_attempts?: number
          partner_notice_status?: string | null
          partner_profile_id?: string
          partner_user_id?: string
          proposed_at?: string
          proposed_by?: string
          selected_fields?: string[]
          send_attempts?: number
          sent_at?: string | null
          sent_by?: string | null
          sent_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_introductions_consent_version_fkey"
            columns: ["consent_version"]
            isOneToOne: false
            referencedRelation: "nexus_consent_versions"
            referencedColumns: ["version"]
          },
          {
            foreignKeyName: "nexus_introductions_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "nexus_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nexus_introductions_partner_profile_id_fkey"
            columns: ["partner_profile_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opx_references: {
        Row: {
          created_at: string
          merged_into: number | null
          number: number
          organization_id: string | null
          partner_application_id: string | null
        }
        Insert: {
          created_at?: string
          merged_into?: number | null
          number?: number
          organization_id?: string | null
          partner_application_id?: string | null
        }
        Update: {
          created_at?: string
          merged_into?: number | null
          number?: number
          organization_id?: string | null
          partner_application_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opx_references_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "opx_references"
            referencedColumns: ["number"]
          },
          {
            foreignKeyName: "opx_references_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opx_references_partner_application_id_fkey"
            columns: ["partner_application_id"]
            isOneToOne: true
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          added_by: string
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          application_kind: string
          city: string | null
          created_at: string
          id: string
          license_jurisdiction: string | null
          license_number: string | null
          onboarding_step: string | null
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
          application_kind?: string
          city?: string | null
          created_at?: string
          id?: string
          license_jurisdiction?: string | null
          license_number?: string | null
          onboarding_step?: string | null
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
          application_kind?: string
          city?: string | null
          created_at?: string
          id?: string
          license_jurisdiction?: string | null
          license_number?: string | null
          onboarding_step?: string | null
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
      partner_intro_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          introduction_id: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          introduction_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          introduction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_intro_notes_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "nexus_introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_intro_state: {
        Row: {
          follow_up: boolean
          introduction_id: string
          read_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          follow_up?: boolean
          introduction_id: string
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          follow_up?: boolean
          introduction_id?: string
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_intro_state_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "nexus_introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_licenses: {
        Row: {
          application_id: string
          created_at: string
          expires_on: string | null
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
          expires_on?: string | null
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
          expires_on?: string | null
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
      partner_profile_revisions: {
        Row: {
          application_id: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          organization_name: string
          professional_summary: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_areas: string[]
          state_region: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          organization_name?: string
          professional_summary?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[]
          state_region?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          organization_name?: string
          professional_summary?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[]
          state_region?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_profile_revisions_application_id_fkey"
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
          is_suspended: boolean
          organization_name: string
          partner_type_id: string | null
          professional_summary: string
          professional_type: string
          profile_review_status: string
          profile_reviewed_at: string | null
          profile_reviewed_by: string | null
          service_areas: string[]
          state_region: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_published?: boolean
          is_suspended?: boolean
          organization_name: string
          partner_type_id?: string | null
          professional_summary?: string
          professional_type: string
          profile_review_status?: string
          profile_reviewed_at?: string | null
          profile_reviewed_by?: string | null
          service_areas?: string[]
          state_region?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_published?: boolean
          is_suspended?: boolean
          organization_name?: string
          partner_type_id?: string | null
          professional_summary?: string
          professional_type?: string
          profile_review_status?: string
          profile_reviewed_at?: string | null
          profile_reviewed_by?: string | null
          service_areas?: string[]
          state_region?: string | null
          suspension_reason?: string | null
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
      partner_review_decisions: {
        Row: {
          applicant_message: string | null
          application_id: string
          created_at: string
          decision: string
          id: string
          reviewer_id: string
          subject_id: string
          subject_label: string | null
          subject_type: string
        }
        Insert: {
          applicant_message?: string | null
          application_id: string
          created_at?: string
          decision: string
          id?: string
          reviewer_id: string
          subject_id: string
          subject_label?: string | null
          subject_type: string
        }
        Update: {
          applicant_message?: string | null
          application_id?: string
          created_at?: string
          decision?: string
          id?: string
          reviewer_id?: string
          subject_id?: string
          subject_label?: string | null
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_review_decisions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
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
      partner_review_internal_notes: {
        Row: {
          application_id: string
          author_id: string
          created_at: string
          decision_id: string | null
          id: string
          note: string
        }
        Insert: {
          application_id: string
          author_id: string
          created_at?: string
          decision_id?: string | null
          id?: string
          note: string
        }
        Update: {
          application_id?: string
          author_id?: string
          created_at?: string
          decision_id?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_review_internal_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_review_internal_notes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "partner_review_decisions"
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
          agreement_reference: string | null
          agreement_status: string
          application_id: string
          audiences: string[]
          authority_evidence_detail: string | null
          authority_evidence_method: string | null
          authority_review_status: string
          authority_verified: boolean
          campus_or_program: string | null
          carriers_markets: string | null
          created_at: string
          geographic_reach: string | null
          industries: string[]
          introduction_method: string | null
          languages: string[]
          org_public_consent: boolean
          rep_public_consent: boolean
          representative_authorized: boolean
          representative_email: string | null
          representative_name: string
          representative_phone: string | null
          representative_title: string | null
          response_time: string | null
          segments_served: string[]
          service_areas: string[]
          track: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agreement_reference?: string | null
          agreement_status?: string
          application_id: string
          audiences?: string[]
          authority_evidence_detail?: string | null
          authority_evidence_method?: string | null
          authority_review_status?: string
          authority_verified?: boolean
          campus_or_program?: string | null
          carriers_markets?: string | null
          created_at?: string
          geographic_reach?: string | null
          industries?: string[]
          introduction_method?: string | null
          languages?: string[]
          org_public_consent?: boolean
          rep_public_consent?: boolean
          representative_authorized?: boolean
          representative_email?: string | null
          representative_name: string
          representative_phone?: string | null
          representative_title?: string | null
          response_time?: string | null
          segments_served?: string[]
          service_areas?: string[]
          track: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agreement_reference?: string | null
          agreement_status?: string
          application_id?: string
          audiences?: string[]
          authority_evidence_detail?: string | null
          authority_evidence_method?: string | null
          authority_review_status?: string
          authority_verified?: boolean
          campus_or_program?: string | null
          carriers_markets?: string | null
          created_at?: string
          geographic_reach?: string | null
          industries?: string[]
          introduction_method?: string | null
          languages?: string[]
          org_public_consent?: boolean
          rep_public_consent?: boolean
          representative_authorized?: boolean
          representative_email?: string | null
          representative_name?: string
          representative_phone?: string | null
          representative_title?: string | null
          response_time?: string | null
          segments_served?: string[]
          service_areas?: string[]
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
      partner_type_preview_access: {
        Row: {
          created_at: string
          granted_by: string
          note: string | null
          partner_type_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          note?: string | null
          partner_type_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          note?: string | null
          partner_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_type_preview_access_partner_type_id_fkey"
            columns: ["partner_type_id"]
            isOneToOne: false
            referencedRelation: "service_partner_types"
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
      release_records: {
        Row: {
          activated_at: string
          activated_by: string
          authorized_by: string
          created_at: string
          effect_backend: string
          effect_live_site: string
          effect_preview: string
          feature_key: string
          id: string
          test_result: string
          title: string
        }
        Insert: {
          activated_at: string
          activated_by: string
          authorized_by: string
          created_at?: string
          effect_backend: string
          effect_live_site: string
          effect_preview: string
          feature_key: string
          id?: string
          test_result: string
          title: string
        }
        Update: {
          activated_at?: string
          activated_by?: string
          authorized_by?: string
          created_at?: string
          effect_backend?: string
          effect_live_site?: string
          effect_preview?: string
          feature_key?: string
          id?: string
          test_result?: string
          title?: string
        }
        Relationships: []
      }
      service_catalog: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          catalog_version: number
          category_id: string
          client_label: string | null
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          partner_type: string
          qualification_note: string | null
          required_lines: string[] | null
          retired_at: string | null
          search_aliases: string[]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_version?: number
          category_id: string
          client_label?: string | null
          created_at?: string
          description: string
          display_order?: number
          id: string
          is_active?: boolean
          label: string
          partner_type: string
          qualification_note?: string | null
          required_lines?: string[] | null
          retired_at?: string | null
          search_aliases?: string[]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_version?: number
          category_id?: string
          client_label?: string | null
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          partner_type?: string
          qualification_note?: string | null
          required_lines?: string[] | null
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
      site_content_blocks: {
        Row: {
          created_at: string
          key: string
          kind: string
          label: string
          pages: string[]
          published_version_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          key: string
          kind?: string
          label: string
          pages?: string[]
          published_version_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          key?: string
          kind?: string
          label?: string
          pages?: string[]
          published_version_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_content_versions: {
        Row: {
          author_id: string | null
          block_key: string
          body: Json
          change_summary: string
          created_at: string
          id: string
          published_at: string | null
          published_by: string | null
          status: string
          version: number
        }
        Insert: {
          author_id?: string | null
          block_key: string
          body: Json
          change_summary: string
          created_at?: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          status?: string
          version: number
        }
        Update: {
          author_id?: string | null
          block_key?: string
          body?: Json
          change_summary?: string
          created_at?: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_content_versions_block_key_fkey"
            columns: ["block_key"]
            isOneToOne: false
            referencedRelation: "site_content_blocks"
            referencedColumns: ["key"]
          },
        ]
      }
      staff_access_grants: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string
          id: string
          organization_id: string
          revoked_at: string | null
          scope: string
          staff_user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by: string
          id?: string
          organization_id: string
          revoked_at?: string | null
          scope?: string
          staff_user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          organization_id?: string
          revoked_at?: string | null
          scope?: string
          staff_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_access_grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      admin_add_catalog_choice: {
        Args: {
          _aliases: string[]
          _category: string
          _description: string
          _id: string
          _label: string
        }
        Returns: undefined
      }
      admin_introduction_counts: { Args: never; Returns: Json }
      admin_merge_opx: {
        Args: { _keep: number; _retire: number }
        Returns: undefined
      }
      admin_move_catalog_choice: {
        Args: { _direction: number; _id: string }
        Returns: undefined
      }
      admin_search_opx: {
        Args: { _q: string }
        Returns: {
          created_at: string
          kind: string
          merged_into: string
          name: string
          reference: string
          status: string
        }[]
      }
      admin_set_catalog_retired: {
        Args: { _id: string; _retired: boolean }
        Returns: undefined
      }
      admin_update_catalog_choice: {
        Args: {
          _aliases: string[]
          _client_label: string
          _description: string
          _id: string
        }
        Returns: undefined
      }
      application_type_id: { Args: { _application: string }; Returns: string }
      assert_can_edit_type: {
        Args: { _type: string; _uid: string }
        Returns: undefined
      }
      assign_nexus_inquiry: {
        Args: {
          _assignee_email: string
          _enabled: boolean
          _inquiry: string
          _purpose: string
        }
        Returns: undefined
      }
      authorize_nexus_introduction: {
        Args: { _fields: string[]; _intro: string; _version: string }
        Returns: undefined
      }
      begin_nexus_notice_retry: { Args: { _intro: string }; Returns: string }
      can_access_organization: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      can_register_type: {
        Args: { _type: string; _uid: string }
        Returns: boolean
      }
      can_view_nexus_inquiry: {
        Args: { _inquiry: string; _user: string }
        Returns: boolean
      }
      cancel_nexus_introduction: {
        Args: { _intro: string }
        Returns: undefined
      }
      company_history_view: {
        Args: { _organization_id: string }
        Returns: {
          actor: string
          created_at: string
          details: Json
          event_type: string
          id: string
          organization_id: string
          summary: string
        }[]
      }
      company_member_people: {
        Args: { _organization_id: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
      content_assert_admin: { Args: never; Returns: string }
      content_validate: { Args: { _body: Json }; Returns: undefined }
      create_company_workspace: { Args: { _name: string }; Returns: string }
      decline_nexus_introduction: {
        Args: { _intro: string }
        Returns: undefined
      }
      founder_nexus_requests: { Args: never; Returns: Json }
      has_active_staff_grant: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_staff_role: {
        Args: { _roles?: string[]; _user_id: string }
        Returns: boolean
      }
      insurance_offered_states: {
        Args: { _geography: string; _user: string }
        Returns: string[]
      }
      insurance_service_licensed:
        | { Args: { _service: string; _user: string }; Returns: boolean }
        | {
            Args: { _service: string; _states: string[]; _user: string }
            Returns: boolean
          }
      listing_type_is_public: {
        Args: { _type: string; _user: string }
        Returns: boolean
      }
      nexus_build_payload: {
        Args: { _fields: string[]; _inquiry: string; _partner_name: string }
        Returns: Json
      }
      nexus_can_manage_inquiry: {
        Args: { _inquiry: string; _user: string }
        Returns: boolean
      }
      nexus_founder_email: { Args: never; Returns: string }
      nexus_founder_owns: { Args: { _intro: string }; Returns: boolean }
      nexus_intro_candidates: {
        Args: { _inquiry: string }
        Returns: {
          organization_name: string
          profile_id: string
        }[]
      }
      nexus_intro_event: {
        Args: { _detail?: Json; _event: string; _intro: string }
        Returns: undefined
      }
      nexus_is_test_email: { Args: { _email: string }; Returns: boolean }
      nexus_member_directory: {
        Args: never
        Returns: {
          category_ids: string[]
          category_labels: string[]
          city: string
          display_name: string
          organization_name: string
          professional_summary: string
          profile_id: string
          service_areas: string[]
          state_region: string
        }[]
      }
      nexus_partner_eligible: {
        Args: { _category: string; _is_test: boolean; _profile: string }
        Returns: boolean
      }
      open_nexus_inquiry: {
        Args: { _inquiry: string }
        Returns: {
          acknowledged_at: string
          category_id: string
          client_hash: string | null
          contact_consent_at: string
          created_at: string
          description: string
          disclosure_version: string
          email: string
          email_hash: string
          full_name: string
          id: string
          is_test: boolean
          location: string | null
          phone: string | null
          source: string
          status: string
          triage_role: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "nexus_inquiries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      opx_format: { Args: { _n: number }; Returns: string }
      organization_role: {
        Args: { _organization_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["organization_member_role"]
      }
      partner_nexus_introductions: {
        Args: never
        Returns: {
          id: string
          payload: Json
          sent_at: string
        }[]
      }
      partner_owns_intro: { Args: { _intro: string }; Returns: boolean }
      partner_type_is_open: { Args: { _type: string }; Returns: boolean }
      preview_nexus_send: { Args: { _intro: string }; Returns: Json }
      profile_is_public: { Args: { _user: string }; Returns: boolean }
      propose_nexus_introduction: {
        Args: { _inquiry: string; _profile: string }
        Returns: string
      }
      public_partner_representatives: {
        Args: never
        Returns: {
          representative_name: string
          representative_title: string
          user_id: string
        }[]
      }
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
      publish_content_version: {
        Args: { _version: string }
        Returns: undefined
      }
      published_site_content: {
        Args: { _keys: string[] }
        Returns: {
          body: Json
          key: string
          version: number
        }[]
      }
      record_nexus_partner_notice: {
        Args: { _intro: string; _status: string }
        Returns: undefined
      }
      rename_company_workspace: {
        Args: { _name: string; _organization_id: string }
        Returns: undefined
      }
      restore_content_version: {
        Args: { _summary: string; _version: string }
        Returns: string
      }
      save_content_draft: {
        Args: { _body: Json; _key: string; _summary: string }
        Returns: string
      }
      send_nexus_introduction: {
        Args: { _hash: string; _intro: string }
        Returns: Json
      }
      set_nexus_inquiry_status: {
        Args: { _inquiry: string; _status: string }
        Returns: undefined
      }
      set_organization_member: {
        Args: { _organization_id: string; _role: string; _user_id: string }
        Returns: undefined
      }
      set_organization_member_by_email: {
        Args: { _email: string; _organization_id: string; _role: string }
        Returns: undefined
      }
      set_staff_access_by_email: {
        Args: {
          _email: string
          _enabled: boolean
          _expires_at?: string
          _organization_id: string
        }
        Returns: undefined
      }
      set_staff_access_grant: {
        Args: {
          _enabled: boolean
          _expires_at?: string
          _organization_id: string
          _staff_user_id: string
        }
        Returns: undefined
      }
      set_staff_role: {
        Args: { _enabled: boolean; _role: string; _user_id: string }
        Returns: undefined
      }
      staff_nexus_introductions: { Args: { _inquiry: string }; Returns: Json }
      submit_nexus_inquiry: {
        Args: {
          _category: string
          _client_hash: string
          _description: string
          _disclosure_version: string
          _email: string
          _full_name: string
          _location: string
          _phone: string
        }
        Returns: string
      }
      submit_nexus_inquiry_keyed: {
        Args: {
          _category: string
          _client_key: string
          _description: string
          _disclosure_version: string
          _email: string
          _email_key: string
          _full_name: string
          _location: string
          _phone: string
        }
        Returns: string
      }
      type_evidence_ok: {
        Args: { _application: string; _type: string }
        Returns: boolean
      }
      type_id_for_label: { Args: { _label: string }; Returns: string }
      unpublish_content_block: { Args: { _key: string }; Returns: undefined }
      withdraw_nexus_introduction: {
        Args: { _intro: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "applicant"
        | "partner"
        | "admin"
        | "operations_lead"
        | "compliance_coordinator"
      credential_status: "pending" | "verified" | "rejected"
      organization_member_role: "owner" | "member" | "viewer"
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
      app_role: [
        "applicant",
        "partner",
        "admin",
        "operations_lead",
        "compliance_coordinator",
      ],
      credential_status: ["pending", "verified", "rejected"],
      organization_member_role: ["owner", "member", "viewer"],
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
