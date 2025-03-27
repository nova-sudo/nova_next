"use client";
import React, { useState, useEffect } from "react";
import { SuperTokensWrapper } from "supertokens-auth-react";
import SuperTokensReact from "supertokens-auth-react";
import { frontendConfig, setRouter } from "../../app/config/frontend";
import { usePathname, useRouter } from "next/navigation";

// Initialize SuperTokens only once on the client side
if (typeof window !== "undefined") {
  try {
    SuperTokensReact.init(frontendConfig());
  } catch (err) {
    // Ignore if already initialized
  }
}

export const SuperTokensProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setRouter(router, pathname || window.location.pathname);
    setInitialized(true);
  }, [router, pathname]);

  if (!initialized) return null;

  return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
};
