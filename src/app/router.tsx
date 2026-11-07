import {Route, Router} from "@solidjs/router";
import {Suspense} from "solid-js";
import {PublicLayout} from "../components/layout/PublicLayout";
import {RedirectIfAuthenticated} from "../features/auth/RequireAuth";
import {LandingPage} from "../features/landing/LandingPage";
import {NotFoundPage} from "./NotFoundPage";
import {
    ActionsPage,
    ControlPage,
    CropDetailRoute,
    CropsPage,
    ForgotPasswordPage,
    LearningPage,
    LoginPage,
    NotificationsPage,
    OverviewPage,
    PrivateLayout,
    ProfilePage,
    RegisterPage,
    ResetPasswordPage,
} from "./routes";

export function AppRouter() {
    return (
        // La landing va en el trozo principal; el resto llega bajo demanda y este Suspense cubre la primera carga.
        <Router root={(props) => <Suspense>{props.children}</Suspense>}>
            <Route path="/app" component={PrivateLayout}>
                <Route path="/" component={OverviewPage}/>
                <Route path="/crops" component={CropsPage}/>
                <Route path="/crops/:cropId" component={CropDetailRoute}/>
                <Route path="/control" component={ControlPage}/>
                <Route path="/actions" component={ActionsPage}/>
                <Route path="/learning" component={LearningPage}/>
                <Route path="/notifications" component={NotificationsPage}/>
                <Route path="/profile" component={ProfilePage}/>
            </Route>
            <Route path="/" component={PublicLayout}>
                <Route path="/" component={LandingPage}/>
                <Route path="/login" component={() => <RedirectIfAuthenticated><LoginPage/></RedirectIfAuthenticated>}/>
                <Route path="/register" component={() => <RedirectIfAuthenticated><RegisterPage/></RedirectIfAuthenticated>}/>
                <Route path="/forgot-password" component={ForgotPasswordPage}/>
                <Route path="/reset-password" component={ResetPasswordPage}/>
                <Route path="*" component={NotFoundPage}/>
            </Route>
        </Router>
    );
}
