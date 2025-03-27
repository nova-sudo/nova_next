import { useState } from "react";
import { Route, Routes, useMatch, Navigate } from "react-router-dom";
import Ideation from "./main/IdeationPage";
import AppHeader from "./components/AppHeader";
import Profile from "./main/ProfilePage";
import BuyCredit from "./components/BuyCredit";
import LandingPage from "./main/LandingPage";
import SideMenu from "./components/SideMenu";
import TopicIdeasTable from "./main/TopicIdeasTablePage";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import * as reactRouterDom from "react-router-dom";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import routes from "./routes";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLandingPage = useMatch(routes.landingPage);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="mx-auto">
      <div className={!isLandingPage ? "flex" : ""}>
        {!isLandingPage && (
          <AppHeader isOpen={menuOpen} toggleMenu={toggleMenu} />
        )}
        <div className={!isLandingPage ? "flex-grow mt-16" : ""}>
          <Routes>
            {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [
              PasswordlessPreBuiltUI,
            ])}
            <Route path={routes.landingPage} element={<LandingPage />} />
            <Route path={routes.ideas} element={<Ideation />} />
            <Route //redirect old ideation route to new ideas route
              path={routes.ideas}
              element={<Navigate to={routes.ideas} />}
            />
            <Route path={routes.savedIdeas} element={<SideMenu />} />
            <Route path={routes.viewIdea} element={<Ideation />} />
            <Route
              path={routes.profile}
              element={
                <SessionAuth>
                  <Profile />
                </SessionAuth>
              }
            />
            <Route
              path={routes.buyCredit}
              element={
                <SessionAuth>
                  <BuyCredit />
                </SessionAuth>
              }
            />
            <Route path={routes.topics} element={<TopicIdeasTable />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
