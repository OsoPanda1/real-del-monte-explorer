import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Loader2 } from "lucide-react";

const RealitoChat = lazy(() => import("@/components/RealitoChat"));

export default function RealitoChatLauncher() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return (
      <motion.button
        onClick={() => setEnabled(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl"
        aria-label="Abrir Realito AI"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute inset-0 rounded-full animate-ping bg-amber-500/30 pointer-events-none" />
      </motion.button>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <RealitoChat initialOpen />
    </Suspense>
  );
}
