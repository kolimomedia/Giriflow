import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

/**
 * Marketing shell — wraps public pages (/, /about, /pricing, /contact, /login,
 * /forgot-password, 404) with the public site Nav + Footer.
 *
 * The dashboard at /app/** has its own Sidebar + Topbar and deliberately
 * does not get this layout.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <>
      <Nav user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
