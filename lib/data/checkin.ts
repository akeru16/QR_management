import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CheckinResult,
  Coupon,
  CouponWithAvailability,
  CustomerGender,
  Customer,
  StoreWithOrganization
} from "@/lib/types/database";
import { normalizeCustomerName } from "@/lib/data/format";
import { validateCheckinToken } from "@/lib/data/checkinTokens";

export async function getStoreById(storeId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*, organizations(*)")
    .eq("id", storeId)
    .single();

  if (error) {
    throw new Error("店舗情報を取得できませんでした。");
  }

  return data as StoreWithOrganization;
}

function isCustomerGender(value: string): value is CustomerGender {
  return ["male", "female", "other", "not_answered"].includes(value);
}

function validateBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("生年月日を入力してください。");
  }

  const birthDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  if (Number.isNaN(birthDate.getTime()) || birthDate > today || birthDate < minDate) {
    throw new Error("生年月日を正しく入力してください。");
  }
}

async function findOrCreateCustomer(input: {
  name: string;
  birthDate: string;
  gender: CustomerGender;
  anonymousDeviceId: string;
}) {
  const supabase = createSupabaseServerClient();

  const { data: existing, error: selectError } = await supabase
    .from("customers")
    .select("*")
    .eq("anonymous_device_id", input.anonymousDeviceId)
    .maybeSingle();

  if (selectError) {
    throw new Error("顧客情報を確認できませんでした。");
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update({
        name: input.name,
        birth_date: input.birthDate,
        gender: input.gender,
        privacy_agreed_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) {
      throw new Error("顧客情報を更新できませんでした。");
    }

    return updated as Customer;
  }

  const { data: created, error: insertError } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      birth_date: input.birthDate,
      gender: input.gender,
      anonymous_device_id: input.anonymousDeviceId,
      privacy_agreed_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (insertError) {
    const { data: retry } = await supabase
      .from("customers")
      .select("*")
      .eq("anonymous_device_id", input.anonymousDeviceId)
      .maybeSingle();

    if (retry) {
      return retry as Customer;
    }

    throw new Error("顧客情報を登録できませんでした。");
  }

  return created as Customer;
}

async function countStoreVisits(customerId: string, storeId: string) {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("store_id", storeId);

  if (error) {
    throw new Error("店舗別の来店回数を取得できませんでした。");
  }

  return count ?? 0;
}

async function countOrganizationVisits(customerId: string, organizationId: string) {
  const supabase = createSupabaseServerClient();
  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id")
    .eq("organization_id", organizationId);

  if (storesError) {
    throw new Error("加盟店グループの店舗情報を取得できませんでした。");
  }

  const storeIds = stores.map((store) => store.id);
  if (storeIds.length === 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .in("store_id", storeIds);

  if (error) {
    throw new Error("加盟店グループ内の来店回数を取得できませんでした。");
  }

  return count ?? 0;
}

async function getAvailableCoupons(params: {
  storeId: string;
  organizationId: string;
  storeVisitCount: number;
  organizationVisitCount: number;
}) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("organization_id", params.organizationId)
    .eq("is_active", true)
    .or(`and(scope.eq.store,store_id.eq.${params.storeId}),and(scope.eq.organization,store_id.is.null)`)
    .order("required_visit_count", { ascending: true });

  if (error) {
    throw new Error("利用可能なクーポンを取得できませんでした。");
  }

  return (data as Coupon[])
    .map<CouponWithAvailability>((coupon) => ({
      ...coupon,
      currentVisitCount:
        coupon.scope === "store" ? params.storeVisitCount : params.organizationVisitCount
    }))
    .filter((coupon) => coupon.currentVisitCount >= coupon.required_visit_count);
}

export async function registerVisit(input: {
  storeId: string;
  token: string;
  rawName: string;
  birthDate: string;
  gender: string;
  anonymousDeviceId: string;
  privacyAgreed: boolean;
}): Promise<CheckinResult> {
  const storeId = input.storeId;
  const name = normalizeCustomerName(input.rawName);

  if (!name) {
    throw new Error("ニックネームを入力してください。");
  }

  if (name.length > 80) {
    throw new Error("ニックネームは80文字以内で入力してください。");
  }

  if (!input.token) {
    throw new Error("店頭のQRコードからアクセスしてください。");
  }

  if (!input.anonymousDeviceId || input.anonymousDeviceId.length > 120) {
    throw new Error("端末識別情報を確認できませんでした。ページを再読み込みしてください。");
  }

  validateBirthDate(input.birthDate);

  if (!isCustomerGender(input.gender)) {
    throw new Error("性別を選択してください。");
  }

  if (!input.privacyAgreed) {
    throw new Error("利用目的とプライバシーポリシーへの同意が必要です。");
  }

  const supabase = createSupabaseServerClient();
  const store = await getStoreById(storeId);
  await validateCheckinToken(store.id, input.token);
  const customer = await findOrCreateCustomer({
    name,
    birthDate: input.birthDate,
    gender: input.gender,
    anonymousDeviceId: input.anonymousDeviceId
  });

  const { error: visitError } = await supabase.from("visits").insert({
    store_id: store.id,
    customer_id: customer.id
  });

  if (visitError) {
    throw new Error("来店情報を登録できませんでした。");
  }

  const [storeVisitCount, organizationVisitCount] = await Promise.all([
    countStoreVisits(customer.id, store.id),
    countOrganizationVisits(customer.id, store.organization_id)
  ]);

  const availableCoupons = await getAvailableCoupons({
    storeId: store.id,
    organizationId: store.organization_id,
    storeVisitCount,
    organizationVisitCount
  });

  return {
    customer,
    store,
    storeVisitCount,
    organizationVisitCount,
    availableCoupons
  };
}
