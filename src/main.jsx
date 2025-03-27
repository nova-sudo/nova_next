import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import Session from "supertokens-auth-react/recipe/session";
import { BrowserRouter } from "react-router-dom";
import routes from "./routes.jsx";
import { PostHogProvider } from "posthog-js/react";
import { UserProvider } from "./contexts/UserContext";

SuperTokens.init({
  appInfo: {
    appName: "SeeChat",
    apiDomain: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`,
    websiteDomain: window.location.origin,
    apiBasePath: "",
    websiteBasePath: routes.auth,
  },
  getRedirectionURL: async (context) => {
    if (context.action === "SUCCESS" && context.newSessionCreated) {
      if (context.createdNewUser) {
        //default to profile so user can finish signup info
        return routes.profile;
      }
      if (context.redirectToPath !== undefined) {
        // we are navigating back to where the user was before they authenticated
        return context.redirectToPath;
      } else {
        return routes.ideas;
      }
    }

    //existing session/user, redirect to ideation
    if (context.action !== "TO_AUTH") {
      return routes.ideas;
    }

    //default to auth
    return undefined;
  },
  recipeList: [
    Passwordless.init({
      contactMethod: "EMAIL",
    }),
    Session.init(),
  ],
  style: `
    [data-supertokens~=container] {
        --palette-primary: 239, 68, 68;
    }
`,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SuperTokensWrapper>
      <PostHogProvider apiKey={process.env.NEXT_PUBLIC_POSTHOG_API_KEY}>
        <BrowserRouter>
          <UserProvider>
            <App />
          </UserProvider>
        </BrowserRouter>
      </PostHogProvider>
    </SuperTokensWrapper>
  </React.StrictMode>,
);
