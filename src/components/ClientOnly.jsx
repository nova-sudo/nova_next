"use client";
import { useEffect, useState } from "react";

const ClientOnly = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent rendering on SSR

  return children;
};

export default ClientOnly;
