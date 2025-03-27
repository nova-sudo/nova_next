"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { usePathname } from "next/navigation";
import { signOut as superTokensSignout } from "supertokens-web-js/recipe/session";
import { usePostHog } from "posthog-js/react";

const UserContext = createContext();



export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const session = useSessionContext();
  const pathname = usePathname(); 
  const posthog = usePostHog();

  useEffect(() => {
    const fetchUser = async () => {
      // Don't fetch user info if on an auth page to avoid double requests
      if (pathname.includes("auth")) {
        // ✅ Fix: Use `pathname` instead of `router.pathname`
        setUserLoading(false);
        return;
      }

      setUserLoading(true);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/info`,
        );
        const user = response.data;
        setUser(user);
        posthog.identify(user._id);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [session, pathname, posthog]); 
  return (
    <UserContext.Provider value={{ user, userLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export const signOut = superTokensSignout;
