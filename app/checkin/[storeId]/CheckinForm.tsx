"use client";

import { useActionState, useEffect, useState } from "react";
import { submitCheckin, type CheckinActionState } from "./actions";

const initialState: CheckinActionState = {
  status: "idle",
  message: "",
  result: null
};

const DEVICE_ID_STORAGE_KEY = "qr_shop_anonymous_device_id";

function createDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckinForm({ storeId, token }: { storeId: string; token: string }) {
  const [state, formAction, isPending] = useActionState(submitCheckin, initialState);
  const [anonymousDeviceId, setAnonymousDeviceId] = useState("");

  useEffect(() => {
    const savedDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (savedDeviceId) {
      setAnonymousDeviceId(savedDeviceId);
      return;
    }

    const nextDeviceId = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);
    setAnonymousDeviceId(nextDeviceId);
  }, []);

  if (!token) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        QRコードの有効期限が切れています。店頭に表示されている最新のQRコードを読み取ってください。
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <input name="storeId" type="hidden" value={storeId} />
        <input name="token" type="hidden" value={token} />
        <input name="anonymousDeviceId" type="hidden" value={anonymousDeviceId} />
        <label className="block">
          <span className="text-sm font-semibold">ニックネーム</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-4 py-3 text-base outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            maxLength={80}
            name="name"
            placeholder="例: さとう"
            required
            type="text"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">生年月日</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-4 py-3 text-base outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            name="birthDate"
            required
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">性別</span>
          <select
            className="mt-2 w-full rounded-md border border-line bg-white px-4 py-3 text-base outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
            defaultValue=""
            name="gender"
            required
          >
            <option disabled value="">
              選択してください
            </option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
            <option value="not_answered">回答しない</option>
          </select>
        </label>
        <label className="flex gap-3 rounded-md border border-line p-3 text-sm leading-6 text-gray-700">
          <input className="mt-1 size-4 shrink-0" name="privacyAgreed" required type="checkbox" />
          <span>
            入力いただいた情報は、来店履歴の管理、クーポン配布、店舗運営の分析のために利用します。電話番号・メールアドレスは取得しません。
          </span>
        </label>
        <button
          className="w-full rounded-md bg-mint px-4 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !anonymousDeviceId}
          type="submit"
        >
          {isPending ? "登録中..." : "来店登録"}
        </button>
      </form>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" && state.result ? (
        <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-mint">{state.message}</p>
            <h2 className="mt-1 text-xl font-bold">{state.result.customer.name}さん</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line p-3">
              <p className="text-xs text-gray-500">この店舗への来店</p>
              <p className="mt-1 text-2xl font-bold">{state.result.storeVisitCount}回</p>
            </div>
            <div className="rounded-md border border-line p-3">
              <p className="text-xs text-gray-500">グループ内合計</p>
              <p className="mt-1 text-2xl font-bold">{state.result.organizationVisitCount}回</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold">利用可能なクーポン</h3>
            {state.result.availableCoupons.length > 0 ? (
              <div className="mt-3 space-y-3">
                {state.result.availableCoupons.map((coupon) => (
                  <article className="rounded-md border border-line p-4" key={coupon.id}>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold">{coupon.title}</h4>
                      <span className="shrink-0 rounded-full bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">
                        {coupon.scope === "store" ? "店舗限定" : "共通"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{coupon.description}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      条件: {coupon.required_visit_count}回来店
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-line p-4 text-sm text-gray-600">
                まだ利用可能なクーポンはありません。
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
