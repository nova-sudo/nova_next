"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import LastModified from "../components/LastModified";
import ReactMarkdown from "react-markdown"; // New previewer
import rehypeSanitize from "rehype-sanitize";
import "easymde/dist/easymde.min.css";
import Citations from "../components/Idea/Citations";
import Notification from "../components/Notification";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReplyIcon from "@mui/icons-material/Reply";
import Link from "next/link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PeerReviewIcon from "@mui/icons-material/SpeakerNotes";
import SharePopup from "../components/ShareSocial/SharePopUp";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import routes from "../routes";
import Feedback from "../components/Feedback";
import { useUser } from "../contexts/UserContext";
import PrivateSwitch from "../components/PrivateSwitch";
import { usePostHog } from "posthog-js/react";
import { VoteUpDown, VOTE } from "../components/Idea/VoteUpDown";
import PeerReviews from "../components/Idea/PeerReviews";
import posthog from "posthog-js";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AuthPromptPopup from "../components/Idea/AuthPromptPopup";
import BuyCreditsPopup from "../components/BuyCreditsPopup ";
import { useRouter } from "next/navigation"; // Note: 'next/router', not 'next/navigation'
import copy from "copy-to-clipboard";
const AUTO_SAVE_INTERVAL = 4000; // 4 seconds
const MAX_NUMBER_OF_TOPICS = 3;
const GENERIC_ERROR =
  "An error occurred during the hypothesis creation. Please report this bug on 'Give Feedback' Button";
const MAX_NUMBER_OF_TOPIC_CHARACTERS = 30;
const TiptapEditor = dynamic(() => import("../components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] bg-gray-50 animate-pulse rounded-md"></div>
  ),
});

function splitChunk(str) {
  const regex = /(?<=\})(?=\{"data":)/g;
  return str.split(regex);
}

