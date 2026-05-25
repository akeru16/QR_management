"use server";

import { registerVisit } from "@/lib/data/checkin";
import type { CheckinResult } from "@/lib/types/database";

export type CheckinActionState = {
  status: "idle" | "success" | "error";
  message: string;
  result: CheckinResult | null;
};

export async function submitCheckin(
  _previousState: CheckinActionState,
  formData: FormData
): Promise<CheckinActionState> {
  try {
    const storeId = String(formData.get("storeId") ?? "");
    const token = String(formData.get("token") ?? "");
    const name = String(formData.get("name") ?? "");
    const birthDate = String(formData.get("birthDate") ?? "");
    const gender = String(formData.get("gender") ?? "");
    const anonymousDeviceId = String(formData.get("anonymousDeviceId") ?? "");
    const privacyAgreed = formData.get("privacyAgreed") === "on";
    const result = await registerVisit({
      storeId,
      token,
      rawName: name,
      birthDate,
      gender,
      anonymousDeviceId,
      privacyAgreed
    });

    return {
      status: "success",
      message: "来店登録が完了しました。",
      result
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "来店登録に失敗しました。",
      result: null
    };
  }
}
