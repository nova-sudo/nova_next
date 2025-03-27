"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import routes from "../routes";
import { useUser, signOut } from "../contexts/UserContext";
import { usePostHog } from "posthog-js/react";
import AliasInput from "../components/Profile/AliasInput";
import UserAgreements from "../components/Profile/UserAgreements";
import Notification from "../components/Notification";
import AppHeader from "../components/AppHeader";
import PrivateSwitch from "../components/PrivateSwitch";
import Slider from "@mui/material/Slider";

function Profile() {
  const { user, userLoading } = useUser();
  const posthog = usePostHog();
  useEffect(() => {
    // Only runs on the client after mounting
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      loaded: (posthog) => {
        console.log("PostHog loaded on domain:", window.location.hostname);
      },
    });
  }, [posthog]);

  const unlimitedCredits = posthog.getFeatureFlagPayload("unlimited-credits");
  const [metadata, setMetadata] = useState({
    fields_of_study: [],
    papers_credibility_scores: [],
  });
  const [settings, setSettings] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const initialSettingsRef = useRef(null);
  const router = useRouter(); // router is an object with methods like push, replace, etc.

  const marks = Array.from({ length: 55 }, (_, i) => {
    let label;
    if (i === 0 || i === 25 || i === 50) {
      label = `${i}`;
    } else if (i % 5 === 0) {
      label = "|";
    } else {
      label = "'";
    }
    return { value: i, label };
  });

  marks.push({
    value: 55,
    label: (
      <svg
        className="mt-1"
        width="22.5"
        height="12"
        viewBox="0 0 15 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.70833 7.21061C2.81389 7.21061 2.05556 6.8995 1.43333 6.27728C0.811111 5.65506 0.5 4.89672 0.5 4.00228C0.5 3.10783 0.811111 2.3495 1.43333 1.72728C2.05556 1.10506 2.81389 0.793945 3.70833 0.793945C4.06806 0.793945 4.41319 0.85714 4.74375 0.983529C5.07431 1.10992 5.37083 1.28978 5.63333 1.52311L6.625 2.42728L5.75 3.21478L4.84583 2.39811C4.69028 2.262 4.51528 2.15506 4.32083 2.07728C4.12639 1.9995 3.92222 1.96061 3.70833 1.96061C3.14444 1.96061 2.66319 2.15992 2.26458 2.55853C1.86597 2.95714 1.66667 3.43839 1.66667 4.00228C1.66667 4.56617 1.86597 5.04742 2.26458 5.44603C2.66319 5.84464 3.14444 6.04395 3.70833 6.04395C3.92222 6.04395 4.12639 6.00506 4.32083 5.92728C4.51528 5.8495 4.69028 5.74256 4.84583 5.60645L9.36667 1.52311C9.62917 1.28978 9.92569 1.10992 10.2562 0.983529C10.5868 0.85714 10.9319 0.793945 11.2917 0.793945C12.1861 0.793945 12.9444 1.10506 13.5667 1.72728C14.1889 2.3495 14.5 3.10783 14.5 4.00228C14.5 4.89672 14.1889 5.65506 13.5667 6.27728C12.9444 6.8995 12.1861 7.21061 11.2917 7.21061C10.9319 7.21061 10.5868 7.14742 10.2562 7.02103C9.92569 6.89464 9.62917 6.71478 9.36667 6.48145L8.375 5.57728L9.25 4.78978L10.1542 5.60645C10.3097 5.74256 10.4847 5.8495 10.6792 5.92728C10.8736 6.00506 11.0778 6.04395 11.2917 6.04395C11.8556 6.04395 12.3368 5.84464 12.7354 5.44603C13.134 5.04742 13.3333 4.56617 13.3333 4.00228C13.3333 3.43839 13.134 2.95714 12.7354 2.55853C12.3368 2.15992 11.8556 1.96061 11.2917 1.96061C11.0778 1.96061 10.8736 1.9995 10.6792 2.07728C10.4847 2.15506 10.3097 2.262 10.1542 2.39811L5.63333 6.48145C5.37083 6.71478 5.07431 6.89464 4.74375 7.02103C4.41319 7.14742 4.06806 7.21061 3.70833 7.21061Z"
          fill="#9498A5"
        />
      </svg>
    ),
  });

  console.log(marks);

  const papersRecencyOptions = [
    { value: 5, label: "5 Years" },
    { value: 10, label: "10 Years" },
    { value: 55, label: "No Limit" },
  ];

  function valuetext(value) {
    return `${value}`;
  }

  useEffect(() => {
    if (user && !userLoading) {
      setSettings(user.settings);
      setLegalAgreed(user.settings.agree_to_legal_docs);
      initialSettingsRef.current = JSON.stringify(user.settings);
    }
  }, [userLoading, user]);

  useEffect(() => {
    if (settings && initialSettingsRef.current) {
      const hasChanges =
        JSON.stringify(settings) !== initialSettingsRef.current;
      setUnsavedChanges(hasChanges);
    }
  }, [settings]);

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

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const metadataResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/metadata`,
        );
        setMetadata(metadataResponse.data);
      } catch (error) {
        setNotification({
          show: true,
          message: "Error fetching metadata",
          type: "error",
        });
      }
    };
    fetchMetaData();
  }, []);

  const customNavigate = useCallback(
    (to) => {
      if (unsavedChanges) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to leave?",
          )
        ) {
          router.push(to); // Use router.push instead of router(to)
        }
      } else {
        router.push(to); // Use router.push instead of router(to)
      }
    },
    [unsavedChanges, router],
  );

  const validateAlias = (alias) => {
    if (alias.length < 5 || alias.length > 20) {
      return "Alias must be between 5 and 20 characters long.";
    }
    if (!/^[a-z0-9]+$/.test(alias)) {
      return "Alias can only contain lowercase letters and numbers.";
    }
    return "";
  };

  const checkAliasUniqueness = async (alias) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/check-alias-available?alias=${alias}`,
      );
      return response.data.is_unique;
    } catch (error) {
      return false;
    }
  };

  const updateSettingsField = (fieldName, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [fieldName]: value,
    }));
  };

  const handleLegalAgreed = (agreed) => {
    setLegalAgreed(agreed);
    setSettings((prevSettings) => ({
      ...prevSettings,
      agree_to_legal_docs: agreed,
    }));
  };

  const handleStartPlaying = async () => {
    setIsProcessing(true);
    if (!legalAgreed) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setNotification({
        show: true,
        message: "You must agree to legal documents before generating ideas.",
        type: "error",
      });
      return;
    }

    const aliasValidationError = validateAlias(settings.alias);
    if (aliasValidationError !== "") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsProcessing(false);
      setNotification({
        show: true,
        message: aliasValidationError,
        type: "error",
      });
      return;
    }

    try {
      const isUnique = await checkAliasUniqueness(settings.alias);
      if (!isUnique) {
        setIsProcessing(false);
        setNotification({
          show: true,
          message: "Alias is already taken. Please choose another one.",
          type: "error",
        });
        return;
      }

      const payload = {
        settings: {
          ...settings,
        },
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/settings`,
        payload,
      );

      if (response.status === 200) {
        setNotification({
          show: true,
          message: "Settings saved successfully.",
          type: "success",
        });
        setUnsavedChanges(false);
        initialSettingsRef.current = JSON.stringify(settings);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push(routes.ideas); // Use router.push instead of router(routes.ideas)
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsProcessing(false);
      setNotification({
        show: true,
        message: "Failed to save settings.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyCredit = () => {
    customNavigate(routes.buyCredit);
  };

  const handleLogout = async () => {
    if (unsavedChanges) {
      const shouldLogout = window.confirm(
        "You have unsaved changes. Are you sure you want to log out?",
      );
      if (!shouldLogout) {
        return;
      }
    }
    try {
      posthog.reset();
      await signOut();
      router.push(routes.auth); // Use router.push instead of router(routes.auth)
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  if (userLoading || !metadata || !settings || !user) {
    return (
      <div className="p-5">
        <Skeleton height={20} width={100} count={1} />
        <br />
        <Skeleton height={20} width={250} count={1} />
        <Skeleton height={20} width={250} count={1} />
        <Skeleton height={20} width={150} count={1} />
        <br />
        <Skeleton height={20} width={150} count={1} />
        <Skeleton height={60} count={4} />
        <br />
        <Skeleton height={40} count={3} />
      </div>
    );
  }

  return (
    <>
      <AppHeader unsavedChanges={unsavedChanges} />
      <div className="max-w-7xl mx-auto">
        <div className="font-bold">Profile info</div>
        <p className="mt-4">User ID: {user.username}</p>
        {!unlimitedCredits && (
          <>
            <p className="div">Available credits: {user.credits}</p>
            <button
              className="text-sm font-semibold text-red-400"
              onClick={handleBuyCredit}
            >
              Buy more credits
            </button>
          </>
        )}
        <div className="mt-6">
          <div className="font-bold">Profile settings</div>
          <Box className="pt-4" component="form" noValidate autoComplete="off">
            <AliasInput
              initialAlias={settings.alias}
              onAliasChange={(newAlias) => {
                updateSettingsField("alias", newAlias);
              }}
            />
            <div className="mt-4">
              <TextField
                id="outlined-select-field-of-study-1"
                select
                label="Field of study 1"
                value={settings.field_of_study_1}
                onChange={(event) =>
                  updateSettingsField("field_of_study_1", event.target.value)
                }
                className="w-full"
              >
                {metadata.fields_of_study.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="mt-4">
              <TextField
                id="outlined-select-field-of-study-2"
                select
                label="Field of study 2"
                value={settings.field_of_study_2}
                onChange={(event) =>
                  updateSettingsField("field_of_study_2", event.target.value)
                }
                className="w-full"
              >
                {metadata.fields_of_study.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="mt-4">
              <TextField
                id="outlined-select-paper-credibility"
                select
                label="Paper credibility"
                value={settings.papers_credibility}
                onChange={(event) =>
                  updateSettingsField("papers_credibility", event.target.value)
                }
                className="w-full"
              >
                {metadata.papers_credibility_scores.map((score) => (
                  <MenuItem key={score} value={score}>
                    {`Only use top ${100 * score}% papers`}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <hr className="text-black h-[2px] rounded-full w-full bg-gray-300 my-7" />
            <div>
              <h1 className="text-md font-bold">Paper recency</h1>
              <Slider
                data-testid="paper-recency-slider"
                value={settings.papers_recency}
                onChange={(event, newValue) =>
                  updateSettingsField("papers_recency", newValue)
                }
                className="mt-10"
                aria-label="Always visible"
                defaultValue={50}
                step={1}
                max={55}
                valueLabelDisplay="on"
                valueLabelFormat={(value) =>
                  value === 55 ? (
                    <div>
                      <svg
                        width="22.5"
                        height="12"
                        viewBox="0 0 15 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.70833 7.21061C2.81389 7.21061 2.05556 6.8995 1.43333 6.27728C0.811111 5.65506 0.5 4.89672 0.5 4.00228C0.5 3.10783 0.811111 2.3495 1.43333 1.72728C2.05556 1.10506 2.81389 0.793945 3.70833 0.793945C4.06806 0.793945 4.41319 0.85714 4.74375 0.983529C5.07431 1.10992 5.37083 1.28978 5.63333 1.52311L6.625 2.42728L5.75 3.21478L4.84583 2.39811C4.69028 2.262 4.51528 2.15506 4.32083 2.07728C4.12639 1.9995 3.92222 1.96061 3.70833 1.96061C3.14444 1.96061 2.66319 2.15992 2.26458 2.55853C1.86597 2.95714 1.66667 3.43839 1.66667 4.00228C1.66667 4.56617 1.86597 5.04742 2.26458 5.44603C2.66319 5.84464 3.14444 6.04395 3.70833 6.04395C3.92222 6.04395 4.12639 6.00506 4.32083 5.92728C4.51528 5.8495 4.69028 5.74256 4.84583 5.60645L9.36667 1.52311C9.62917 1.28978 9.92569 1.10992 10.2562 0.983529C10.5868 0.85714 10.9319 0.793945 11.2917 0.793945C12.1861 0.793945 12.9444 1.10506 13.5667 1.72728C14.1889 2.3495 14.5 3.10783 14.5 4.00228C14.5 4.89672 14.1889 5.65506 13.5667 6.27728C12.9444 6.8995 12.1861 7.21061 11.2917 7.21061C10.9319 7.21061 10.5868 7.14742 10.2562 7.02103C9.92569 6.89464 9.62917 6.71478 9.36667 6.48145L8.375 5.57728L9.25 4.78978L10.1542 5.60645C10.3097 5.74256 10.4847 5.8495 10.6792 5.92728C10.8736 6.00506 11.0778 6.04395 11.2917 6.04395C11.8556 6.04395 12.3368 5.84464 12.7354 5.44603C13.134 5.04742 13.3333 4.56617 13.3333 4.00228C13.3333 3.43839 13.134 2.95714 12.7354 2.55853C12.3368 2.15992 11.8556 1.96061 11.2917 1.96061C11.0778 1.96061 10.8736 1.9995 10.6792 2.07728C10.4847 2.15506 10.3097 2.262 10.1542 2.39811L5.63333 6.48145C5.37083 6.71478 5.07431 6.89464 4.74375 7.02103C4.41319 7.14742 4.06806 7.21061 3.70833 7.21061Z"
                          fill="#ffffff"
                        />
                      </svg>
                    </div>
                  ) : (
                    value
                  )
                }
                marks={marks}
                sx={{
                  color: "#3F51B5",
                  height: 4,
                  "& .MuiSlider-track": {
                    border: "none",
                  },
                  "& .MuiSlider-thumb": {
                    height: 24,
                    width: 24,
                    backgroundColor: "#fff",
                    border: "2px solid currentColor",
                    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                      boxShadow: "inherit",
                    },
                    "&::before": {
                      display: "none",
                    },
                  },
                }}
              />
              <div className="flex gap-0 h-12 rounded-sm ring-2 ring-[#271948] mt-5 overflow-hidden">
                {papersRecencyOptions.map((option, index) => (
                  <a
                    key={option.value}
                    className={`flex flex-1 font-semibold items-center justify-center ${
                      index < papersRecencyOptions.length - 1
                        ? "border-r-2"
                        : "border-r-0"
                    } border-[#271948] text-black hover:bg-red-100 transition ${
                      settings.papers_recency === option.value
                        ? "bg-red-200"
                        : ""
                    }`}
                    data-testid={`recencyButton-${option.value}`}
                    onClick={() =>
                      updateSettingsField("papers_recency", option.value)
                    }
                  >
                    {option.label}
                  </a>
                ))}
              </div>
            </div>
            <hr className="text-black h-[2px] rounded-full w-full bg-gray-300 my-5" />
            <div className="">
              <p className="font-bold">Default idea privacy settings</p>
              <PrivateSwitch
                id="privateSwitch"
                isPrivate={settings.ideas_private_by_default}
                label="Private"
                onChange={(isPrivate) => {
                  updateSettingsField("ideas_private_by_default", isPrivate);
                }}
              />
            </div>
          </Box>
        </div>

        <UserAgreements agreed={legalAgreed} onAgreed={handleLegalAgreed} />

        <div className="mt-4 flex flex-col pb-5 sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={handleStartPlaying}
            disabled={isProcessing}
            className={`flex justify-center items-center flex-1 rounded bg-red-500 px-4 py-3 sm:py-2 sm:h-12 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            id="startPlayingButton"
          >
            {isProcessing ? "Processing..." : "Start Playing"}
          </button>

          {!unlimitedCredits && (
            <button
              onClick={handleBuyCredit}
              className="flex-1 rounded bg-white ring-1 ring-red-400 px-4 py-3 sm:py-2 sm:h-12 text-xs font-semibold text-red-400 shadow-sm hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get more credits
            </button>
          )}

          <button
            type="button"
            data-testid="profile-logout-button"
            onClick={handleLogout}
            disabled={isNavigating}
            className={`flex justify-center items-center flex-1 rounded bg-white ring-1 ring-red-400 px-4 py-3 sm:py-2 sm:h-12 text-xs font-semibold text-red-400 shadow-sm hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              isNavigating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Log out
          </button>
        </div>
      </div>

      <Notification
        notification={notification}
        setNotification={setNotification}
      />
    </>
  );
}

export default Profile;
