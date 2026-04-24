import { ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import {
  EXTERNAL_PORTALS,
  PORTAL_CATEGORY_LABEL,
  type PortalCategory,
} from "@/data/external-portals";

const CATEGORY_ORDER: PortalCategory[] = [
  "identity",
  "research",
  "industry",
  "community",
  "operations",
];

export default function PortalsPanel() {
  return (
    <div className="space-y-10">
      {CATEGORY_ORDER.map((cat) => {
        const items = EXTERNAL_PORTALS.filter((p) => p.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <h3
              className="text-[10px] tracking-[0.25em] uppercase mb-4"
              style={{ color: "hsl(43,80%,55%)" }}
            >
              {PORTAL_CATEGORY_LABEL[cat]}
            </h3>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {items.map((portal) => {
                const hasUrl = Boolean(portal.url);
                const Tag = hasUrl ? "a" : "div";
                const tagProps = hasUrl
                  ? ({
                      href: portal.url!,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    } as const)
                  : ({} as const);
                return (
                  <Tag
                    key={portal.id}
                    {...tagProps}
                    className={`flex items-start gap-4 rounded-2xl p-5 transition-all ${
                      hasUrl ? "hover:-translate-y-0.5" : "opacity-70"
                    }`}
                    style={{
                      background: "hsl(220,45%,8%)",
                      border: "1px solid hsla(210,100%,55%,0.15)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: portal.verified
                          ? "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,100%,45%))"
                          : "hsla(43,80%,55%,0.15)",
                      }}
                    >
                      {portal.verified ? (
                        <ShieldCheck className="w-5 h-5 text-white" />
                      ) : (
                        <AlertCircle className="w-5 h-5" style={{ color: "hsl(43,80%,65%)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="font-medium text-sm leading-tight"
                          style={{ color: "hsl(0,0%,95%)" }}
                        >
                          {portal.label}
                        </h4>
                        {hasUrl && (
                          <ExternalLink
                            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                            style={{ color: "hsla(0,0%,100%,0.4)" }}
                          />
                        )}
                      </div>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: "hsla(0,0%,100%,0.55)" }}
                      >
                        {portal.subtitle}
                      </p>
                      {!portal.verified && portal.note && (
                        <p
                          className="mt-2 text-[11px] leading-relaxed"
                          style={{ color: "hsl(43,80%,65%)" }}
                        >
                          {portal.note}
                        </p>
                      )}
                    </div>
                  </Tag>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