function Ideation({ ideaId }) {
  const router = useRouter();

  const posthog = usePostHog();
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      loaded: (posthog) => {
        console.log("PostHog loaded on domain:", window.location.hostname);
      },
    });
  }, [posthog]);
  const ideasPrivateByDefault = posthog.getFeatureFlagPayload(
    "ideas-private-by-default",
  );
  const unlimitedCredits = posthog.getFeatureFlagPayload("unlimited-credits");

  const { user, userLoading } = useUser();
  const [credits, setCredits] = useState(null);

  const [ideaIsLoading, setIdeaIsLoading] = useState(false);
  const [userVoteIsLoading, setUserVoteIsLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [literatureReview, setLiteratureReview] = useState(null);
  const [ideaSummary, setIdeaSummary] = useState(null);
  const [title, setTitle] = useState(null);
  const [metaDescription, setMetaDescription] = useState(null);
  const [metaKeywords, setMetaKeywords] = useState(null);
  const [background, setBackground] = useState([]);
  const [isPrivate, setIsPrivate] = useState();
  const [currentTopic, setCurrentTopic] = useState("");
  const [, setAbortController] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLiteratureReview, setShowLiteratureReview] = useState(false);
  const [showUsedKeyReferences, setShowUsedKeyReferences] = useState(false);
  const [showCurrentTopic, setShowCurrentTopic] = useState(false);
  const [editFields, setEditFields] = useState({
    title: "",
    authors: "",
    summary: "",
  });
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const timerRef = useRef(null);
  const [ideaUserID, setIdeaUserID] = useState(null);
  const [userCanEdit, setUserCanEdit] = useState(false);
  const [showProblemInfo, setShowProblemInfo] = useState(false);
  const problemInfoTimerRef = useRef(null);
  const [showInitialBox, setShowInitialBox] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [savingUserVote, setSavingUserVote] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSmallScreen(window.innerWidth < 600);

      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  const [IdeaDetailsOpen, setIdeaDetailsOpen] = useState(true);
  const [literatureReviewOpen, setLiteratureReviewOpen] = useState(true);
  const [RelatedWorkOpen, setRelatedWorkOpen] = useState(true);
  const [RefOpen, setRefOpen] = useState(true);
  const [PeerReviewOpen, setPeerReviewOpen] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showBuyCreditsPrompt, setShowBuyCreditsPrompt] = useState(false);
  const [problem, setProblem] = useState("");
  const [originalProblem, setOriginalProblem] = useState("");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [researchTopics, setResearchTopics] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScientificAreasInfo, setShowScientificAreasInfo] = useState(false);
  const scientificAreasInfoTimerRef = useRef(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [inputTopics, setInputTopics] = useState([]);

  useEffect(() => {
    setCurrentTopic(researchTopics.join(", "));
  }, [researchTopics]);

  const renderMarkdownEditor = (id, value, onChange, readOnly, height) => {
    return readOnly ? (
      <div
        className="markdown-preview bg-white border border-gray-300 rounded-md p-4"
        data-testid={
          id.includes("title")
            ? "idea-details-content"
            : id.includes("summary")
              ? "idea-summary-content"
              : "related-work-content"
        }
      >
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {value || ""}
        </ReactMarkdown>
      </div>
    ) : (
      <TiptapEditor
        content={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        height={height}
      />
    );
  };
  useEffect(() => {
    if (!userLoading) {
      setCredits(user?.credits ?? 0);
      if (!ideaId) {
        //we are generating a new idea, set idea privacy from user settings
        setIsPrivate(
          user?.settings?.ideas_private_by_default ?? ideasPrivateByDefault,
        );
      }
    }
  }, [user, userLoading, ideaId, ideasPrivateByDefault]);

  // Fetch all topics once on component mount
  useEffect(() => {
    const fetchAllTopics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/list/topics`,
        );
        const data = await response.json();
        if (data?.topics) {
          setAllTopics(data.topics.map((t) => t.topic));
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchAllTopics();
  }, []);

  const handleAutoSave = async () => {
    if (metadata && Date.now() - lastEditTime >= AUTO_SAVE_INTERVAL) {
      const data = {
        hypothesis_id: metadata.hypothesis_id,
        title,
        idea_summary: ideaSummary,
        literature_review: literatureReview,
        //split currentTopic by ","" and pick only the first MAX_NUMBER_OF_TOPICS topics
        current_topic: currentTopic
          .split(",")
          .map((topic) => topic.trim())
          .filter((topic) => topic) //filter out empty strings
          .slice(0, MAX_NUMBER_OF_TOPICS),
        current_background: background,
        is_private: isPrivate,
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/edit_hypothesis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        if (response.ok) {
          const result = await response.json();
          setMetadata((prevMetadata) => ({
            ...prevMetadata,
            timestamp: result.timestamp, // Update the timestamp
          }));
        } else {
          console.error("Failed to auto-save hypothesis");
        }
      } catch (error) {
        console.error("Error auto-saving hypothesis:", error);
      }
      setLastEditTime(Date.now());
    }
  };

  useEffect(() => {
    if (metadata && userCanEdit) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        handleAutoSave();
      }, AUTO_SAVE_INTERVAL);
    }
    return () => clearTimeout(timerRef.current);
  }, [
    title,
    ideaSummary,
    literatureReview,
    currentTopic,
    background,
    isPrivate,
    metadata,
    handleAutoSave,
    userCanEdit,
  ]);

  const showNotification = (message, type, redirectTo) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
      if (redirectTo) {
        router(redirectTo);
      }
    }, 8000); // Automatically hide after 4 seconds
  };

  // Function to handle window resize
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 600);
  };

  // Effect to set up and clean up the resize event listener
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Set height based on screen size
  const containerHeight = isSmallScreen ? "335px" : "330px";

  // Determine background image based on screen size
  const backgroundImage = isSmallScreen
    ? 'url("../../bgsm.svg")'
    : 'url("../../bgmd.svg")';

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTopics = input
        .split(",")
        .map((topic) => topic.trim())
        .filter((topic) => topic)
        .map((topic) => sanitizeAndValidate(topic)) // Apply sanitization and validation
        .filter((topic) => topic); // Filter out invalid topics
      if (researchTopics.length + newTopics.length <= MAX_NUMBER_OF_TOPICS) {
        setResearchTopics([...researchTopics, ...newTopics]);
        setInput("");
      } else {
        showNotification(
          `You can only add up to ${MAX_NUMBER_OF_TOPICS} topics.`,
          "error",
        );
      }
      setShowSuggestions(false); // Close the dropdown
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1,
      );
      //condition for the dropdown
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < suggestions.length
      ) {
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const sanitizedSuggestion = sanitizeAndValidate(suggestion.trim()); // Sanitize and validate the suggestion
    if (!sanitizedSuggestion) {
      showNotification("Invalid topic suggestion.", "error");
      return;
    }

    if (researchTopics.length < MAX_NUMBER_OF_TOPICS) {
      setResearchTopics([...researchTopics, sanitizedSuggestion]);
      setInput("");
      setShowSuggestions(false);
    } else {
      showNotification(
        `You can only add up to ${MAX_NUMBER_OF_TOPICS} topics.`,
        "error",
      );
    }
  };

  const handleDeleteClick = (index) => {
    //return a new array with the paper removed
    const updatedPapers = background.filter((_, idx) => idx !== index);
    setBackground(updatedPapers);
  };

  const handleEditClick = (index) => {
    const paper = background[index];
    setEditIndex(index);
    setEditFields({
      title: paper.paper_title,
      authors: paper.authors ? paper.authors.join(", ") : "",
      summary: paper.problem_relevance_summary,
    });
  };

  const handleFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBackgroundChanges = (index) => {
    const updatedPapers = background.map((paper, idx) => {
      if (idx === index) {
        return {
          ...paper,
          paper_title: editFields.title,
          authors: editFields.authors.split(", "),
          problem_relevance_summary: editFields.summary,
        };
      }
      return paper;
    });

    setBackground(updatedPapers);
    setEditIndex(null);
  };

  const handleRemoveTopic = (index) => {
    const updatedTopics = [...researchTopics];
    updatedTopics.splice(index, 1);
    setResearchTopics(updatedTopics);
    handleAutoSave(); // Force a state update
  };

  const handleProblemChange = (e) => {
    setProblem(e.target.value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      const filteredSuggestions = allTopics.filter((topic) =>
        topic.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCurrentTopicChange = (e) => {
    setCurrentTopic(e.target.value);
  };
  const handleTitleChange = useCallback((value) => {
    setTitle(value);
    setLastEditTime(Date.now());
  }, []);

  const handleSummaryChange = useCallback((value) => {
    setIdeaSummary(value);
    setLastEditTime(Date.now());
  }, []);

  const handleLiteratureReviewChange = useCallback((value) => {
    setLiteratureReview(value);
    setLastEditTime(Date.now());
  }, []);

  const handleProblemIconClick = () => {
    setShowProblemInfo(true);
    if (problemInfoTimerRef.current) {
      clearTimeout(problemInfoTimerRef.current);
    }
    problemInfoTimerRef.current = setTimeout(() => {
      setShowProblemInfo(false);
    }, 4000);
  };

  const handleScientificAreasIconClick = () => {
    setShowScientificAreasInfo(true);
    if (scientificAreasInfoTimerRef.current) {
      clearTimeout(scientificAreasInfoTimerRef.current);
    }
    scientificAreasInfoTimerRef.current = setTimeout(() => {
      setShowScientificAreasInfo(false);
    }, 4000);
  };
  const fetchIdea = async () => {
    setIdeaIsLoading(true);
    setUserVote(null);
    setShowInitialBox(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/view/${ideaId}`,
      );
      console.log("Response status:", response.status);

      if ([401, 403].includes(response.status)) {
        showNotification(
          "Forbidden - You are not allowed to view this idea.",
          "error",
        );
        setShowInitialBox(true);
        return;
      } else if (!response.ok) {
        throw new Error(`Failed to fetch idea (status: ${response.status})`);
      }

      const idea = await response.json();
      console.log("Fetched idea:", idea);

      setIdeaUserID(idea.user_id);
      setProblem(idea.input_problem);
      setOriginalProblem(idea.input_problem);
      setResearchTopics(idea.current_topic);
      setIsPrivate(idea.is_private);
      setMetadata({ hypothesis_id: idea.id, timestamp: idea.last_modified });
      setCurrentTopic(idea.current_topic.join(", "));
      setShowCurrentTopic(true);
      setTitle(idea.current_title);
      setMetaDescription(idea.meta_description);
      setMetaKeywords(idea.meta_keywords);
      setShowTitle(true);
      if (idea.current_lit !== "") {
        setLiteratureReview(idea.current_lit);
        setShowLiteratureReview(true);
      }
      setInputTopics(idea.input_topic);
      setIdeaSummary(idea.current_summary);
      setShowSummary(true);
      setBackground(idea.current_background);
      setShowUsedKeyReferences(true);
    } catch (error) {
      console.error("Failed to fetch idea details:", error);
    } finally {
      setIdeaIsLoading(false);
    }
  };
  useEffect(() => {
    console.log("Fetching idea with ID:", ideaId);
    if (!ideaId) {
      console.log("No idea ID provided, skipping fetch.");
      return;
    }
    fetchIdea();
  }, [ideaId]);

  useEffect(() => {
    const fetchUserVote = async () => {
      setUserVoteIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/${ideaId}/vote`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch idea");
        }

        const vote = await response.text();
        setUserVote(vote);
        setUserVoteIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch idea vote:", error);
      }
    };

    //fetch user vote if user is logged in and ideaId is available (not generating a new idea)
    if (user && ideaId) {
      fetchUserVote();
    }
  }, [ideaId, user]);

  useEffect(() => {
    //User can't edit during ideaLoading (generation/fetching) or userVoteLoading
    //User can't edit if the idea doesn't belong to them
    setUserCanEdit(
      !ideaIsLoading && !userVoteIsLoading && ideaUserID == user?._id,
    );
  }, [user, ideaUserID, ideaIsLoading, userVoteIsLoading]);

  // Process and validate input
  const processAndValidateInput = () => {
    const newTopics = input
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic)
      .map((topic) => sanitizeAndValidate(topic)) // Apply sanitization and validation
      .filter((topic) => topic); // Filter out invalid topics

    const titleCaseResearchTopics = researchTopics.map((topic) =>
      toTitleCase(topic),
    );

    if (
      titleCaseResearchTopics.length + newTopics.length <=
      MAX_NUMBER_OF_TOPICS
    ) {
      const updatedTopics = [...titleCaseResearchTopics, ...newTopics];
      setResearchTopics(updatedTopics);
      setInput("");
      return updatedTopics;
    } else {
      showNotification(
        `You can only add up to ${MAX_NUMBER_OF_TOPICS} topics.`,
        "error",
      );
      return null;
    }
  };

  // Helper function to convert a string to title case
  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(/\s+/) // Handle multiple spaces
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to sanitize and validate a topic
  const sanitizeAndValidate = (topic) => {
    const sanitizedTopic = topic
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim(); // Trim leading/trailing spaces

    if (sanitizedTopic.length > MAX_NUMBER_OF_TOPIC_CHARACTERS) {
      showNotification(
        `Each topic must be ${MAX_NUMBER_OF_TOPIC_CHARACTERS} characters or fewer.`,
        "error",
      );
      return null;
    }
    if (/^\d/.test(sanitizedTopic)) {
      showNotification("Topic cannot start with a number.", "error");
      return null;
    }
    return toTitleCase(sanitizedTopic);
  };

  const handleCreateHypothesis = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!problem?.trim()) {
      showNotification("Please enter a problem description", "error");
      return;
    }

    const updatedTopics = processAndValidateInput();
    if (!updatedTopics) {
      return;
    }

    setUserVote(VOTE.NONE);
    setShowInitialBox(false);
    setMetadata(null);
    setLiteratureReview("");
    setIdeaSummary("");
    setTitle("");
    setBackground([]);
    setShowTitle(false);
    setShowSummary(false);
    setShowLiteratureReview(false);
    setShowUsedKeyReferences(false);
    setShowCurrentTopic(false);

    setIdeaIsLoading(true);
    setSkeletonLoading(true); // Start skeleton loading
    const controller = new AbortController();
    setAbortController(controller);

    const payload = {
      problem: problem,
      research_topics: updatedTopics, //we don't use researchTopics here because it might be stale (react state updates are async!!)
      is_private: isPrivate,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/create_hypothesis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      if (response.status === 402) {
        setShowBuyCreditsPrompt(true);
        return;
      } else if ([401, 403].includes(response.status)) {
        const error = await response.json();
        showNotification(error.message, "error", routes.profile);
        return;
      } else if (response.status === 400) {
        showNotification(
          "No results found. Please try a different input.",
          "error",
        );
        return;
      } else if (response.status === 500) {
        showNotification(GENERIC_ERROR, "error");
        return;
      }

      const reader = response.body.getReader();
      let ideaMetaData = {};
      let ideaTitle = "";
      setSkeletonLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder("utf-8").decode(value, { stream: true });
        try {
          for (const jsonStr of splitChunk(chunk)) {
            const json = JSON.parse(jsonStr);
            const { type, content } = json.data;

            switch (type) {
              case "metadata":
                // Initial metadata with timestamp and IDs
                const metadata = {
                  timestamp: content.timestamp,
                  hypothesis_id: content.hypothesis_id,
                  user_id: content.user_id,
                };
                setShowCurrentTopic(true);
                setMetadata(metadata);
                setIdeaUserID(content.user_id);
                ideaMetaData = metadata;
                break;
              case "background":
                // Reference data without summaries
                setBackground(content.current_background);
                setShowUsedKeyReferences(true);
                break;
              case "problem_relevance_summary":
                // Individual paper summaries as they arrive
                setBackground((prev) => {
                  const updated = [...prev];
                  const index = updated.findIndex(
                    (ref) => ref.doi === content.doi,
                  );
                  if (index !== -1) {
                    updated[index] = {
                      ...updated[index],
                      problem_relevance_summary: content.summary,
                    };
                  }
                  return updated;
                });
                break;

              case "idea_content":
                // Final idea content
                ideaTitle = content.idea_title;
                setTitle(content.idea_title);
                setMetaDescription(content.meta_description);
                setMetaKeywords(content.meta_keywords);
                setIdeaSummary(content.idea_summary);
                setShowTitle(true);
                setShowSummary(true);

                // Update URL with the title
                if (ideaMetaData.hypothesis_id) {
                  const ideaURL = generateIdeaUrl(
                    ideaTitle,
                    ideaMetaData.hypothesis_id,
                  );
                  window.history.pushState({}, "", ideaURL);
                }
                break;

              case "credits":
                setCredits(content);
                break;
              case "error":
                showNotification(
                  content.message || CONSTANTS.ERRORS.GENERIC,
                  "error",
                );
                break;
            }
          }
        } catch (error) {
          console.error("Failed to parse chunk:", error);
          showNotification(GENERIC_ERROR, "error");
        }
      }
    } catch (error) {
      console.error("Failed to create hypothesis:", error);
      showNotification(GENERIC_ERROR, "error");
    } finally {
      setIdeaIsLoading(false);
      setAbortController(null);
      setSkeletonLoading(false); // Stop skeleton loading in case of error
    }
  };
  const generateIdeaUrl = (title, ideaID) => {
    if (!title || typeof title !== "string") {
      throw new Error("Title is not a valid string");
    }
    const titleSlug = title.split(" ").slice(0, 10).join("-");
    const url = `${window.location.origin}/idea/${ideaID}/${encodeURIComponent(titleSlug)}`;
    console.log("Generated URL:", url);
    return url;
  };

  const copyCiteToClipboard = (paper) => {
    // Format the citation string with title, authors, year, and citation count
    const formattedCitation = `${paper.paper_title} - ${paper.authors.join(
      ", ",
    )} (${paper.year}). Citations: ${paper.citations} Problem Relevance Summary: ${paper.problem_relevance_summary}`;

    try {
      copy(formattedCitation);
      showNotification("Citation copied to clipboard", "success");
    } catch (err) {
      console.error("Failed to copy citation: ", err);
      showNotification("Failed to copy citation", "error");
    }
  };

  const copyIdeaToClipboard = () => {
    const markdownContent = `${title}\n\n${ideaSummary}\n\n${literatureReview}`;

    try {
      copy(markdownContent);
      showNotification("Content copied to clipboard", "success");
    } catch (err) {
      console.error("Failed to copy content: ", err);
      showNotification("Failed to copy content", "error");
    }
  };

  const handleCloseSharePopup = () => {
    setShowSharePopup(false);
  };

  const handleSharePopup = () => {
    setShowSharePopup(true);
  };

  const handleGotoAddPeerReview = () => {
    const reviewSection =
      document.getElementById("add-review-section") ||
      document.getElementById("all-reviews-section");
    //scroll to add review (if user is logged in) or all reviews (if anonymous) whatever is available
    if (reviewSection) {
      reviewSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };
  const handleVoteChange = async (vote) => {
    setSavingUserVote(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/${metadata.hypothesis_id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vote,
          }),
        },
      );

      if (response.ok) {
        setUserVote(vote);
        showNotification("Thank you for your feedback!", "success");
      } else {
        showNotification("Error voting, please try again later.", "error");
      }
    } catch (error) {
      console.error("Error voting:", error);
      showNotification("Error voting, please try again later.", "error");
    } finally {
      setSavingUserVote(false);
    }
  };

  //sometimes credits takes time to set even if userLoading is done (react events delay)
  //, so we have to check(wait) that credits is not null (also to prevent flaky tests)
  if (userLoading || credits == null) {
    return (
      <div className="py-2 mt-4">
        <Skeleton height={40} count={1} />
        <br />
        <Skeleton height={60} count={3} />
      </div>
    );
  }

  return (
    <div className="flex justify-center lg:ml-[300px] ">
      <div className=" md:mt-0 mt-4 max-w-7xl w-full">
        <div className="bg-[#F3F4F8] justify-center font-semibold text-gray-700 text-center text-base py-2">
          {!unlimitedCredits ? (
            <>
              You have {credits} credits left
              {!credits && (
                <span>
                  ,{" "}
                  <Link
                    href={routes.buyCredit}
                    className="text-red-500 font-semibold underline"
                  >
                    get more
                  </Link>
                </span>
              )}
            </>
          ) : (
            <span>You have Unlimited Credits</span>
          )}
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label
                htmlFor="problem"
                className="block text-md font-semibold leading-6 text-gray-900 mb-2"
              >
                Problem:
              </label>
              <InfoOutlinedIcon
                className="h-5 w-5 text-gray-400 cursor-pointer"
                onClick={handleProblemIconClick}
              />
            </div>
            {showProblemInfo && (
              <div className="rounded-md bg-blue-50 p-4 mb-2 animate-fade-up">
                <div className="flex justify-start items-center">
                  <InfoOutlinedIcon
                    className="h-5 w-5 text-blue-400"
                    aria-hidden="true"
                    id="problemInfoIcon"
                  />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 text-center">
                      Please articulate the real-world problem (technical or
                      non-technical) you're interested in.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative group w-full">
              <input
                type="text"
                name="problem"
                id="problem"
                className="block w-full rounded-md border border-gray-300 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#F22749] focus:border-0 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:ring-black/20"
                placeholder="E.g., Increase wheat yield"
                onChange={handleProblemChange}
                value={problem}
                disabled={!user}
              />

              {!user && (
                //used <a> because Link doesn't work in tooltips
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>
                    <a href={routes.auth} className="text-red-300">
                      Signup or Login
                    </a>{" "}
                    to use seechat{" "}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="areas"
                className="block text-md font-semibold leading-6 text-gray-900 mb-2"
              >
                Scientific Areas:
              </label>
              <InfoOutlinedIcon
                className="h-5 w-5 text-gray-400 cursor-pointer"
                onClick={handleScientificAreasIconClick}
              />
            </div>
            {showScientificAreasInfo && (
              <div className="rounded-md bg-blue-50 p-4 mb-2 animate-fade-up">
                <div className="flex justify-start items-center">
                  <InfoOutlinedIcon
                    className="h-5 w-5 text-blue-400"
                    aria-hidden="true"
                    id="scientificAreasInfoIcon"
                  />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 text-center">
                      Enter the scientific areas relevant to your problem and
                      press Enter.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="relative group w-full">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                id="areas"
                data-testid="scientificAreasInput"
                className="block w-full rounded-md border border-gray-300 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#F22749] focus:border-0 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:ring-black/20"
                placeholder="E.g., Bioengineering, Bioethics"
                disabled={!user}
              />

              {!user && (
                //used <a> because Link doesn't work in tooltips
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>
                    <a href={routes.auth} className="text-red-300">
                      Signup or Login
                    </a>{" "}
                    to use seechat{" "}
                  </span>
                </div>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute bg-white border w-72 border-gray-300 rounded-md shadow-md mt-1 max-h-40 overflow-auto z-10">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <li
                    data-testid="suggestionsDropdown"
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      index === activeSuggestionIndex ? "bg-gray-200" : ""
                    }`}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {researchTopics.map((topic, index) => (
                <div
                  id={`topicBox${index}`}
                  key={index}
                  className="flex items-center gap-1 bg-red-100 rounded px-2 py-1 text-sm"
                  data-testid="topicTag"
                >
                  {topic}
                  <button
                    onClick={() => handleRemoveTopic(index)}
                    className=" text-slate-700 font-bold py-0 px-2 rounded-full text-xs"
                    aria-label="Remove"
                    data-testid="removeTopicTag"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          {(userCanEdit || showInitialBox) && (
            <div className="mt-2 flex flex-wrap gap-2">
              <PrivateSwitch
                id="privateSwitch"
                isPrivate={isPrivate}
                label="Private Idea"
                onChange={setIsPrivate}
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <button
              className="flex mb-5 justify-center  lg:mx-72 md:mx-64 mt-4 rounded bg-[#F22749] px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#F22749] disabled:bg-gray-300 disabled:ring-1 disabled:ring-black/20 disabled:cursor-not-allowed "
              onClick={handleCreateHypothesis}
              disabled={ideaIsLoading || userVoteIsLoading}
              id="thinkButton"
            >
              {/* Auth Prompt Popup */}
              {showAuthPrompt && (
                <AuthPromptPopup
                  route={routes.auth}
                  onClose={() => setShowAuthPrompt(false)} // Close popup handler
                  show={showAuthPrompt} // Pass show prop
                />
              )}
              {/* Buy Credits Popup */}
              {showBuyCreditsPrompt && (
                <BuyCreditsPopup
                  route={routes.buyCredit}
                  onClose={() => setShowBuyCreditsPrompt(false)}
                />
              )}
              {ideaIsLoading || userVoteIsLoading ? "Loading..." : "Think"}
            </button>
            {showInitialBox && (
              <div
                className="rounded-lg"
                style={{
                  position: "relative",
                  textAlign: "left",
                  margin: "auto",
                  backgroundImage,
                  backgroundSize: "cover", // Cover the entire div
                  backgroundPosition: "top left",
                  height: containerHeight,
                  width: "100%", // Full width of the screen
                }}
              ></div>
            )}
          </div>
          <div className="mt-4" id="idea-content">
            {skeletonLoading && (
              <div>
                <Skeleton height={50} count={2} />
                <br />
                <Skeleton height={30} width={300} />
                <Skeleton height={300} />
              </div>
            )}
            {metadata && !skeletonLoading && (
              <div>
                <div className="bg-slate-100 px-4 py-1  rounded-lg">
                  <div className="flex justify-end mb-1">
                    <button
                      id="copyIdeaToClipboard"
                      onClick={copyIdeaToClipboard}
                      className="flex items-center text-red-500 mt-0.5"
                      style={{ height: "38px", width: "38px" }}
                    >
                      <ContentCopyIcon className="text-2xl hover:text-blue-500 active:text-blue-500 transition ease-in-out duration-100" />
                    </button>
                    <button
                      id="shareButton"
                      onClick={handleSharePopup}
                      className="flex items-center text-red-500"
                      style={{ height: "38px", width: "38px" }}
                    >
                      <ReplyIcon className="transform scale-x-[-1] text-3xl hover:text-blue-500 active:text-blue-500 transition ease-in-out duration-100" />
                    </button>

                    {userVote && (
                      <VoteUpDown
                        id="voteUpDownComponent"
                        vote={userVote}
                        onChange={handleVoteChange}
                        disabled={savingUserVote}
                      />
                    )}
                    <button
                      id="gotoAddPeerReviewButton"
                      onClick={handleGotoAddPeerReview}
                      className="flex items-center text-red-500 ml-2 mt-0.5"
                      style={{ height: "38px", width: "38px" }}
                    >
                      <PeerReviewIcon className="text-2xl hover:text-blue-500 active:text-blue-500 transition ease-in-out duration-100" />
                    </button>
                  </div>

                  <div className="bg-[#E2E5F4] p-3 rounded-md mb-4 *">
                    <div>Idea ID: {metadata.hypothesis_id}</div>
                    <LastModified timestampUTC={metadata.timestamp} />
                    <div>Privacy: {isPrivate ? "Private" : "Public"} idea</div>
                    <div>Original Problem: {originalProblem}</div>
                    <div>Scientific Areas: {inputTopics.join(", ")}</div>
                  </div>
                </div>
                {showCurrentTopic && (
                  <div className="my-4">
                    <label
                      htmlFor="currentTopic"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Topics:
                    </label>
                    <input
                      type="text"
                      id="currentTopic"
                      className="block w-full rounded-md border border-gray-300 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-400 sm:text-sm sm:leading-6"
                      value={currentTopic}
                      readOnly={!userCanEdit}
                      onChange={handleCurrentTopicChange}
                    />
                    {showSharePopup && (
                      <SharePopup
                        url={window.location.href}
                        title={title}
                        ideaFieldsData={{
                          idea_id: metadata.hypothesis_id,
                          last_modified: metadata.timestamp,
                          current_title: title,
                          current_summary: ideaSummary,
                          current_lit: literatureReview,
                        }}
                        onClose={handleCloseSharePopup}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Literature Review Section */}
            {showUsedKeyReferences && !skeletonLoading && (
              <div className="bg-[#F3F4F8] rounded-lg p-2 my-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-xl my-2">
                    Literature Review
                  </h2>
                  <IconButton
                    onClick={() =>
                      setLiteratureReviewOpen(!literatureReviewOpen)
                    }
                    aria-expanded={literatureReviewOpen}
                    aria-label="Toggle Key References"
                    data-testid="reference-collapse"
                  >
                    <ExpandMoreIcon
                      style={{
                        transform: literatureReviewOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </IconButton>
                </div>
                <Collapse in={literatureReviewOpen}>
                  <hr />
                  {showLiteratureReview && !skeletonLoading && (
                    <>
                      <h2 className="font-semibold mt-4 text-xl my-2">
                        Related Work
                      </h2>
                      {renderMarkdownEditor(
                        "literatureReviewEditor",
                        literatureReview,
                        (value) => {
                          setLiteratureReview(value);
                          setLastEditTime(Date.now());
                        },
                        !userCanEdit,
                        "500px",
                      )}
                    </>
                  )}
                  <div className="pt-4 z-10" data-testid="reference-content">
                    <h2 className="font-semibold mt-2 text-xl my-2">
                      Key References
                    </h2>
                    <Citations
                      background={background}
                      handleDeleteClick={handleDeleteClick}
                      handleEditClick={handleEditClick}
                      editIndex={editIndex}
                      editFields={editFields}
                      handleFieldChange={handleFieldChange}
                      handleSaveChanges={handleSaveBackgroundChanges}
                      copyToClipboard={copyCiteToClipboard}
                      readOnly={!userCanEdit}
                    />
                  </div>
                </Collapse>
              </div>
            )}
            {/* Idea Details Section */}
            {showTitle && !skeletonLoading && (
              <div className="bg-[#F3F4F8] rounded-lg p-2 my-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-xl mb-2">Idea Details</h2>
                  <IconButton
                    onClick={() => setIdeaDetailsOpen(!IdeaDetailsOpen)}
                    aria-expanded={IdeaDetailsOpen}
                    aria-label="Show more"
                    data-testid="idea-details-collapse"
                  >
                    <ExpandMoreIcon
                      style={{
                        transform: IdeaDetailsOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </IconButton>
                </div>
                <Collapse in={IdeaDetailsOpen}>
                  <hr />
                  <h1 className="font-semibold text-xl mb-2 mt-4">
                    Idea Title
                  </h1>
                  {renderMarkdownEditor(
                    "titleEditor",
                    title,
                    handleTitleChange, // Use memoized handler
                    !userCanEdit,
                    "100px",
                  )}
                  <h2 className="font-semibold text-xl my-2">Idea Summary</h2>
                  {renderMarkdownEditor(
                    "summaryEditor",
                    ideaSummary,
                    handleSummaryChange, // Use memoized handler
                    !userCanEdit,
                    "500px",
                  )}
                </Collapse>
              </div>
            )}
            {/* Reviews Section */}
            {!ideaIsLoading && metadata && !skeletonLoading && (
              <div className="bg-[#F3F4F8] rounded-lg p-2 my-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-xl my-2">Peer Reviews</h2>
                  <IconButton
                    onClick={() => setPeerReviewOpen(!PeerReviewOpen)}
                    aria-expanded={PeerReviewOpen}
                    aria-label="Toggle Reviews"
                    data-testid="review-collapse"
                  >
                    <ExpandMoreIcon
                      style={{
                        transform: PeerReviewOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </IconButton>
                </div>
                <Collapse in={PeerReviewOpen}>
                  <div data-testid="review-content">
                    <PeerReviews ideaId={metadata.hypothesis_id} />
                  </div>
                </Collapse>
              </div>
            )}
          </div>
        </div>
      </div>

      <Notification
        notification={notification}
        setNotification={setNotification}
      />
      <Feedback
        user={user}
        idea={{
          idea_id: metadata?.hypothesis_id,
          last_modified: metadata?.timestamp,
          metadata,
          problem,
          researchTopics,
          title,
          ideaSummary,
          literatureReview,
          background,
        }}
      />
    </div>
  );
}

export default Ideation;
