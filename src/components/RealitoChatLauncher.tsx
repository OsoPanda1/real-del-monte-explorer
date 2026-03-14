import { lazy, Suspense, useState } from "react";
import { MessageCircle } from "lucide-react";

const RealitoChat = lazy(() => import("@/components/RealitoChat"));

export default function RealitoChatLauncher() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl"
        aria-label="Abrir Realito AI"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Suspense fallback={null}>
      <RealitoChat initialOpen />
    </Suspense>
  );
}
