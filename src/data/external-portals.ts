// External portals of the TAMV / RDM federated ecosystem.
// Values marked with `verified: false` are placeholders — fill in the exact
// public identifier (ORCID iD, Zenodo community, ISNI, etc.) when available.
// Anything without a URL is rendered as "próximamente" in the UI instead of a
// broken link.

export type PortalCategory =
  | "identity"
  | "research"
  | "industry"
  | "community"
  | "operations";

export interface ExternalPortal {
  id: string;
  label: string;
  subtitle: string;
  url: string | null;
  category: PortalCategory;
  verified: boolean;
  note?: string;
}

export const PORTAL_CATEGORY_LABEL: Record<PortalCategory, string> = {
  identity: "Identidad pública",
  research: "Investigación abierta",
  industry: "Industria & estándares",
  community: "Comunidad federada",
  operations: "Operaciones",
};

export const EXTERNAL_PORTALS: ExternalPortal[] = [
  {
    id: "github",
    label: "GitHub · OsoPanda1",
    subtitle: "200 repos (103 públicos) — código fuente del ecosistema",
    url: "https://github.com/OsoPanda1",
    category: "identity",
    verified: true,
  },
  {
    id: "orcid",
    label: "ORCID · Edwin Oswaldo Castillo Trejo",
    subtitle: "Identificador académico persistente",
    url: null,
    category: "identity",
    verified: false,
    note: "Completa el iD de 16 dígitos en src/data/external-portals.ts",
  },
  {
    id: "isni",
    label: "ISNI · Anubis Villaseñor",
    subtitle: "Identificador internacional de nombre",
    url: null,
    category: "identity",
    verified: false,
    note: "Completa el ISNI de 16 dígitos en src/data/external-portals.ts",
  },
  {
    id: "zenodo",
    label: "Zenodo",
    subtitle: "Publicaciones y datasets versionados",
    url: "https://zenodo.org/search?q=%22Castillo%20Trejo%22",
    category: "research",
    verified: false,
    note: "Sustituir por la URL de la comunidad TAMV cuando exista",
  },
  {
    id: "frontiers",
    label: "Loop / Frontiers",
    subtitle: "Red científica abierta",
    url: null,
    category: "research",
    verified: false,
    note: "Añade tu URL de perfil Loop",
  },
  {
    id: "avixa",
    label: "AVIXA Xchange",
    subtitle: "Industria Pro-AV / integradores",
    url: "https://xchange.avixa.org/",
    category: "industry",
    verified: false,
    note: "Sustituir por URL de perfil",
  },
  {
    id: "odoo",
    label: "TAMV Online · Odoo",
    subtitle: "Operación del ecosistema civilizatorio federado",
    url: "https://tamvonline-oficial.odoo.com",
    category: "operations",
    verified: true,
  },
  {
    id: "blog",
    label: "TAMV Network · Blog",
    subtitle: "TAMV MD-X4 — ecosistema que rompe paradigmas",
    url: "https://tamvonlinenetwork.blogspot.com",
    category: "community",
    verified: true,
  },
  {
    id: "groups",
    label: "TAMV Online LATAM · Groups.io",
    subtitle: "Lista de distribución federada",
    url: "https://groups.io/g/tamvonline-ecosistem-latam",
    category: "community",
    verified: false,
    note: "Ajustar a la URL exacta del grupo si es distinta",
  },
];
