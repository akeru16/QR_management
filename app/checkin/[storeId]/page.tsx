import { CheckinForm } from "./CheckinForm";
import { getStoreById } from "@/lib/data/checkin";

export const dynamic = "force-dynamic";

export default async function CheckinPage({
  params,
  searchParams
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { storeId } = await params;
  const { token = "" } = await searchParams;
  const store = await getStoreById(storeId);

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="mb-6 rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-mint">{store.organizations.name}</p>
        <h1 className="mt-1 text-2xl font-bold">{store.name}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          店頭QRからの来店登録ページです。ニックネーム、生年月日、性別を入力してください。
        </p>
      </header>
      <CheckinForm storeId={store.id} token={token} />
    </main>
  );
}
