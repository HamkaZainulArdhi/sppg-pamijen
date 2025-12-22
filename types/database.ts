export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id_user: string;
          nama_lengkap: string;
          avatar_url: string | null;
          created_at: string | null;
          sppg_id: string | null;
          id: string | null;
          jabatan: string | null;
        };
        Insert: {
          id_user?: string;
          nama_lengkap: string;
          avatar_url?: string | null;
          created_at?: string | null;
          sppg_id?: string | null;
          id?: string | null;
          jabatan?: string | null;
        };
        Update: {
          id_user?: string;
          nama_lengkap?: string;
          avatar_url?: string | null;
          created_at?: string | null;
          sppg_id?: string | null;
          id?: string | null;
          jabatan?: string | null;
        };
      };
      sppg: {
        Row: {
          id: string;
          nama: string | null;
          wilayah: string | null;
          alamat: string | null;
          kecamatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama?: string | null;
          wilayah?: string | null;
          alamat?: string | null;
          kecamatan: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string | null;
          wilayah?: string | null;
          alamat?: string | null;
          kecamatan: string | null;
          created_at?: string;
        };
      };
      nutrition_scans: {
        Row: {
          id: string;
          image_url: string;
          scan_date: string | null;
          menu_items: unknown;
          nutrition_facts: unknown;
          created_at: string | null;
          user_id: string | null;
          school_category: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          scan_date?: string | null;
          menu_items: unknown;
          nutrition_facts: unknown;
          created_at?: string | null;
          user_id?: string | null;
          school_category: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          scan_date?: string | null;
          menu_items?: unknown;
          nutrition_facts?: unknown;
          created_at?: string | null;
          user_id?: string | null;
          school_category?: string;
        };
      };
    };
  };
};
