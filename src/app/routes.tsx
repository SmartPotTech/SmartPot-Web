import {lazy} from "solid-js";

// Cada vista es un trozo aparte: la landing no descarga la app privada y cada vista baja solo cuando se abre.
export const PrivateLayout = lazy(() => import("./PrivateLayout"));
export const OverviewPage = lazy(() => import("../features/overview/OverviewPage"));
export const CropDetailRoute = lazy(() => import("./CropDetailRoute"));
export const CropsPage = lazy(() => import("../features/crops/CropsPage").then((m) => ({default: m.CropsPage})));
export const ControlPage = lazy(() => import("../features/control/ControlPage").then((m) => ({default: m.ControlPage})));
export const ActionsPage = lazy(() => import("../features/actions/ActionsPage").then((m) => ({default: m.ActionsPage})));
export const LearningPage = lazy(() => import("../features/learning/LearningPage").then((m) => ({default: m.LearningPage})));
export const NotificationsPage = lazy(() =>
    import("../features/notifications/NotificationsPage").then((m) => ({default: m.NotificationsPage})));
export const ProfilePage = lazy(() => import("../features/profile/ProfilePage").then((m) => ({default: m.ProfilePage})));
export const LoginPage = lazy(() => import("../features/auth/LoginPage").then((m) => ({default: m.LoginPage})));
export const RegisterPage = lazy(() => import("../features/auth/RegisterPage").then((m) => ({default: m.RegisterPage})));
export const ForgotPasswordPage = lazy(() =>
    import("../features/auth/PasswordRecoveryPages").then((m) => ({default: m.ForgotPasswordPage})));
export const ResetPasswordPage = lazy(() =>
    import("../features/auth/PasswordRecoveryPages").then((m) => ({default: m.ResetPasswordPage})));

interface Preloadable {
    preload: () => Promise<unknown>;
}

const PRELOADS: [RegExp, Preloadable[]][] = [
    [/^\/app\/?$/, [PrivateLayout, OverviewPage]],
    [/^\/app\/crops\/?$/, [PrivateLayout, CropsPage]],
    [/^\/app\/crops\/[^/]+\/?$/, [PrivateLayout, CropDetailRoute]],
    [/^\/app\/control\/?$/, [PrivateLayout, ControlPage]],
    [/^\/app\/actions\/?$/, [PrivateLayout, ActionsPage]],
    [/^\/app\/learning\/?$/, [PrivateLayout, LearningPage]],
    [/^\/app\/notifications\/?$/, [PrivateLayout, NotificationsPage]],
    [/^\/app\/profile\/?$/, [PrivateLayout, ProfilePage]],
    [/^\/login\/?$/, [LoginPage]],
    [/^\/register\/?$/, [RegisterPage]],
    [/^\/forgot-password\/?$/, [ForgotPasswordPage]],
    [/^\/reset-password\/?$/, [ResetPasswordPage]],
];

/**
 * Pide el trozo de la ruta abierta en cuanto arranca el módulo principal, en paralelo con el idioma y la sesión, en vez
 * de esperar a que el router lo necesite: quita un viaje de red en serie antes de la primera pintura de la vista.
 */
export function preloadRoute(pathname: string) {
    const match = PRELOADS.find(([pattern]) => pattern.test(pathname));
    for (const component of match?.[1] ?? []) void component.preload().catch(() => undefined);
}
