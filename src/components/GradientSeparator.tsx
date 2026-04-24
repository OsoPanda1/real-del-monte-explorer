import { motion } from "framer-motion";

const GradientSeparator = ({ className = "", animated = false }: { className?: string; animated?: boolean }) => {
  if (animated) {
    return (
      <div className={`relative w-full my-0 ${className}`}>
        <div className="separator-animated w-full" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: "hsl(43,80%,55%)", boxShadow: "0 0 12px hsla(43,80%,55%,0.6)" }}
          animate={{ x: ["-50vw", "50vw"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return <div className={`separator-gradient w-full my-0 ${className}`} />;
};

export default GradientSeparator;
