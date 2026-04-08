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
          active_topic: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
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
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
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
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
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
