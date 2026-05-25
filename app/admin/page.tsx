import Link from "next/link";
import { getAdminStats } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

const statLabels = [
  { key: "todayVisits", label: "今日の来店数" },
  { key: "totalVisits", label: "累計来店数" },
  { key: "totalCustomers", label: "顧客数" },
  { key: "totalCoupons", label: "クーポン数" }
] as const;

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理画面</h1>
        <p className="mt-2 text-sm text-gray-600">default-storeのMVP管理画面です。</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statLabels.map((item) => (
          <div className="rounded-lg border border-line bg-white p-5" key={item.key}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{stats[item.key]}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="rounded-md bg-white p-4 font-semibold hover:text-mint" href="/admin/visits">
          来店履歴を見る
        </Link>
        <Link className="rounded-md bg-white p-4 font-semibold hover:text-mint" href="/admin/customers">
          顧客一覧を見る
        </Link>
        <Link className="rounded-md bg-white p-4 font-semibold hover:text-mint" href="/admin/coupons">
          クーポンを管理する
        </Link>
        <Link className="rounded-md bg-white p-4 font-semibold hover:text-mint" href="/admin/qr">
          QRコードを表示する
        </Link>
      </section>
    </div>
  );
}
