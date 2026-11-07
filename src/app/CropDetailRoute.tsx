import {useParams} from "@solidjs/router";
import {Show} from "solid-js";
import {CropDetailSkeleton} from "../components/ui/Skeleton";
import CropDetailPage from "../features/crops/CropDetailPage";

/**
 * La ruta se remonta al cambiar de cultivo. Sin esto, Solid reutiliza el componente y conserva los recursos,
 * los temporizadores y los follow-ups del cultivo anterior mientras llegan los datos del nuevo.
 */
export default function CropDetailRoute() {
    const params = useParams<{ cropId: string }>();
    return (
        <Show when={params.cropId} keyed fallback={<CropDetailSkeleton/>}>
            {(cropId) => <CropDetailPage cropId={cropId}/>}
        </Show>
    );
}
