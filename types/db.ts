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
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: "system" | "user" | "assistant";
          content: string;
          message_type: string;
          active_topic_snapshot: string | null;
          help_mode_snapshot: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          role: "system" | "user" | "assistant";
          content: string;
          message_type?: string;
          active_topic_snapshot?: string | null;
          help_mode_snapshot?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          role?: "system" | "user" | "assistant";
          content?: string;
          message_type?: string;
          active_topic_snapshot?: string | null;
          help_mode_snapshot?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          entry_source: string | null;
          entry_topic: string | null;
          active_topic: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | "jealousy" | "boundaries" | "pleasure" | "menopause" | "erectile_dysfunction" | "education" | null;
          help_mode: string | null;
          message_count: number;
          free_messages_used: number;
          hit_paywall: boolean;
          converted_after_session: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at?: string;
          ended_at?: string | null;
          entry_source?: string | null;
          entry_topic?: string | null;
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | "jealousy" | "boundaries" | "pleasure" | "menopause" | "erectile_dysfunction" | "education" | null;
          help_mode?: string | null;
          message_count?: number;
          free_messages_used?: number;
          hit_paywall?: boolean;
          converted_after_session?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          entry_source?: string | null;
          entry_topic?: string | null;
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | "jealousy" | "boundaries" | "pleasure" | "menopause" | "erectile_dysfunction" | "education" | null;
          help_mode?: string | null;
          message_count?: number;
          free_messages_used?: number;
          hit_paywall?: boolean;
          converted_after_session?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          preferred_language: string;
          onboarding_completed: boolean;
          relationship_status: string | null;
          pronouns: string | null;
          plan_status: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          relationship_status?: string | null;
          pronouns?: string | null;
          plan_status?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          relationship_status?: string | null;
          pronouns?: string | null;
          plan_status?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_items: {
        Row: {
          id: string;
          sanity_document_id: string | null;
          slug: string;
          title: string;
          excerpt: string;
          cover_image_url: string | null;
          content_type: string;
          topic_tags: string[] | null;
          intent_tags: string[] | null;
          is_premium: boolean;
          is_active: boolean;
          priority: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sanity_document_id?: string | null;
          slug: string;
          title: string;
          excerpt: string;
          cover_image_url?: string | null;
          content_type: string;
          topic_tags?: string[] | null;
          intent_tags?: string[] | null;
          is_premium: boolean;
          is_active: boolean;
          priority?: number | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sanity_document_id?: string | null;
          slug?: string;
          title?: string;
          excerpt?: string;
          cover_image_url?: string | null;
          content_type?: string;
          topic_tags?: string[] | null;
          intent_tags?: string[] | null;
          is_premium?: boolean;
          is_active?: boolean;
          priority?: number | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_items: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          image_url: string | null;
          external_url: string | null;
          brand_name: string | null;
          topic_tags: string[] | null;
          intent_tags: string[] | null;
          product_type: string | null;
          is_active: boolean;
          priority: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          image_url?: string | null;
          external_url?: string | null;
          brand_name?: string | null;
          topic_tags?: string[] | null;
          intent_tags?: string[] | null;
          product_type?: string | null;
          is_active: boolean;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          external_url?: string | null;
          brand_name?: string | null;
          topic_tags?: string[] | null;
          intent_tags?: string[] | null;
          product_type?: string | null;
          is_active?: boolean;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recommendation_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          item_type: "content" | "product";
          item_id: string;
          active_topic: string | null;
          clicked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          item_type: "content" | "product";
          item_id: string;
          active_topic?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          item_type?: "content" | "product";
          item_id?: string;
          active_topic?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendation_logs_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_type?: string;
          item_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_feedback: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_stories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          is_anonymous: boolean;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          is_anonymous?: boolean;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          is_anonymous?: boolean;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };
      community_threads: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          body: string;
          topic: string | null;
          is_anonymous: boolean;
          status: "published" | "hidden" | "removed";
          is_pinned: boolean;
          reply_count: number;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title: string;
          body: string;
          topic?: string | null;
          is_anonymous?: boolean;
          status?: "published" | "hidden" | "removed";
          is_pinned?: boolean;
          reply_count?: number;
          last_activity_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          title?: string;
          body?: string;
          topic?: string | null;
          is_anonymous?: boolean;
          status?: "published" | "hidden" | "removed";
          is_pinned?: boolean;
          reply_count?: number;
          last_activity_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_threads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_comments: {
        Row: {
          id: string;
          user_id: string;
          target_type: "thread" | "library_item" | "story";
          target_id: string;
          parent_comment_id: string | null;
          content: string;
          is_anonymous: boolean;
          status: "published" | "hidden" | "removed";
          is_flavia_ai: boolean;
          is_official_reply: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "thread" | "library_item" | "story";
          target_id: string;
          parent_comment_id?: string | null;
          content: string;
          is_anonymous?: boolean;
          status?: "published" | "hidden" | "removed";
          is_flavia_ai?: boolean;
          is_official_reply?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_type?: "thread" | "library_item" | "story";
          target_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          is_anonymous?: boolean;
          status?: "published" | "hidden" | "removed";
          is_flavia_ai?: boolean;
          is_official_reply?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: "thread" | "comment" | "story";
          target_id: string;
          reason: "spam" | "harassment" | "misinformation" | "off_topic" | "inappropriate" | "other";
          detail: string | null;
          status: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by: string | null;
          reviewed_at: string | null;
          action_taken: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: "thread" | "comment" | "story";
          target_id: string;
          reason: "spam" | "harassment" | "misinformation" | "off_topic" | "inappropriate" | "other";
          detail?: string | null;
          status?: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          action_taken?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: "thread" | "comment" | "story";
          target_id?: string;
          reason?: "spam" | "harassment" | "misinformation" | "off_topic" | "inappropriate" | "other";
          detail?: string | null;
          status?: "pending" | "reviewed" | "actioned" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          action_taken?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_moderation_log: {
        Row: {
          id: string;
          content_type: "thread" | "comment" | "story";
          content_id: string;
          decision: "approved" | "flagged" | "rejected";
          confidence: number | null;
          reason: string | null;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_type: "thread" | "comment" | "story";
          content_id: string;
          decision: "approved" | "flagged" | "rejected";
          confidence?: number | null;
          reason?: string | null;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_type?: "thread" | "comment" | "story";
          content_id?: string;
          decision?: "approved" | "flagged" | "rejected";
          confidence?: number | null;
          reason?: string | null;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meta_integrations: {
        Row: {
          id: string;
          user_id: string;
          meta_user_id: string;
          instagram_business_account_id: string | null;
          facebook_page_id: string | null;
          facebook_page_name: string | null;
          access_token: string;
          token_expires_at: string | null;
          granted_scopes: string[];
          last_refreshed_at: string | null;
          status: "active" | "revoked" | "expired" | "error";
          error_details: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meta_user_id: string;
          instagram_business_account_id?: string | null;
          facebook_page_id?: string | null;
          facebook_page_name?: string | null;
          access_token: string;
          token_expires_at?: string | null;
          granted_scopes?: string[];
          last_refreshed_at?: string | null;
          status?: "active" | "revoked" | "expired" | "error";
          error_details?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meta_user_id?: string;
          instagram_business_account_id?: string | null;
          facebook_page_id?: string | null;
          facebook_page_name?: string | null;
          access_token?: string;
          token_expires_at?: string | null;
          granted_scopes?: string[];
          last_refreshed_at?: string | null;
          status?: "active" | "revoked" | "expired" | "error";
          error_details?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      professional_verifications: {
        Row: {
          id: string;
          user_id: string;
          professional_type: "psychologist" | "sexologist" | "doctor";
          specialty: string | null;
          full_legal_name: string;
          license_number: string;
          license_country: string;
          bio: string | null;
          linkedin_url: string | null;
          website_url: string | null;
          document_storage_paths: string[];
          archived_document_paths: string[];
          status: "pending" | "approved" | "rejected" | "revoked";
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          approved_display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          professional_type: "psychologist" | "sexologist" | "doctor";
          specialty?: string | null;
          full_legal_name: string;
          license_number: string;
          license_country: string;
          bio?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          document_storage_paths?: string[];
          archived_document_paths?: string[];
          status?: "pending" | "approved" | "rejected" | "revoked";
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          approved_display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          professional_type?: "psychologist" | "sexologist" | "doctor";
          specialty?: string | null;
          full_legal_name?: string;
          license_number?: string;
          license_country?: string;
          bio?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          document_storage_paths?: string[];
          archived_document_paths?: string[];
          status?: "pending" | "approved" | "rejected" | "revoked";
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          approved_display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      professional_verification_audit: {
        Row: {
          id: string;
          verification_id: string;
          admin_user_id: string | null;
          action:
            | "submitted"
            | "approved"
            | "rejected"
            | "revoked"
            | "request_more_info"
            | "resubmitted";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          verification_id: string;
          admin_user_id?: string | null;
          action:
            | "submitted"
            | "approved"
            | "rejected"
            | "revoked"
            | "request_more_info"
            | "resubmitted";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          verification_id?: string;
          admin_user_id?: string | null;
          action?:
            | "submitted"
            | "approved"
            | "rejected"
            | "revoked"
            | "request_more_info"
            | "resubmitted";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      affiliate_recommendation_events: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          product_slug: string;
          event_type: "shown" | "clicked" | "dismissed";
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id: string;
          product_slug: string;
          event_type: "shown" | "clicked" | "dismissed";
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string;
          product_slug?: string;
          event_type?: "shown" | "clicked" | "dismissed";
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      book_purchases: {
        Row: {
          id: string;
          user_id: string;
          book_slug: string;
          stripe_session_id: string;
          stripe_payment_intent_id: string | null;
          amount_cop: number;
          purchased_at: string;
          refunded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_slug: string;
          stripe_session_id: string;
          stripe_payment_intent_id?: string | null;
          amount_cop: number;
          purchased_at?: string;
          refunded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_slug?: string;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string | null;
          amount_cop?: number;
          purchased_at?: string;
          refunded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_slug: "free" | "pro" | "plus";
          status: string;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_slug?: "free" | "pro" | "plus";
          status?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_slug?: "free" | "pro" | "plus";
          status?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
