import {CheckCircle2, CircleSlash, XCircle} from "lucide-solid";
import {For} from "solid-js";
import type {BulkCommandResult} from "../../lib/api/types";
import {t} from "../../lib/i18n";
import {st} from "../../lib/i18n/serverText";

/** Resultado de una orden en bloque, cultivo por cultivo. */
export function BulkResultList(props: { result: BulkCommandResult }) {
    return (
        <div class="rounded-xl bg-surface p-3" role="status">
            <p class="text-sm font-semibold">
                {t("bulk.sent", {count: props.result.sent})}
                {props.result.skipped > 0 && t("bulk.skipped", {count: props.result.skipped})}
                {props.result.failed > 0 && t("bulk.failed", {count: props.result.failed})}
            </p>
            <ul class="mt-2 space-y-1.5">
                <For each={props.result.results}>
                    {(item) => (
                        <li class="flex items-start gap-2 text-sm">
                            <span class="mt-0.5">
                                {item.status === "SENT" ? <CheckCircle2 size={16} class="text-leaf-600"/>
                                    : item.status === "SKIPPED" ? <CircleSlash size={16} class="text-muted"/>
                                        : <XCircle size={16} class="text-danger-500"/>}
                            </span>
                            <span>
                                <span class="font-medium">{item.cropName}</span>
                                <span class="text-muted">
                                    {" · "}
                                    {item.status === "SENT" ? t("bulk.itemSent") : item.status === "SKIPPED" ? t("bulk.itemSkipped") : t("bulk.itemFailed")}
                                    {item.message ? `: ${st(item.message)}` : ""}
                                </span>
                            </span>
                        </li>
                    )}
                </For>
            </ul>
        </div>
    );
}
