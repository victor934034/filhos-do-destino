"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Fade + leve subida ao entrar na viewport — usado em títulos e blocos de seção. */
export function EntradaSuave({
  children,
  atraso = 0,
  className = "",
}: {
  children: ReactNode;
  atraso?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: atraso, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
