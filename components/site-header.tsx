import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          <span>MenuHub</span>
        </Link>

        <nav className="nav-links">
          <Link href="/explore">Keşfet</Link>
          <Link href="/submit">Katkı Gönder</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
