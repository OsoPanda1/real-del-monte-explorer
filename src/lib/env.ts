import { z } from "zod";

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
  VITE_API_URL: z.string().url().optional(),
  VITE_WS_URL: z.string().url().optional(),
  MODE: z.string().optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

type EnvParse = {
  valid: boolean;
  issues: string[];
};

const parseEnv = (): EnvParse => {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  return { valid: true, issues: [] };
};

const requiredSupabaseVars = (): string[] => {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    missing.push("VITE_SUPABASE_ANON_KEY|VITE_SUPABASE_PUBLISHABLE_KEY");
  }
  return missing;
};

const parsed = parseEnv();
const missingSupabase = requiredSupabaseVars();

export const envDiagnostics = {
  validShape: parsed.valid,
  issues: parsed.issues,
  missingSupabase,
  isProduction: Boolean(import.meta.env.PROD),
};

export const getSupabaseEnvOrThrow = () => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = import.meta.env.VITE_SUPABASE_URL;

  if (missingSupabase.length > 0) {
    const message =
      `[ENV] Configuración incompleta. Faltan: ${missingSupabase.join(", ")}.` +
      ` Revisa variables de entorno del proyecto.`;
    if (import.meta.env.PROD) {
      throw new Error(message);
    }
    console.warn(message);
  }

  if (!parsed.valid) {
    const issueText = parsed.issues.join(" | ");
    const message = `[ENV] Variables inválidas: ${issueText}`;
    if (import.meta.env.PROD) {
      throw new Error(message);
    }
    console.warn(message);
  }

  return {
    url: url ?? "https://example.supabase.co",
    anonKey: anonKey ?? "public-anon-key-placeholder",
    configured: missingSupabase.length === 0 && parsed.valid,
  };
};
