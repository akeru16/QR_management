import { QrCode } from "./QrCode";
import { createCheckinToken } from "@/lib/data/checkinTokens";

const DEFAULT_STORE_ID = "default-store";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { token, expiresAt } = await createCheckinToken(DEFAULT_STORE_ID);
  const checkinPath = `/checkin/${DEFAULT_STORE_ID}`;
  const checkinUrl = `${appUrl.replace(/\/$/, "")}${checkinPath}?token=${token}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">店舗用QRコード</h1>
        <p className="mt-2 text-sm text-gray-600">店頭で表示してください。QRコードは5分ごとに更新されます。</p>
      </div>

      <section className="mx-auto max-w-lg rounded-lg border border-line bg-white p-8 text-center print:border-0 print:shadow-none">
        <p className="text-sm font-semibold text-mint">Aカフェ 来店登録</p>
        <div className="mt-6 flex justify-center">
          <QrCode expiresAt={expiresAt} value={checkinUrl} />
        </div>
        <p className="mt-6 break-all rounded-md bg-gray-50 p-3 text-sm text-gray-700">{checkinUrl}</p>
        <p className="mt-4 text-sm text-gray-600">スマートフォンのカメラで読み取ってください。</p>
      </section>
    </div>
  );
}
