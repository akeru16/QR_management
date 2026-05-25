import { EmptyState } from "@/components/EmptyState";
import { getVisits } from "@/lib/data/admin";
import { calculateAge, formatDateTime, formatGender } from "@/lib/data/format";

export const dynamic = "force-dynamic";

export default async function AdminVisitsPage() {
  const visits = await getVisits();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">来店履歴</h1>
        <p className="mt-2 text-sm text-gray-600">新しい来店から順に表示します。</p>
      </div>

      {visits.length === 0 ? (
        <EmptyState message="まだ来店履歴はありません。" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">来店日時</th>
                <th className="px-4 py-3 font-semibold">顧客名</th>
                <th className="px-4 py-3 font-semibold">年齢</th>
                <th className="px-4 py-3 font-semibold">性別</th>
                <th className="px-4 py-3 font-semibold">店舗名</th>
                <th className="px-4 py-3 font-semibold">organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(visit.visited_at)}</td>
                  <td className="px-4 py-3">{visit.customers.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {calculateAge(visit.customers.birth_date) === null
                      ? "-"
                      : `${calculateAge(visit.customers.birth_date)}歳`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatGender(visit.customers.gender)}
                  </td>
                  <td className="px-4 py-3">{visit.stores.name}</td>
                  <td className="px-4 py-3">{visit.stores.organizations.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
