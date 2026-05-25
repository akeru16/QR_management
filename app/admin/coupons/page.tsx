import { EmptyState } from "@/components/EmptyState";
import { getCoupons } from "@/lib/data/admin";
import { createCouponAction, toggleCouponAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">クーポン管理</h1>
        <p className="mt-2 text-sm text-gray-600">店舗限定と加盟店グループ共通のクーポンを管理します。</p>
      </div>

      <form action={createCouponAction} className="grid gap-4 rounded-lg border border-line bg-white p-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">クーポン名</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-mint"
            name="title"
            required
            type="text"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">種別</span>
          <select
            className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-mint"
            name="scope"
          >
            <option value="store">店舗限定</option>
            <option value="organization">加盟店グループ共通</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">必要来店回数</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-mint"
            min={1}
            name="requiredVisitCount"
            required
            type="number"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold">説明</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-mint"
            name="description"
            required
          />
        </label>

        <div className="md:col-span-2">
          <button className="rounded-md bg-mint px-4 py-2 font-bold text-white" type="submit">
            クーポンを作成
          </button>
        </div>
      </form>

      {coupons.length === 0 ? (
        <EmptyState message="まだクーポンはありません。" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">クーポン名</th>
                <th className="px-4 py-3 font-semibold">種別</th>
                <th className="px-4 py-3 font-semibold">条件</th>
                <th className="px-4 py-3 font-semibold">状態</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="min-w-64 px-4 py-3">
                    <p className="font-semibold">{coupon.title}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">{coupon.description}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {coupon.scope === "store" ? "店舗限定" : "加盟店共通"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {coupon.required_visit_count}回来店
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={
                        coupon.is_active
                          ? "rounded-full bg-mint/10 px-2 py-1 text-xs font-semibold text-mint"
                          : "rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600"
                      }
                    >
                      {coupon.is_active ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <form action={toggleCouponAction}>
                      <input name="couponId" type="hidden" value={coupon.id} />
                      <input name="isActive" type="hidden" value={String(!coupon.is_active)} />
                      <button className="rounded-md border border-line px-3 py-2 font-semibold hover:border-mint hover:text-mint" type="submit">
                        {coupon.is_active ? "無効にする" : "有効にする"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
