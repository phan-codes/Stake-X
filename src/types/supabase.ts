export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          wallet_address: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          wallet_address?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          wallet_address?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          portfolio_id: string | null;
          type: string;
          asset: string;
          amount: number;
          status: string;
          receipt_image: string | null;
          plan_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          portfolio_id?: string | null;
          type: string;
          asset: string;
          amount: number;
          status: string;
          receipt_image?: string | null;
          plan_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          portfolio_id?: string | null;
          type?: string;
          asset?: string;
          amount?: number;
          status?: string;
          receipt_image?: string | null;
          plan_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      balances: {
        Row: {
          id: string;
          user_id: string;
          asset: string;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset: string;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset?: string;
          balance?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      investment_plans: {
        Row: {
          id: string;
          name: string;
          min_amount: number;
          max_amount: number;
          duration_days: number;
          daily_roi: number;
          total_roi: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          min_amount: number;
          max_amount: number;
          duration_days: number;
          daily_roi: number;
          total_roi: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          min_amount?: number;
          max_amount?: number;
          duration_days?: number;
          daily_roi?: number;
          total_roi?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          amount: number;
          status: string;
          start_date: string;
          end_date: string;
          next_payout: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          amount: number;
          status: string;
          start_date: string;
          end_date: string;
          next_payout: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          amount?: number;
          status?: string;
          start_date?: string;
          end_date?: string;
          next_payout?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          asset: string;
          address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset: string;
          address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset?: string;
          address?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      connected_wallets: {
        Row: {
          id: string;
          user_id: string;
          wallet_type: string;
          address: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_type: string;
          address: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_type?: string;
          address?: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
