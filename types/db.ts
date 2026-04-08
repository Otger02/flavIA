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
          content: string;
          created_at: string;
          id: string;
          role: "system" | "user" | "assistant";
          session_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          role: "system" | "user" | "assistant";
          session_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          role?: "system" | "user" | "assistant";
          session_id?: string;
          user_id?: string;
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
      chat_failure_metrics: {
        Row: {
          created_at: string;
          error_code: string;
          error_message: string;
          id: string;
          session_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_code: string;
          error_message: string;
          id?: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_code?: string;
          error_message?: string;
          id?: string;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_failure_metrics_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          active_topic: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          created_at: string;
          id: string;
          status: "active" | "archived";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          created_at?: string;
          id?: string;
          status?: "active" | "archived";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          created_at?: string;
          id?: string;
          status?: "active" | "archived";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      content_items: {
        Row: {
          description: string;
          href: string;
          id: string;
          score: number | null;
          title: string;
          topic_tags: string[] | null;
        };
        Insert: {
          description: string;
          href: string;
          id?: string;
          score?: number | null;
          title: string;
          topic_tags?: string[] | null;
        };
        Update: {
          description?: string;
          href?: string;
          id?: string;
          score?: number | null;
          title?: string;
          topic_tags?: string[] | null;
        };
        Relationships: [];
      };
      product_items: {
        Row: {
          description: string;
          href: string;
          id: string;
          name: string;
          score: number | null;
          topic_tags: string[] | null;
        };
        Insert: {
          description: string;
          href: string;
          id?: string;
          name: string;
          score?: number | null;
          topic_tags?: string[] | null;
        };
        Update: {
          description?: string;
          href?: string;
          id?: string;
          name?: string;
          score?: number | null;
          topic_tags?: string[] | null;
        };
        Relationships: [];
      };
      recommendation_logs: {
        Row: {
          active_topic: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          clicked_at: string | null;
          created_at: string;
          id: string;
          item_id: string;
          item_type: "content" | "product";
          session_id: string;
          user_id: string;
        };
        Insert: {
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          clicked_at?: string | null;
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: "content" | "product";
          session_id: string;
          user_id: string;
        };
        Update: {
          active_topic?: "desire" | "couple_connection" | "self_connection" | "communication" | "body_confidence" | "routine" | "curiosity" | null;
          clicked_at?: string | null;
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: "content" | "product";
          session_id?: string;
          user_id?: string;
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
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          plan: "free" | "pro" | "premium";
          status: "inactive" | "trialing" | "active" | "past_due" | "canceled";
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          plan?: "free" | "pro" | "premium";
          status?: "inactive" | "trialing" | "active" | "past_due" | "canceled";
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          plan?: "free" | "pro" | "premium";
          status?: "inactive" | "trialing" | "active" | "past_due" | "canceled";
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
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