import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle,
  MapPin, Calendar, Utensils, MessageSquare, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sound effect using Web Audio API
const createNotificationSound = (type: NotificationType) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    
    switch (type) {
      case "success":
        // Happy major chord arpeggio
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
        
      case "error":
        // Low dissonant sound
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;
        
      case "warning":
        // Warning tone
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.setValueAtTime(440, now + 0.1);
        oscillator.frequency.setValueAtTime(349.23, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.setValueAtTime(0.1, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;
        
      case "info":
      default:
        // Gentle notification
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(587.33, now); // D5
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
  } catch (e) {
    console.log("Audio not supported");
  }
};

type NotificationType = "success" | "error" | "warning" | "info" | "event" | "food" | "place" | "message";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: React.ElementType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    if (soundEnabled) {
      createNotificationSound(notification.type);
    }
    
    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, [soundEnabled]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

// Notification icons
const notificationIcons: Record<NotificationType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  event: Calendar,
  food: Utensils,
  place: MapPin,
  message: MessageSquare,
};

const notificationColors: Record<NotificationType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  event: "bg-purple-500",
  food: "bg-gold",
  place: "bg-terracotta",
  message: "bg-primary",
};

function NotificationContainer() {
  const { notifications, removeNotification, soundEnabled, setSoundEnabled } = useNotifications();

  return (
    <>
      {/* Notification Bell Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        onClick={() => {}}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {notifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {notifications.length}
          </motion.span>
        )}
      </motion.button>

      {/* Sound Toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="fixed top-4 right-16 z-40 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? "Silenciar notificaciones" : "Activar sonido"}
      >
        {soundEnabled ? (
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </motion.button>

      {/* Notifications Stack */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-[380px] max-w-[calc(100vw-32px)]">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  const Icon = notification.icon || notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-background border border-border rounded-xl shadow-elevated overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
          {notification.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs"
              onClick={() => {
                notification.action?.onClick();
                onRemove();
              }}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
        className={`h-1 ${colorClass} opacity-50`}
      />
    </motion.div>
  );
}

// Predefined notifications for common scenarios
export const predefinedNotifications = {
  welcome: () => ({
    type: "info" as NotificationType,
    title: "¡Bienvenido a Real del Monte!",
    message: "Descubre la magia de este Pueblo Mágico único en el mundo.",
    icon: Heart,
  }),
  
  festivalReminder: (festivalName: string, date: string) => ({
    type: "event" as NotificationType,
    title: "Próximo Festival",
    message: `${festivalName} se aproxima. Marca en tu calendario: ${date}`,
    icon: Calendar,
  }),
  
  routeCompleted: (routeName: string) => ({
    type: "success" as NotificationType,
    title: "¡Ruta Completada!",
    message: `Has terminado la ${routeName}. Esperamos que hayas disfrutado la experiencia.`,
  }),
  
  newPlaceNearby: (placeName: string) => ({
    type: "place" as NotificationType,
    title: "Lugar Cercano",
    message: `Estás cerca de ${placeName}. ¿Te gustaría visitarlo?`,
    icon: MapPin,
  }),
  
  foodRecommendation: (dishName: string) => ({
    type: "food" as NotificationType,
    title: "Recomendación Gastronómica",
    message: `No te vayas sin probar ${dishName}, un platillo único de Real del Monte.`,
  }),
  
  weatherAlert: (condition: string) => ({
    type: "warning" as NotificationType,
    title: "Alerta Climática",
    message: `Se espera ${condition} en las próximas horas. Toma precauciones.`,
  }),
  
  messageReceived: (from: string) => ({
    type: "message" as NotificationType,
    title: "Nuevo Mensaje",
    message: `Has recibido un mensaje de ${from}`,
  }),
};

// Hook for common notification patterns
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();
  
  return {
    notifyWelcome: () => addNotification(predefinedNotifications.welcome()),
    notifyFestival: (name: string, date: string) => addNotification(predefinedNotifications.festivalReminder(name, date)),
    notifyRouteCompleted: (name: string) => addNotification(predefinedNotifications.routeCompleted(name)),
    notifyNearbyPlace: (name: string) => addNotification(predefinedNotifications.newPlaceNearby(name)),
    notifyFood: (name: string) => addNotification(predefinedNotifications.foodRecommendation(name)),
    notifyWeather: (condition: string) => addNotification(predefinedNotifications.weatherAlert(condition)),
    notifyMessage: (from: string) => addNotification(predefinedNotifications.messageReceived(from)),
    notifySuccess: (title: string, message: string) => addNotification({ type: "success", title, message }),
    notifyError: (title: string, message: string) => addNotification({ type: "error", title, message }),
    notifyInfo: (title: string, message: string) => addNotification({ type: "info", title, message }),
    notifyWarning: (title: string, message: string) => addNotification({ type: "warning", title, message }),
  };
}
