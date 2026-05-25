export type CouponScope = "store" | "organization";

export type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export type Store = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  birth_date: string | null;
  gender: CustomerGender;
  anonymous_device_id: string | null;
  privacy_agreed_at: string | null;
  created_at: string;
};

export type CustomerGender = "male" | "female" | "other" | "not_answered";

export type Visit = {
  id: string;
  store_id: string;
  customer_id: string;
  visited_at: string;
};

export type Coupon = {
  id: string;
  organization_id: string;
  store_id: string | null;
  title: string;
  description: string;
  required_visit_count: number;
  scope: CouponScope;
  is_active: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Organization;
        Update: Partial<Organization>;
        Relationships: [];
      };
      stores: {
        Row: Store;
        Insert: Store;
        Update: Partial<Store>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Customer>;
        Relationships: [];
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, "id" | "visited_at"> & {
          id?: string;
          visited_at?: string;
        };
        Update: Partial<Visit>;
        Relationships: [];
      };
      coupons: {
        Row: Coupon;
        Insert: Omit<Coupon, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Coupon>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type StoreWithOrganization = Store & {
  organizations: Organization;
};

export type CouponWithAvailability = Coupon & {
  currentVisitCount: number;
};

export type CheckinResult = {
  customer: Customer;
  store: StoreWithOrganization;
  storeVisitCount: number;
  organizationVisitCount: number;
  availableCoupons: CouponWithAvailability[];
};

export type AdminStats = {
  todayVisits: number;
  totalVisits: number;
  totalCustomers: number;
  totalCoupons: number;
};

export type VisitListItem = Visit & {
  customers: Pick<Customer, "name" | "birth_date" | "gender">;
  stores: Pick<Store, "name"> & {
    organizations: Pick<Organization, "name">;
  };
};

export type CustomerListItem = {
  id: string;
  name: string;
  birthDate: string | null;
  gender: CustomerGender;
  age: number | null;
  visitCount: number;
  lastVisitedAt: string | null;
};
