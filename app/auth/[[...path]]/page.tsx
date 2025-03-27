"use client";
import { useEffect, useState } from "react";
import SuperTokens from "supertokens-auth-react/ui";
import { PreBuiltUIList } from "../../config/frontend";
import { initializeSuperTokens } from "../../../src/components/SupertokensInit";

export default function Auth() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeSuperTokens();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return SuperTokens.getRoutingComponent(PreBuiltUIList);
}
