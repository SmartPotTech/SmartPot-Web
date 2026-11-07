import {type RouteSectionProps, useLocation} from "@solidjs/router";
import {Match, Suspense, Switch} from "solid-js";
import {AppShell} from "../components/layout/AppShell";
import {CropDetailSkeleton, CropsGridSkeleton, OverviewSkeleton, SkeletonCard} from "../components/ui/Skeleton";
import {RequireAuth} from "../features/auth/RequireAuth";

/** Mientras baja el trozo de una vista, el cromo de la app se queda y el contenido muestra su esqueleto. */
function RouteSkeleton() {
    const location = useLocation();
    const path = () => location.pathname.replace(/\/+$/, "") || "/app";
    return (
        <Switch fallback={<div class="space-y-4"><SkeletonCard height="h-40"/><SkeletonCard height="h-72"/></div>}>
            <Match when={path() === "/app"}><OverviewSkeleton/></Match>
            <Match when={path() === "/app/crops"}><CropsGridSkeleton/></Match>
            <Match when={path().startsWith("/app/crops/")}><CropDetailSkeleton/></Match>
        </Switch>
    );
}

export default function PrivateLayout(props: RouteSectionProps) {
    return (
        <RequireAuth>
            <AppShell>
                <Suspense fallback={<RouteSkeleton/>}>{props.children}</Suspense>
            </AppShell>
        </RequireAuth>
    );
}
