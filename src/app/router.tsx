import { createBrowserRouter } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { PublicLayout } from "../components/layout/PublicLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { ForgotPasswordPage, ResetPasswordPage } from "../features/auth/PasswordRecoveryPages";
import { RegisterPage } from "../features/auth/RegisterPage";
import { RedirectIfAuthenticated, RequireAuth } from "../features/auth/RequireAuth";
import { DashboardPage } from "../features/crops/DashboardPage";
import { LandingPage } from "../features/landing/LandingPage";
import { NotificationsPage } from "../features/notifications/NotificationsPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { LazyCropDetailPage } from "./LazyCropDetailPage";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated> },
      { path: "register", element: <RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "app",
    element: <RequireAuth><AppShell /></RequireAuth>,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "crops/:cropId",
        element: <LazyCropDetailPage />,
      },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
