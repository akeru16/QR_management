"use server";

import { revalidatePath } from "next/cache";
import { createCoupon, setCouponActive } from "@/lib/data/admin";
import type { CouponScope } from "@/lib/types/database";

const DEFAULT_ORGANIZATION_ID = "default-organization";
const DEFAULT_STORE_ID = "default-store";

export async function createCouponAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requiredVisitCount = Number(formData.get("requiredVisitCount") ?? 0);
  const scope = String(formData.get("scope") ?? "store") as CouponScope;

  if (!title || !description || !Number.isInteger(requiredVisitCount) || requiredVisitCount < 1) {
    throw new Error("クーポン名、説明、必要来店回数を正しく入力してください。");
  }

  if (scope !== "store" && scope !== "organization") {
    throw new Error("クーポン種別が正しくありません。");
  }

  await createCoupon({
    title,
    description,
    requiredVisitCount,
    scope,
    organizationId: DEFAULT_ORGANIZATION_ID,
    storeId: DEFAULT_STORE_ID
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
}

export async function toggleCouponAction(formData: FormData) {
  const couponId = String(formData.get("couponId") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!couponId) {
    throw new Error("クーポンIDがありません。");
  }

  await setCouponActive(couponId, isActive);
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
}
