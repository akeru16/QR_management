import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminStats,
  Coupon,
  CouponScope,
  CustomerListItem,
  VisitListItem
} from "@/lib/types/database";
import { calculateAge } from "@/lib/data/format";

function startOfTodayIso() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createSupabaseServerClient();

  const [todayVisits, totalVisits, totalCustomers, totalCoupons] = await Promise.all([
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", startOfTodayIso()),
    supabase.from("visits").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("coupons").select("id", { count: "exact", head: true })
  ]);

  const firstError =
    todayVisits.error || totalVisits.error || totalCustomers.error || totalCoupons.error;

  if (firstError) {
    throw new Error("管理画面の集計情報を取得できませんでした。");
  }

  return {
    todayVisits: todayVisits.count ?? 0,
    totalVisits: totalVisits.count ?? 0,
    totalCustomers: totalCustomers.count ?? 0,
    totalCoupons: totalCoupons.count ?? 0
  };
}

export async function getVisits(): Promise<VisitListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visits")
    .select("*, customers(name), stores(name, organizations(name))")
    .order("visited_at", { ascending: false });

  if (error) {
    throw new Error("来店履歴を取得できませんでした。");
  }

  return data as VisitListItem[];
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const supabase = createSupabaseServerClient();
  const { data: customers, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (customerError) {
    throw new Error("顧客一覧を取得できませんでした。");
  }

  const { data: visits, error: visitError } = await supabase
    .from("visits")
    .select("customer_id, visited_at")
    .order("visited_at", { ascending: false });

  if (visitError) {
    throw new Error("顧客の来店情報を取得できませんでした。");
  }

  return customers.map((customer) => {
    const customerVisits = visits.filter((visit) => visit.customer_id === customer.id);

    return {
      id: customer.id,
      name: customer.name,
      birthDate: customer.birth_date,
      gender: customer.gender,
      age: calculateAge(customer.birth_date),
      visitCount: customerVisits.length,
      lastVisitedAt: customerVisits[0]?.visited_at ?? null
    };
  });
}

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("required_visit_count", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("クーポン一覧を取得できませんでした。");
  }

  return data as Coupon[];
}

export async function createCoupon(input: {
  title: string;
  description: string;
  requiredVisitCount: number;
  scope: CouponScope;
  organizationId: string;
  storeId: string;
}) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("coupons").insert({
    organization_id: input.organizationId,
    store_id: input.scope === "store" ? input.storeId : null,
    title: input.title,
    description: input.description,
    required_visit_count: input.requiredVisitCount,
    scope: input.scope,
    is_active: true
  });

  if (error) {
    throw new Error("クーポンを作成できませんでした。");
  }
}

export async function setCouponActive(couponId: string, isActive: boolean) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", couponId);

  if (error) {
    throw new Error("クーポンの状態を更新できませんでした。");
  }
}
