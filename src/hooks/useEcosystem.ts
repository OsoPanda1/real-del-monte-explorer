import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EcosystemGraph } from "@/data/ecosystem-types";

interface State {
  data: EcosystemGraph | null;
  loading: boolean;
  error: string | null;
}

export function useEcosystem() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase.functions.invoke<EcosystemGraph>(
          "ecosystem-sync",
          { method: "GET" },
        );
        if (cancelled) return;
        if (error) {
          setState({ data: null, loading: false, error: error.message });
          return;
        }
        if (!data) {
          setState({ data: null, loading: false, error: "Respuesta vacía" });
          return;
        }
        setState({ data, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
