import { LogoutOutlined } from "@ant-design/icons";
import type { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../features/auth/contexts/AuthContext.tsx";

type SidebarProps = {
  title: string;
  icons: ElementType[];
  labels: string[];
  paths: string[];
};

export default function Sidebar({ title, icons, labels, paths }: SidebarProps) {
  const { pathname } = useLocation();
  const { logout } = useAuthContext();

  const isPathActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const getLinkClasses = (isActive: boolean) =>
    `flex items-center rounded-lg transition-colors ${
      isActive
        ? "text-[#29BD8A] bg-[#29BD8A]/15"
        : "text-gray-500 hover:text-[#29BD8A] hover:bg-[#29BD8A]/10"
    }`;

  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:flex-col md:border-r md:border-gray-200 md:bg-white md:shadow-sm md:w-20 lg:w-60">
        <div className="px-2 pt-6 pb-4 lg:px-5">
          <h1 className="text-center text-xl font-bold text-gray-800 lg:text-left lg:text-3xl">
            <span className="lg:hidden" title={title}>
              🥬
            </span>
            <span className="hidden lg:inline">{title}</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {icons.map((Icon, index) => {
            const isActive = isPathActive(paths[index]);
            return (
              <Link
                key={paths[index]}
                to={paths[index]}
                title={labels[index]}
                className={`${getLinkClasses(isActive)} mb-1 px-3 py-3 md:justify-center lg:justify-start`}
              >
                <Icon className="text-xl" />
                <span className="ml-3 hidden font-medium lg:inline">{labels[index]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2">
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="flex w-full items-center rounded-lg px-3 py-3 text-red-800 transition-colors hover:bg-red-100 md:justify-center lg:justify-start"
          >
            <LogoutOutlined className="text-xl" />
            <span className="ml-3 hidden font-medium lg:inline">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
        {icons.map((Icon, index) => {
          const isActive = isPathActive(paths[index]);
          return (
            <Link
              key={paths[index]}
              to={paths[index]}
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2"
              title={labels[index]}
            >
              <Icon className={`text-lg ${isActive ? "text-[#29BD8A]" : "text-gray-500"}`} />
              <span
                className={`mt-1 text-[10px] leading-3 ${
                  isActive ? "text-[#29BD8A]" : "text-gray-500"
                }`}
              >
                {labels[index]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
