// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { 
  LayoutDashboard, Users, Library, Mic2, LayoutGrid, 
  ShieldAlert, Handshake, BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: "/admin", label: "Anasayfa", icon: LayoutDashboard, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { href: "/admin/projeler", label: "Projeler", icon: Library, allowedRoles: [UserRole.ADMIN] },
  { href: "/admin/sanatcilar", label: "Sanatçılar", icon: Mic2, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { href: "/admin/raporlar", label: "Raporlar", icon: ShieldAlert, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { href: "/admin/basvurular", label: "Başvurular", icon: Handshake, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
  // Admin'e özel linkler
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users, allowedRoles: [UserRole.ADMIN] },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: LayoutGrid, allowedRoles: [UserRole.ADMIN] },
  { href: "/admin/istatistikler", label: "İstatistikler", icon: BarChart3, allowedRoles: [UserRole.ADMIN] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const accessibleLinks = sidebarLinks.filter(link => 
    userRole && link.allowedRoles.includes(userRole)
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-gray-100">
          PrestiJ Yönetim
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {accessibleLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="mb-2">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-indigo-600 text-white" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          Siteye Geri Dön
        </Link>
      </div>
    </aside>
  );
}