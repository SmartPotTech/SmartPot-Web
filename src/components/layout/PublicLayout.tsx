import {GitFork} from "lucide-react";
import {Link, Outlet} from "react-router";
import {useAuth} from "../../features/auth/AuthContext";
import {Logo} from "../brand/Logo";

export function PublicLayout() {
    const {token} = useAuth();
    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur">
                <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Principal">
                    <Link to="/" aria-label="SmartPot, inicio"><Logo size={34}/></Link>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <a href="/#funciones"
                           className="hidden rounded-lg px-3 py-2 text-muted hover:text-leaf-800 md:block">Funciones</a>
                        <a href="/#ia" className="hidden rounded-lg px-3 py-2 text-muted hover:text-leaf-800 md:block">Inteligencia
                            artificial</a>
                        <a href="/#preguntas"
                           className="hidden rounded-lg px-3 py-2 text-muted hover:text-leaf-800 md:block">Preguntas</a>
                        {token ? (
                            <Link to="/app" className="rounded-xl bg-leaf-700 px-4 py-2 text-white hover:bg-leaf-800">Ir
                                a mi panel</Link>
                        ) : (
                            <>
                                <Link to="/login"
                                      className="rounded-xl px-3 py-2 text-leaf-800 hover:bg-leaf-50">Ingresar</Link>
                                <Link to="/register"
                                      className="rounded-xl bg-leaf-700 px-4 py-2 text-white hover:bg-leaf-800">Crear
                                    cuenta</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main className="flex-1">
                <Outlet/>
            </main>
            <footer className="border-t border-line bg-leaf-950 text-leaf-100">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
                    <div>
                        <Logo size={30} inverse/>
                        <p className="mt-3 text-sm text-leaf-300/80">
                            Monitoreo y automatización de cultivos hidropónicos con IoT e inteligencia artificial.
                        </p>
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-white">Producto</p>
                        <ul className="mt-2 space-y-1.5 text-leaf-300/80">
                            <li><a href="/#funciones" className="hover:text-white">Funciones</a></li>
                            <li><a href="/#como-funciona" className="hover:text-white">Cómo funciona</a></li>
                            <li><Link to="/register" className="hover:text-white">Crear cuenta</Link></li>
                        </ul>
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-white">Proyecto abierto</p>
                        <a href="https://github.com/SmartPotTech" target="_blank" rel="noopener noreferrer"
                           className="mt-2 inline-flex items-center gap-2 text-leaf-300/80 hover:text-white">
                            <GitFork size={16}/> SmartPotTech en GitHub
                        </a>
                        <p className="mt-2 text-leaf-300/60">Licencia MIT · Hecho en Colombia</p>
                    </div>
                </div>
                <p className="border-t border-white/10 py-4 text-center text-xs text-leaf-300/60">
                    © {new Date().getFullYear()} SmartPot Tech
                </p>
            </footer>
        </div>
    );
}
