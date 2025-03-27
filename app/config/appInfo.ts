"use client";
import routes from "@/routes.jsx";

export const appInfo = {
  appName: "SeeChat",
  apiDomain: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`,
  websiteDomain: typeof window !== "undefined" ? window.location.origin : "",
  apiBasePath: "",
  websiteBasePath: routes.auth,
};
