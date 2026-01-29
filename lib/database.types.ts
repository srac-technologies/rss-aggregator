export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      curated_article_sources: {
        Row: {
          created_at: string | null
          curated_article_id: string
          id: string
          news_id: number
          relevance_score: number | null
          selection_reason: string | null
        }
        Insert: {
          created_at?: string | null
          curated_article_id: string
          id?: string
          news_id: number
          relevance_score?: number | null
          selection_reason?: string | null
        }
        Update: {
          created_at?: string | null
          curated_article_id?: string
          id?: string
          news_id?: number
          relevance_score?: number | null
          selection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curated_article_sources_curated_article_id_fkey"
            columns: ["curated_article_id"]
            isOneToOne: false
            referencedRelation: "curated_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_article_sources_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_article_sources_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "rss_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_articles: {
        Row: {
          agent_setting_id: string | null
          content: string
          created_at: string | null
          id: string
          llm_tokens_used: number | null
          magazine_id: string
          processing_duration_ms: number | null
          published_at: string | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_setting_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          llm_tokens_used?: number | null
          magazine_id: string
          processing_duration_ms?: number | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_setting_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          llm_tokens_used?: number | null
          magazine_id?: string
          processing_duration_ms?: number | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curated_articles_agent_setting_id_fkey"
            columns: ["agent_setting_id"]
            isOneToOne: false
            referencedRelation: "curation_agent_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_articles_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
        ]
      }
      curation_agent_settings: {
        Row: {
          created_at: string | null
          curation_prompt: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          llm_model: string | null
          llm_provider: string | null
          magazine_id: string
          name: string
          next_run_at: string | null
          run_frequency: string | null
          selection_prompt: string
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curation_prompt: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          llm_model?: string | null
          llm_provider?: string | null
          magazine_id: string
          name: string
          next_run_at?: string | null
          run_frequency?: string | null
          selection_prompt: string
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curation_prompt?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          llm_model?: string | null
          llm_provider?: string | null
          magazine_id?: string
          name?: string
          next_run_at?: string | null
          run_frequency?: string | null
          selection_prompt?: string
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curation_agent_settings_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curation_agent_settings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rss_feed"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "curation_agent_settings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      curation_runs: {
        Row: {
          agent_setting_id: string
          articles_accepted: number | null
          articles_evaluated: number | null
          articles_rejected: number | null
          completed_at: string | null
          created_at: string | null
          curated_article_id: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          llm_tokens_used: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          agent_setting_id: string
          articles_accepted?: number | null
          articles_evaluated?: number | null
          articles_rejected?: number | null
          completed_at?: string | null
          created_at?: string | null
          curated_article_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          llm_tokens_used?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          agent_setting_id?: string
          articles_accepted?: number | null
          articles_evaluated?: number | null
          articles_rejected?: number | null
          completed_at?: string | null
          created_at?: string | null
          curated_article_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          llm_tokens_used?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curation_runs_agent_setting_id_fkey"
            columns: ["agent_setting_id"]
            isOneToOne: false
            referencedRelation: "curation_agent_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curation_runs_curated_article_id_fkey"
            columns: ["curated_article_id"]
            isOneToOne: false
            referencedRelation: "curated_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      magazines: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          auto_tagged: boolean | null
          collected_at: string | null
          content: string | null
          created_at: string
          guid: string
          id: number
          parent: string | null
          source_id: number | null
          tagged_at: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          auto_tagged?: boolean | null
          collected_at?: string | null
          content?: string | null
          created_at?: string
          guid: string
          id?: number
          parent?: string | null
          source_id?: number | null
          tagged_at?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          auto_tagged?: boolean | null
          collected_at?: string | null
          content?: string | null
          created_at?: string
          guid?: string
          id?: number
          parent?: string | null
          source_id?: number | null
          tagged_at?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_collection_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_collection_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          error_stack: string | null
          id: number
          items_fetched: number | null
          items_new: number | null
          items_skipped: number | null
          llm_tokens_used: number | null
          source_id: number
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: number
          items_fetched?: number | null
          items_new?: number | null
          items_skipped?: number | null
          llm_tokens_used?: number | null
          source_id: number
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: number
          items_fetched?: number | null
          items_new?: number | null
          items_skipped?: number | null
          llm_tokens_used?: number | null
          source_id?: number
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_collection_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_collection_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_collection_sources: {
        Row: {
          auto_tag_enabled: boolean | null
          collection_frequency: string | null
          created_at: string
          id: number
          is_active: boolean | null
          last_collected_at: string | null
          last_error: string | null
          llm_model: string | null
          llm_provider: string | null
          name: string
          next_collection_at: string | null
          rss_url: string | null
          tavily_days: number | null
          tavily_query: string | null
          tavily_search_depth: string | null
          total_items_collected: number | null
          type: string
          updated_at: string
        }
        Insert: {
          auto_tag_enabled?: boolean | null
          collection_frequency?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          last_collected_at?: string | null
          last_error?: string | null
          llm_model?: string | null
          llm_provider?: string | null
          name: string
          next_collection_at?: string | null
          rss_url?: string | null
          tavily_days?: number | null
          tavily_query?: string | null
          tavily_search_depth?: string | null
          total_items_collected?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          auto_tag_enabled?: boolean | null
          collection_frequency?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          last_collected_at?: string | null
          last_error?: string | null
          llm_model?: string | null
          llm_provider?: string | null
          name?: string
          next_collection_at?: string | null
          rss_url?: string | null
          tavily_days?: number | null
          tavily_query?: string | null
          tavily_search_depth?: string | null
          total_items_collected?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_tags: {
        Row: {
          created_at: string
          id: number
          news_id: number | null
          tag_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          news_id?: number | null
          tag_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          news_id?: number | null
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "rss_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_sends: {
        Row: {
          created_at: string
          email_provider_id: string | null
          error_message: string | null
          html_content: string
          id: number
          llm_tokens_used: number | null
          news_count: number
          news_ids: number[]
          newsletter_settings_id: number
          processing_duration_ms: number | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          subscription_id: string
          summary_content: string | null
          view_count: number | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          email_provider_id?: string | null
          error_message?: string | null
          html_content: string
          id?: number
          llm_tokens_used?: number | null
          news_count?: number
          news_ids?: number[]
          newsletter_settings_id: number
          processing_duration_ms?: number | null
          recipient_email: string
          sent_at?: string
          status?: string
          subject: string
          subscription_id: string
          summary_content?: string | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          email_provider_id?: string | null
          error_message?: string | null
          html_content?: string
          id?: number
          llm_tokens_used?: number | null
          news_count?: number
          news_ids?: number[]
          newsletter_settings_id?: number
          processing_duration_ms?: number | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          subscription_id?: string
          summary_content?: string | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_newsletter_settings_id_fkey"
            columns: ["newsletter_settings_id"]
            isOneToOne: false
            referencedRelation: "newsletter_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_sends_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rss_feed"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "newsletter_sends_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_settings: {
        Row: {
          created_at: string
          filter_prompt: string
          frequency: string
          id: number
          is_active: boolean | null
          llm_model: string | null
          llm_provider: string | null
          recipient_email: string
          send_day_of_week: number | null
          send_time: string | null
          sender_name: string | null
          subject_template: string | null
          subscription_id: string
          summary_prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          filter_prompt: string
          frequency?: string
          id?: number
          is_active?: boolean | null
          llm_model?: string | null
          llm_provider?: string | null
          recipient_email: string
          send_day_of_week?: number | null
          send_time?: string | null
          sender_name?: string | null
          subject_template?: string | null
          subscription_id: string
          summary_prompt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          filter_prompt?: string
          frequency?: string
          id?: number
          is_active?: boolean | null
          llm_model?: string | null
          llm_provider?: string | null
          recipient_email?: string
          send_day_of_week?: number | null
          send_time?: string | null
          sender_name?: string | null
          subject_template?: string | null
          subscription_id?: string
          summary_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_settings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "rss_feed"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "newsletter_settings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          description: string | null
          has_newsletter: boolean | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          has_newsletter?: boolean | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          has_newsletter?: boolean | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      subscriptions_tags: {
        Row: {
          created_at: string
          id: number
          subscription_id: string | null
          tag_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          subscription_id?: string | null
          tag_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          subscription_id?: string | null
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rss_feed"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "subscriptions_tags_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: number
          tag: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          tag?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          tag?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      rss_feed: {
        Row: {
          content: string | null
          created_at: string | null
          guid: string | null
          id: number | null
          parent: string | null
          subscription_id: string | null
          tagged_at: string | null
          title: string | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_next_collection_time: {
        Args: { frequency: string; from_time?: string }
        Returns: string
      }
      get_curated_article_with_sources: {
        Args: { p_curated_article_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          magazine_id: string
          published_at: string
          source_news_ids: number[]
          source_news_titles: string[]
          status: string
          summary: string
          title: string
        }[]
      }
      get_magazine_articles: {
        Args: {
          p_limit?: number
          p_magazine_id: string
          p_offset?: number
          p_status?: string
        }
        Returns: {
          created_at: string
          id: string
          published_at: string
          source_count: number
          status: string
          summary: string
          title: string
        }[]
      }
      get_rss_feed: {
        Args: { p_limit?: number; p_offset?: number; p_subscription_id: string }
        Returns: {
          content: string
          created_at: string
          guid: string
          id: number
          parent: string
          subscription_id: string
          tagged_at: string
          title: string
          url: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

