import {useParams} from "@solidjs/router";
import {lazy, Show, Suspense} from "solid-js";
import {CropDetailSkeleton} from "../components/ui/Skeleton";

// El detalle trae las gráficas: se carga aparte para que la landing y el ingreso pesen menos.
const CropDetailPage = lazy(() => import("../features/crops/CropDetailPage"));

/**
 * La ruta se remonta al cambiar de cultivo. Sin esto, Solid reutiliza el componente y conserva los recursos,
 * los temporizadores y los follow-ups del cultivo anterior mientras llegan los datos del nuevo.
 */
export function LazyCropDetailPage() {
    const params = useParams<{ cropId: string }>();
    return (
        <Suspense fallback={<CropDetailSkeleton/>}>
            <Show when={params.cropId} keyed fallback={<CropDetailSkeleton/>}>
                {(cropId) => <CropDetailPage cropId={cropId}/>}
            </Show>
        </Suspense>
    );
}
