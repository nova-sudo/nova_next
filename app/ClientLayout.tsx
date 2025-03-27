"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "../src/components/AppHeader";
import routes from "../src/routes";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathName = usePathname();
  const isLandingPage = pathName == routes.landingPage;

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className={!isLandingPage ? "flex-grow mt-16" : ""}>
      {!isLandingPage && (
        <AppHeader
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          unsavedChanges={false}
        />
      )}
      {children}
    </div>
  );
}
