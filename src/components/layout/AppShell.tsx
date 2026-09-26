import { Bell, Download, LogOut, Sprout, UserRound, WifiOff } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import { useInstallPrompt } from "../../features/pwa/pwa";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useResource } from "../../hooks/useResource";
import { notificationApi } from "../../lib/api/services";
import { Logo } from "../brand/Logo";

const NAV = [
  { to: "/app", label: "Cultivos", icon: Sprout, end: true },
  { to: "/app/notifications", label: "Alertas", icon: Bell, end: false },
  { to: "/app/profile", label: "Perfil", icon: UserRound, end: false },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const online = useOnlineStatus();
  const { available, install } = useInstallPrompt();
  const unread = useResource(() => notificationApi.unreadCount(), [], 60_000);
  const count = unread.data?.unread ?? 0;

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white px-4 py-5 md:flex">
        <Link to="/app" aria-label="Mis cultivos"><Logo size={32} /></Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Aplicación">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
                ${isActive ? "bg-leaf-50 text-leaf-800" : "text-muted hover:bg-surface hover:text-ink"}`}>
              <Icon size={18} />
              {label}
              {to === "/app/notifications" && count > 0 && (
                <span className="ml-auto rounded-full bg-danger-500 px-2 text-xs text-white">{count}</span>
              )}
            </NavLink>
          ))}
        </nav>
        {available && (
          <button type="button" onClick={() => void install()}
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-leaf-800 hover:bg-leaf-50">
            <Download size={18} /> Instalar app
          </button>
        )}
        <div className="border-t border-line pt-4">
          <p className="truncate text-sm font-semibold">{user?.name} {user?.lastName}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
          <button type="button" onClick={() => signOut()}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted hover:text-danger-600">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/90
          px-4 backdrop-blur md:hidden">
          <Link to="/app" aria-label="Mis cultivos"><Logo size={28} /></Link>
          <div className="flex items-center gap-1">
            {available && (
              <button type="button" onClick={() => void install()} aria-label="Instalar app"
                className="rounded-lg p-2 text-leaf-800 hover:bg-leaf-50"><Download size={20} /></button>
            )}
            <Link to="/app/notifications" aria-label={`Alertas, ${count} sin leer`}
              className="relative rounded-lg p-2 text-muted hover:bg-surface">
              <Bell size={20} />
              {count > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-danger-500" />}
            </Link>
          </div>
        </header>
        {!online && (
          <div className="flex items-center justify-center gap-2 bg-sun-100 px-4 py-2 text-sm font-medium text-sun-600">
            <WifiOff size={16} /> Sin conexión: los datos pueden no estar actualizados.
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]
        md:hidden" aria-label="Aplicación">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-xs font-semibold
              ${isActive ? "text-leaf-700" : "text-muted"}`}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
