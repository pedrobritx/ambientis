export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      audit_events: {
        Row: {
          actor_id: string | null;
          id: number;
          occurred_at: string;
          operation: string;
          organization_id: string;
          record_id: string;
          record_version: number | null;
          table_name: string;
        };
        Insert: {
          actor_id?: string | null;
          id?: never;
          occurred_at?: string;
          operation: string;
          organization_id: string;
          record_id: string;
          record_version?: number | null;
          table_name: string;
        };
        Update: {
          actor_id?: string | null;
          id?: never;
          occurred_at?: string;
          operation?: string;
          organization_id?: string;
          record_id?: string;
          record_version?: number | null;
          table_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          archived_at: string | null;
          cnae: string | null;
          cnpj: string | null;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          sector: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          cnae?: string | null;
          cnpj?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          sector: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          cnae?: string | null;
          cnpj?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          sector?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "companies_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      company_contacts: {
        Row: {
          archived_at: string | null;
          company_id: string;
          created_at: string;
          created_by: string;
          email: string;
          id: string;
          name: string;
          organization_id: string;
          phone: string;
          position: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          company_id: string;
          created_at?: string;
          created_by?: string;
          email: string;
          id?: string;
          name: string;
          organization_id: string;
          phone?: string;
          position?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          email?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          phone?: string;
          position?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "company_contacts_organization_id_company_id_fkey";
            columns: ["organization_id", "company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "company_contacts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      document_requests: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by: string;
          due_date: string | null;
          facility_id: string;
          id: string;
          message: string;
          organization_id: string;
          process_id: string;
          requirement_id: string;
          status: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          due_date?: string | null;
          facility_id: string;
          id?: string;
          message: string;
          organization_id: string;
          process_id: string;
          requirement_id: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          due_date?: string | null;
          facility_id?: string;
          id?: string;
          message?: string;
          organization_id?: string;
          process_id?: string;
          requirement_id?: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "document_requests_organization_id_facility_id_process_id_r_fkey";
            columns: [
              "organization_id",
              "facility_id",
              "process_id",
              "requirement_id",
            ];
            isOneToOne: false;
            referencedRelation: "requirements";
            referencedColumns: [
              "organization_id",
              "facility_id",
              "process_id",
              "id",
            ];
          },
          {
            foreignKeyName: "document_requests_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      facilities: {
        Row: {
          archived_at: string | null;
          city: string;
          company_id: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          postcode: string | null;
          sector: string;
          state: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          city: string;
          company_id: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          postcode?: string | null;
          sector: string;
          state: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          city?: string;
          company_id?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          postcode?: string | null;
          sector?: string;
          state?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "facilities_organization_id_company_id_fkey";
            columns: ["organization_id", "company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "facilities_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      facility_access: {
        Row: {
          facility_id: string;
          organization_id: string;
          user_id: string;
        };
        Insert: {
          facility_id: string;
          organization_id: string;
          user_id: string;
        };
        Update: {
          facility_id?: string;
          organization_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "facility_access_organization_id_facility_id_fkey";
            columns: ["organization_id", "facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "facility_access_organization_id_user_id_fkey";
            columns: ["organization_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "organization_members";
            referencedColumns: ["organization_id", "user_id"];
          },
        ];
      };
      organization_members: {
        Row: {
          active: boolean;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      processes: {
        Row: {
          archived_at: string | null;
          created_at: string;
          created_by: string;
          facility_id: string;
          id: string;
          organization_id: string;
          reporting_period: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          facility_id: string;
          id?: string;
          organization_id: string;
          reporting_period: string;
          status?: string;
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          facility_id?: string;
          id?: string;
          organization_id?: string;
          reporting_period?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "processes_organization_id_facility_id_fkey";
            columns: ["organization_id", "facility_id"];
            isOneToOne: false;
            referencedRelation: "facilities";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "processes_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      requirements: {
        Row: {
          applicability: string;
          archived_at: string | null;
          created_at: string;
          created_by: string;
          description: string;
          exclusion_reason: string | null;
          facility_id: string;
          id: string;
          organization_id: string;
          process_id: string;
          shared_with_client: boolean;
          source: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          applicability?: string;
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          exclusion_reason?: string | null;
          facility_id: string;
          id?: string;
          organization_id: string;
          process_id: string;
          shared_with_client?: boolean;
          source?: string;
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          applicability?: string;
          archived_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          exclusion_reason?: string | null;
          facility_id?: string;
          id?: string;
          organization_id?: string;
          process_id?: string;
          shared_with_client?: boolean;
          source?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "requirements_organization_id_facility_id_process_id_fkey";
            columns: ["organization_id", "facility_id", "process_id"];
            isOneToOne: false;
            referencedRelation: "processes";
            referencedColumns: ["organization_id", "facility_id", "id"];
          },
          {
            foreignKeyName: "requirements_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bootstrap_organization: { Args: { title: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
