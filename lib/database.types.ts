export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
        }
      }
      logos: {
        Row: {
          id: string
          user_id: string
          prompt: string
          svg_content: string
          is_favorite: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          svg_content: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          svg_content?: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      logo_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      logo_collection_items: {
        Row: {
          collection_id: string
          logo_id: string
          created_at: string
        }
        Insert: {
          collection_id: string
          logo_id: string
          created_at?: string
        }
        Update: {
          collection_id?: string
          logo_id?: string
          created_at?: string
        }
      }
      logo_generation_history: {
        Row: {
          id: string
          user_id: string
          prompt: string
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          status: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          status?: string
          error_message?: string | null
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
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
  }
}
