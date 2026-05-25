# QR来店管理・クーポン配布MVP

Next.js + TypeScript + Supabase + Tailwind CSSで作る、1店舗から始められるQRチェックインアプリです。MVPでは`default-store`のみを使いますが、DBとコードは複数店舗・複数organizationへ広げやすい形にしています。

## 1. 全体のディレクトリ構成

```txt
app/
  admin/
    coupons/
    customers/
    qr/
    visits/
  checkin/[storeId]/
components/
lib/
  data/
  supabase/
  types/
supabase/
  schema.sql
```

## 2. Supabase用SQL

`supabase/schema.sql`をSupabase SQL Editorで実行してください。初期データとして`default-organization`、`default-store`、MVP用クーポンを投入します。

将来拡張案として、`coupon_usable_stores`と`user_coupons`のDDLもコメント付きで同じSQLに含めています。

## 3. 必要なnpmパッケージ

```bash
npm install
```

主な依存関係:

- `next`
- `react`
- `react-dom`
- `@supabase/supabase-js`
- `tailwindcss`
- `qrcode.react`
- `typescript`

## 4. 環境変数の例

`.env.example`を`.env.local`にコピーして設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. 各ページの役割

- `/checkin/[storeId]`: QRコードから開く来店登録ページ。`default-store`で動作します。
- `/admin`: 今日の来店数、累計来店数、顧客数、クーポン数を表示します。
- `/admin/visits`: 来店日時、顧客名、店舗名、organization名を表示します。
- `/admin/customers`: 顧客名、累計来店回数、最終来店日を表示します。
- `/admin/coupons`: クーポン一覧、作成、有効・無効切り替えを行います。
- `/admin/qr`: `/checkin/default-store`へのQRコードを表示します。

## 6. 実装手順

1. Supabaseで新規プロジェクトを作成します。
2. `supabase/schema.sql`をSupabase SQL Editorで実行します。
3. `.env.example`を`.env.local`にコピーし、Supabase URLとanon keyを設定します。
4. `npm install`を実行します。
5. `npm run dev`を実行します。
6. `http://localhost:3000/checkin/default-store`で来店登録を試します。
7. `http://localhost:3000/admin`で管理画面を確認します。

## 将来拡張の考え方

- `customers`は店舗に紐づけず共通会員として扱います。
- `visits`で`customer_id`と`store_id`を紐づけ、店舗別・organization別の来店回数を集計します。
- `coupons.scope = store`は店舗限定、`organization`は加盟店グループ共通として判定します。
- A店舗発行でB店舗だけ利用可能、複数店舗限定、使用済み管理は、将来`coupon_usable_stores`と`user_coupons`で拡張できます。
# QR_management
