import { EmptyState } from "@/components/EmptyState";
import { getCustomers } from "@/lib/data/admin";
import { formatDate, formatDateTime, formatGender } from "@/lib/data/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">顧客一覧</h1>
        <p className="mt-2 text-sm text-gray-600">共通会員として店舗には直接所属させません。</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState message="まだ顧客は登録されていません。" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">顧客名</th>
                <th className="px-4 py-3 font-semibold">生年月日</th>
                <th className="px-4 py-3 font-semibold">年齢</th>
                <th className="px-4 py-3 font-semibold">性別</th>
                <th className="px-4 py-3 font-semibold">累計来店回数</th>
                <th className="px-4 py-3 font-semibold">最終来店日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {customer.birthDate ? formatDate(customer.birthDate) : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {customer.age === null ? "-" : `${customer.age}歳`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatGender(customer.gender)}</td>
                  <td className="px-4 py-3">{customer.visitCount}回</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {customer.lastVisitedAt ? formatDateTime(customer.lastVisitedAt) : "-"}
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
