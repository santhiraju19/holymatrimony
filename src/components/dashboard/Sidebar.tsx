import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "My Profile", href: "/profile" },
  { name: "Search", href: "/search" },
  { name: "Interests", href: "/interests" },
  { name: "Membership", href: "/membership" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0B2D5C] text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold text-[#D4AF37]">
        Holy Matrimony
      </h1>

      <p className="mt-1 text-sm text-slate-300">
        Faith • Family • Forever
      </p>

      <nav className="mt-10 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block rounded-xl px-4 py-3 hover:bg-[#123C73]"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}