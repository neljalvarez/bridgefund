/**
 * Multilingual readiness — a minimal message catalogue.
 * Only navigation chrome is translated in this prototype; page content stays
 * in English. Production would move to a full i18n framework (e.g. next-intl)
 * with professionally reviewed translations per market.
 */
export type Locale = "en" | "fr" | "es";
export const LOCALES: Record<Locale, string> = { en: "English", fr: "Français (preview)", es: "Español (preview)" };

const CATALOG: Record<Exclude<Locale, "en">, Record<string, string>> = {
  fr: {
    Overview: "Aperçu",
    Dashboard: "Tableau de bord",
    "Opportunity tracker": "Suivi des opportunités",
    "Resolve barriers": "Lever les obstacles",
    "Barrier scanner": "Analyse des obstacles",
    "Assistance requests": "Demandes d'aide",
    Tools: "Outils",
    "Cost calculator": "Calculateur de coûts",
    "Fee waiver finder": "Exonérations de frais",
    "Resource Rescue": "Prêt de ressources",
    Sponsor: "Mécène",
    "Opportunity marketplace": "Besoins vérifiés",
    "Impact planner": "Planificateur d'impact",
    Institution: "Établissement",
    "Urgent cases": "Cas urgents",
    "Needs matching": "Mise en relation",
    Operations: "Opérations",
    "Lending inventory": "Inventaire de prêt",
    "Barrier analytics": "Analyse des obstacles",
    "Audit log": "Journal d'audit",
    Account: "Compte",
    Notifications: "Notifications",
    "Activity history": "Historique",
    Settings: "Paramètres",
  },
  es: {
    Overview: "Resumen",
    Dashboard: "Panel",
    "Opportunity tracker": "Seguimiento de oportunidades",
    "Resolve barriers": "Resolver barreras",
    "Barrier scanner": "Escáner de barreras",
    "Assistance requests": "Solicitudes de ayuda",
    Tools: "Herramientas",
    "Cost calculator": "Calculadora de costos",
    "Fee waiver finder": "Exenciones de pago",
    "Resource Rescue": "Préstamo de recursos",
    Sponsor: "Patrocinador",
    "Opportunity marketplace": "Necesidades verificadas",
    "Impact planner": "Planificador de impacto",
    Institution: "Institución",
    "Urgent cases": "Casos urgentes",
    "Needs matching": "Emparejamiento",
    Operations: "Operaciones",
    "Lending inventory": "Inventario de préstamo",
    "Barrier analytics": "Análisis de barreras",
    "Audit log": "Registro de auditoría",
    Account: "Cuenta",
    Notifications: "Notificaciones",
    "Activity history": "Historial",
    Settings: "Configuración",
  },
};

export const t = (locale: Locale, key: string) => (locale === "en" ? key : (CATALOG[locale][key] ?? key));
