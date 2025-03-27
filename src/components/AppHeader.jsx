"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import BatchPredictionIcon from "@mui/icons-material/BatchPrediction";
import CloseIcon from "@mui/icons-material/Close";
import signedOutAvatar from "../img/Avatar.svg";
import SideMenu from "./SideMenu";
import routes from "../routes";
import { useUser } from "../contexts/UserContext";
import { useCallback, useEffect } from "react";
import logo from "../img/seechat_logo.svg";
import Image from "next/image";

function AppHeader({ isOpen, toggleMenu, unsavedChanges }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname(); 

  // Check if the current route matches the profile route
  const isProfileRoute = pathname === routes.profile;

  // Check screen size to control drawer width and visibility
  const isLargeScreen = useMediaQuery("(min-width:1024px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:600px) and (max-width:1200px)",
  );

  // Set drawer width based on screen size
  const drawerWidth = isLargeScreen
    ? "20vw" // 20% for large screens
    : isMediumScreen
      ? "30vw" // 30% for medium screens between 600px and 1200px
      : "100vw"; // Full width for screens below 600px

  const handleBeforeUnload = useCallback(
    (event) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    },
    [unsavedChanges],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const customNavigate = useCallback(
    (to) => {
      if (unsavedChanges) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to leave?",
          )
        ) {
          router.push(to);
        }
      } else {
        router.push(to);
      }
    },
    [unsavedChanges, router],
  );

  const handleProfileClick = () => {
    if (isProfileRoute) {
      customNavigate(routes.ideas);
    } else {
      customNavigate(routes.profile);
    }
  };

  const handleClose = () => {
    customNavigate(routes.ideas);
  };

  const getInitials = (username) => {
    if (username) {
      return username.charAt(0).toUpperCase();
    } else {
      return "";
    }
  };
  const allowedRoutes = [routes.ideas, "/idea/", "/topic/"];
  const isAllowedRoute = allowedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{ zIndex: 1301, minHeight: 60, boxShadow: "none" }}
        style={{ backgroundColor: "#ffffff" }}
        className="border-b-2 border-gray-200"
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 60 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Only show menu toggle button on small and medium screens */}
            {!isLargeScreen && isAllowedRoute && (
              <IconButton
                data-testid="menuButton"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMenu}
              >
                {isOpen ? (
                  <CloseIcon className="text-blue-800" />
                ) : (
                  <BatchPredictionIcon className="text-blue-800" />
                )}
              </IconButton>
            )}
            <Link href={routes.ideas}>
              <Image src={logo} alt="seechat x ideas" className="w-[185px] p-0 m-0" />
            </Link>
          </Box>
          <IconButton
            id="profileButton"
            edge="end"
            color="inherit"
            aria-label="profile"
            onClick={handleProfileClick}
          >
            {isProfileRoute ? (
              <CloseIcon
                className="text-[#271948]"
                data-testid="profile-close-icon"
                onClick={handleClose}
              />
            ) : user ? (
              <Avatar sx={{ bgcolor: "#3F51B5", width: 40, height: 40 }}>
                <Typography sx={{ fontSize: 20 }}>
                  {getInitials(user.username)}
                </Typography>
              </Avatar>
            ) : (
              <Image
                src={signedOutAvatar}
                alt="Signed Out Avatar"
                width="30"
                height="30"
              />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer: conditional visibility */}
      {isAllowedRoute && (
        <Drawer
          anchor="left"
          open={isLargeScreen || isOpen} // Always open on large screens
          onClose={isLargeScreen ? null : toggleMenu} // Only closeable on small screens
          variant={isLargeScreen ? "persistent" : "temporary"} // Persistent on large screens
          PaperProps={{
            sx: {
              backgroundColor: "white", // Force visibility
              borderRight: "2px solid #ccc",
              width: "300px",
              height: "100vh",
            },
          }}
        >
          <SideMenu />
        </Drawer>
      )}

      {/* Adjust main content margin and padding */}
      <Box
        component="main"
        sx={{
          marginLeft:
            isLargeScreen && isAllowedRoute
              ? drawerWidth // Add margin for allowed routes
              : 0, // No margin for non-allowed routes
          paddingLeft: !isAllowedRoute ? 2 : 0,
          paddingRight: !isAllowedRoute ? 2 : 0,
          paddingTop: !isAllowedRoute ? 2 : 0,
          transition: "margin-left 0.3s ease",
        }}
      />
    </div>
  );
}

export default AppHeader;
