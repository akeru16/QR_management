import Link from "next/link";

const links = [
  { href: "/admin", label: "トップ" },
  { href: "/admin/visits", label: "来店履歴" },
  { href: "/admin/customers", label: "顧客一覧" },
  { href: "/admin/coupons", label: "クーポン" },
  { href: "/admin/qr", label: "QRコード" }
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-line bg-white px-4 py-3">
      {links.map((link) => (
        <Link
          className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:border-mint hover:text-mint"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
