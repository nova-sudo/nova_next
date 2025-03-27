import SuperTokensReact from "supertokens-auth-react";
import { frontendConfig } from "../../app/config/frontend";

let initialized = false;

export function initializeSuperTokens() {
  if (!initialized) {
    SuperTokensReact.init(frontendConfig());
    initialized = true;
  }
}