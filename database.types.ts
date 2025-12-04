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
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          content: string
          id: string
          is_active: boolean
          key: string
          studio_id: string
        }
        Insert: {
          content: string
          id: string
          is_active?: boolean
          key: string
          studio_id: string
        }
        Update: {
          content?: string
          id?: string
          is_active?: boolean
          key?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_prompts_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      ai_suggestions: {
        Row: {
          appointment_id: string | null
          content: string | null
          id: string
          message_id: string | null
          payload: Json | null
          score: number | null
          studio_id: string
          suggestion_type: string
        }
        Insert: {
          appointment_id?: string | null
          content?: string | null
          id: string
          message_id?: string | null
          payload?: Json | null
          score?: number | null
          studio_id: string
          suggestion_type: string
        }
        Update: {
          appointment_id?: string | null
          content?: string | null
          id?: string
          message_id?: string | null
          payload?: Json | null
          score?: number | null
          studio_id?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_suggestions_appointment_fk'
            columns: ['studio_id', 'appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'ai_suggestions_message_fk'
            columns: ['studio_id', 'message_id']
            isOneToOne: false
            referencedRelation: 'messages'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      appointments: {
        Row: {
          created_by: string
          currency: string
          customer_id: string
          ends_at: string
          id: string
          notes: string | null
          price_cents: number
          rescheduled_from_id: string | null
          service_id: string
          source: string | null
          staff_id: string
          starts_at: string
          status: Database['public']['Enums']['appointment_status']
          studio_id: string
        }
        Insert: {
          created_by: string
          currency: string
          customer_id: string
          ends_at: string
          id: string
          notes?: string | null
          price_cents: number
          rescheduled_from_id?: string | null
          service_id: string
          source?: string | null
          staff_id: string
          starts_at: string
          status?: Database['public']['Enums']['appointment_status']
          studio_id: string
        }
        Update: {
          created_by?: string
          currency?: string
          customer_id?: string
          ends_at?: string
          id?: string
          notes?: string | null
          price_cents?: number
          rescheduled_from_id?: string | null
          service_id?: string
          source?: string | null
          staff_id?: string
          starts_at?: string
          status?: Database['public']['Enums']['appointment_status']
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_created_by_fk'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_customer_fk'
            columns: ['studio_id', 'customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'appointments_rescheduled_from_fk'
            columns: ['studio_id', 'rescheduled_from_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'appointments_service_fk'
            columns: ['studio_id', 'service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'appointments_staff_fk'
            columns: ['studio_id', 'staff_id']
            isOneToOne: false
            referencedRelation: 'staff'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          changes: Json | null
          created_at: string
          id: number
          ip: unknown
          object_id: string | null
          object_type: string
          studio_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          changes?: Json | null
          created_at?: string
          id?: number
          ip?: unknown
          object_id?: string | null
          object_type: string
          studio_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          changes?: Json | null
          created_at?: string
          id?: number
          ip?: unknown
          object_id?: string | null
          object_type?: string
          studio_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_profile_fk'
            columns: ['actor_profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      customers: {
        Row: {
          consent_marketing: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          instagram_handle: string | null
          notes: string | null
          phone: string | null
          studio_id: string
        }
        Insert: {
          consent_marketing?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          instagram_handle?: string | null
          notes?: string | null
          phone?: string | null
          studio_id: string
        }
        Update: {
          consent_marketing?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          notes?: string | null
          phone?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customers_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      instagram_messages: {
        Row: {
          id: number
          instagram_id: string
          direction: string
          body: string | null
          raw: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          instagram_id: string
          direction: string
          body?: string | null
          raw?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          instagram_id?: string
          direction?: string
          body?: string | null
          raw?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: Json | null
          id: string
          name: string
          phone: string | null
          studio_id: string
        }
        Insert: {
          address?: Json | null
          id: string
          name: string
          phone?: string | null
          studio_id: string
        }
        Update: {
          address?: Json | null
          id?: string
          name?: string
          phone?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'locations_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      message_threads: {
        Row: {
          channel: Database['public']['Enums']['channel']
          customer_id: string
          external_ref: string | null
          id: string
          last_message_at: string | null
          status: Database['public']['Enums']['thread_status']
          studio_id: string
        }
        Insert: {
          channel: Database['public']['Enums']['channel']
          customer_id: string
          external_ref?: string | null
          id: string
          last_message_at?: string | null
          status?: Database['public']['Enums']['thread_status']
          studio_id: string
        }
        Update: {
          channel?: Database['public']['Enums']['channel']
          customer_id?: string
          external_ref?: string | null
          id?: string
          last_message_at?: string | null
          status?: Database['public']['Enums']['thread_status']
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'message_threads_customer_fk'
            columns: ['studio_id', 'customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          id: string
          read_at: string | null
          sender_profile_id: string | null
          sender_type: Database['public']['Enums']['message_sender']
          sent_at: string
          studio_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          id: string
          read_at?: string | null
          sender_profile_id?: string | null
          sender_type: Database['public']['Enums']['message_sender']
          sent_at?: string
          studio_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          id?: string
          read_at?: string | null
          sender_profile_id?: string | null
          sender_type?: Database['public']['Enums']['message_sender']
          sent_at?: string
          studio_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_sender_profile_fk'
            columns: ['sender_profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_thread_fk'
            columns: ['studio_id', 'thread_id']
            isOneToOne: false
            referencedRelation: 'message_threads'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_studio_id: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_studio_id?: string | null
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_studio_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_default_studio_fk'
            columns: ['default_studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      services: {
        Row: {
          active: boolean
          buffer_after_min: number
          buffer_before_min: number
          category: string | null
          color: string | null
          currency: string
          description: string | null
          duration_min: number
          id: string
          name: string
          price_cents: number
          studio_id: string
        }
        Insert: {
          active?: boolean
          buffer_after_min?: number
          buffer_before_min?: number
          category?: string | null
          color?: string | null
          currency: string
          description?: string | null
          duration_min: number
          id: string
          name: string
          price_cents: number
          studio_id: string
        }
        Update: {
          active?: boolean
          buffer_after_min?: number
          buffer_before_min?: number
          category?: string | null
          color?: string | null
          currency?: string
          description?: string | null
          duration_min?: number
          id?: string
          name?: string
          price_cents?: number
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'services_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      staff: {
        Row: {
          bio: string | null
          color: string | null
          display_name: string
          id: string
          is_bookable: boolean
          profile_id: string | null
          studio_id: string
        }
        Insert: {
          bio?: string | null
          color?: string | null
          display_name: string
          id: string
          is_bookable?: boolean
          profile_id?: string | null
          studio_id: string
        }
        Update: {
          bio?: string | null
          color?: string | null
          display_name?: string
          id?: string
          is_bookable?: boolean
          profile_id?: string | null
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_profile_fk'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'staff_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      staff_services: {
        Row: {
          active: boolean
          duration_min: number | null
          price_cents: number | null
          service_id: string
          staff_id: string
          studio_id: string
        }
        Insert: {
          active?: boolean
          duration_min?: number | null
          price_cents?: number | null
          service_id: string
          staff_id: string
          studio_id: string
        }
        Update: {
          active?: boolean
          duration_min?: number | null
          price_cents?: number | null
          service_id?: string
          staff_id?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_services_service_fk'
            columns: ['studio_id', 'service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'staff_services_staff_fk'
            columns: ['studio_id', 'staff_id']
            isOneToOne: false
            referencedRelation: 'staff'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      staff_time_off: {
        Row: {
          ends_at: string
          id: string
          reason: string | null
          staff_id: string
          starts_at: string
          studio_id: string
        }
        Insert: {
          ends_at: string
          id: string
          reason?: string | null
          staff_id: string
          starts_at: string
          studio_id: string
        }
        Update: {
          ends_at?: string
          id?: string
          reason?: string | null
          staff_id?: string
          starts_at?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_time_off_staff_fk'
            columns: ['studio_id', 'staff_id']
            isOneToOne: false
            referencedRelation: 'staff'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      staff_working_hours: {
        Row: {
          end_time: string
          id: string
          location_id: string | null
          staff_id: string
          start_time: string
          studio_id: string
          weekday: number
        }
        Insert: {
          end_time: string
          id: string
          location_id?: string | null
          staff_id: string
          start_time: string
          studio_id: string
          weekday: number
        }
        Update: {
          end_time?: string
          id?: string
          location_id?: string | null
          staff_id?: string
          start_time?: string
          studio_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'staff_working_hours_location_fk'
            columns: ['studio_id', 'location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['studio_id', 'id']
          },
          {
            foreignKeyName: 'staff_working_hours_staff_fk'
            columns: ['studio_id', 'staff_id']
            isOneToOne: false
            referencedRelation: 'staff'
            referencedColumns: ['studio_id', 'id']
          }
        ]
      }
      studio_hours: {
        Row: {
          close_time: string
          id: string
          open_time: string
          studio_id: string
          weekday: number
        }
        Insert: {
          close_time: string
          id: string
          open_time: string
          studio_id: string
          weekday: number
        }
        Update: {
          close_time?: string
          id?: string
          open_time?: string
          studio_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'studio_hours_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      studio_members: {
        Row: {
          is_active: boolean
          joined_at: string
          profile_id: string
          role: Database['public']['Enums']['member_role']
          studio_id: string
          title: string | null
        }
        Insert: {
          is_active?: boolean
          joined_at?: string
          profile_id: string
          role: Database['public']['Enums']['member_role']
          studio_id: string
          title?: string | null
        }
        Update: {
          is_active?: boolean
          joined_at?: string
          profile_id?: string
          role?: Database['public']['Enums']['member_role']
          studio_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'studio_members_profile_fk'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'studio_members_studio_fk'
            columns: ['studio_id']
            isOneToOne: false
            referencedRelation: 'studios'
            referencedColumns: ['id']
          }
        ]
      }
      studios: {
        Row: {
          created_at: string
          created_by: string
          default_currency: string
          id: string
          name: string
          slug: string
          timezone: string
        }
        Insert: {
          created_at?: string
          created_by: string
          default_currency: string
          id: string
          name: string
          slug: string
          timezone: string
        }
        Update: {
          created_at?: string
          created_by?: string
          default_currency?: string
          id?: string
          name?: string
          slug?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: 'studios_created_by_fk'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { p_studio_id: string }; Returns: boolean }
      is_member: { Args: { p_studio_id: string }; Returns: boolean }
    }
    Enums: {
      appointment_status:
        | 'requested'
        | 'confirmed'
        | 'checked_in'
        | 'completed'
        | 'cancelled'
        | 'no_show'
      channel: 'instagram' | 'internal'
      member_role: 'admin' | 'staff'
      message_sender: 'studio' | 'customer' | 'ai'
      thread_status: 'open' | 'snoozed' | 'closed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        'requested',
        'confirmed',
        'checked_in',
        'completed',
        'cancelled',
        'no_show',
      ],
      channel: ['instagram', 'internal'],
      member_role: ['admin', 'staff'],
      message_sender: ['studio', 'customer', 'ai'],
      thread_status: ['open', 'snoozed', 'closed'],
    },
  },
} as const
