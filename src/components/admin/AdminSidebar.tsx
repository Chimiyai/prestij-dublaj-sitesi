// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
// Gerekli yeni ikonları import ediyoruz
import { 
    LayoutDashboard, Users, Library, Mic2, LayoutGrid, ShieldAlert, Handshake, 
    BarChart3, Lightbulb, HeartPlus, Text, ListTodo, PlusCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sidebar veri yapısını yeni roller ve linklerle güncelliyoruz
const sidebarGroups = [
  {
    title: 'Genel',
    links: [
      { href: "/admin", label: "Anasayfa", icon: LayoutDashboard, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
      { href: "/admin/istatistikler", label: "İstatistikler", icon: BarChart3, allowedRoles: [UserRole.ADMIN] },
    ]
  },
  {
    // --- YENİ GRUP: Prodüksiyon ---
    title: 'Prodüksiyon',
    links: [
      { 
        href: "/admin/gorevler", 
        label: "Görevlerim", 
        icon: ListTodo, 
        // Görevleri olan herkes bu sayfayı görebilir
        allowedRoles: [UserRole.VOICE_ACTOR, UserRole.MIX_MASTER, UserRole.MODDER, UserRole.TRANSLATOR, UserRole.ADMIN, UserRole.MODERATOR] 
      },
      { 
        href: "/admin/gorevler/yeni", 
        label: "Yeni Görev Oluştur", 
        icon: PlusCircle, 
        // Sadece görev oluşturabilen roller
        allowedRoles: [UserRole.TRANSLATOR, UserRole.ADMIN, UserRole.MODERATOR] 
      },
      { 
        href: "/ceviri", 
        label: "Metin Editörü", 
        icon: Text, 
        // Çeviri aracına erişebilecek roller
        allowedRoles: [UserRole.TRANSLATOR, UserRole.ADMIN, UserRole.MODERATOR] 
      },
    ]
  },
  {
    title: 'İçerik Yönetimi',
    links: [
      { href: "/admin/projeler", label: "Projeler", icon: Library, allowedRoles: [UserRole.ADMIN] },
      { href: "/admin/sanatcilar", label: "Sanatçılar", icon: Mic2, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
      { href: "/admin/kategoriler", label: "Kategoriler", icon: LayoutGrid, allowedRoles: [UserRole.ADMIN] },
      { href: "/admin/katkilar", label: "Katkılar", icon: HeartPlus, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
    ]
  },
  {
    title: 'Topluluk Yönetimi',
    links: [
      { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users, allowedRoles: [UserRole.ADMIN] },
      { href: "/admin/raporlar", label: "Raporlar", icon: ShieldAlert, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
      { href: "/admin/basvurular", label: "Başvurular", icon: Handshake, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
      { href: "/admin/oneriler", label: "Öneriler", icon: Lightbulb, allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR] },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Render mantığında hiçbir değişiklik yapmaya gerek yok,
  // çünkü zaten dinamik ve rol tabanlı çalışıyor.
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-gray-100">
          PrestiJ Yönetim
        </Link>
      </div>
      <nav className="flex-grow">
        {sidebarGroups.map((group) => {
          const accessibleLinks = group.links.filter(link => 
            userRole && link.allowedRoles.includes(userRole)
          );

          if (accessibleLinks.length === 0) {
            return null;
          }

          return (
            <div key={group.title} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul>
                {accessibleLinks.map(link => {
                  // Aktif link kontrolünü, alt sayfaları da kapsayacak şekilde güncelleyelim
                  const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                  return (
                    <li key={link.href} className="mb-1">
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
            </div>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          Siteye Geri Dön
        </Link>
      </div>
    </aside>
  );
}