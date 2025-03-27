"use client";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import Session from "supertokens-auth-react/recipe/session";
import { appInfo } from "./appInfo";
import { useRouter } from "next/navigation";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import routes from "../../src/routes";

const routerInfo: { router?: ReturnType<typeof useRouter>; pathName?: string } =
  {};

export function setRouter(
  router: ReturnType<typeof useRouter>,
  pathName: string,
) {
  routerInfo.router = router;
  routerInfo.pathName = pathName;
}

export const frontendConfig = (): SuperTokensConfig => {
  return {
    appInfo,
    getRedirectionURL: async (context) => {
      console.log(context);
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
    windowHandler: (orig) => {
      return {
        ...orig,
        location: {
          ...orig.location,
          getPathName: () => routerInfo.pathName!,
          assign: (url) => routerInfo.router!.push(url.toString()),
          setHref: (url) => routerInfo.router!.push(url.toString()),
        },
      };
    },
  };
};

export const PreBuiltUIList = [PasswordlessPreBuiltUI];
