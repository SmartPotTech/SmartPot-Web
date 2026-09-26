import { useEffect } from "react";

const BASE_TITLE = "SmartPot";

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

/** Título y robots por página: la landing se indexa; la app privada no. */
export function usePageMeta(title: string, { index = false, description }: { index?: boolean; description?: string } = {}) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : `${BASE_TITLE} — Monitoreo inteligente de cultivos hidropónicos`;
    setMeta("robots", index ? "index, follow" : "noindex, nofollow");
    if (description) setMeta("description", description);
  }, [title, index, description]);
}
