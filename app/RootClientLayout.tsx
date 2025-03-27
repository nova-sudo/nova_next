"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import routes from "../src/routes";

const AppHeader = dynamic(() => import("../src/components/AppHeader"), {
  ssr: false,
});

export default function RootClientLayout({
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
