"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useUser } from "../contexts/UserContext";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { usePathname } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function SideMenu() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Extract `user_topics` query param from the URL
  const queryParams = new URLSearchParams(pathname.search);
  const userTopicsQueryParam = queryParams.get("user_topics") === "true";
  const [showOnlyMyIdeas, setShowOnlyMyIdeas] = useState(userTopicsQueryParam);

  const handleShowOnlyMyIdeasChange = (event) => {
    const newValue = event.target.checked;
    setShowOnlyMyIdeas(newValue);

    // Update the query parameter in the URL
    queryParams.set("user_topics", newValue);
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  // Fetch topics using the new endpoint
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/idea/list/topics`, {
          params: { user_topics: showOnlyMyIdeas },
        });
        setTopics(response.data.topics || []);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [showOnlyMyIdeas]);

  // Filter and sort topics based on the search term and ideas_count
  const filteredTopics = useMemo(() => {
    return topics
      .slice() // Create a shallow copy to avoid mutating the original state
      .sort((a, b) => b.ideas_count - a.ideas_count)
      .filter((topic) =>
        topic.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [topics, searchTerm]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        paddingLeft: 1,
        paddingRight: 1,
        paddingTop: 1,
      }}
    >
      {/* Search bar */}
      <Box className="relative flex items-center mt-16 mb-2">
        <FilterAltIcon className="absolute ml-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by Topic"
          className="block w-full ml-2 rounded-md border border-gray-300 py-3 pl-10 pr-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-blue focus:border-0 sm:text-sm sm:leading-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          label="topicSearchInput"
        />
      </Box>

      <Box data-testid="sideMenu">
        {user && (
          <Box className="flex items-center">
            <FormControlLabel
              className="pl-2"
              control={
                <Checkbox
                  data-testid="showOnlyMyIdeasCheckbox"
                  checked={showOnlyMyIdeas}
                  onChange={handleShowOnlyMyIdeasChange}
                  disabled={loading}
                  color="primary"
                />
              }
              label="Show Only My Ideas"
            />
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ marginLeft: 2 }}>
          {[...Array(15)].map((_, index) => (
            <Skeleton key={index} height={40} style={{ marginBottom: 5 }} />
          ))}
        </Box>
      ) : (
        <List>
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic, index) => (
              <ListItem
                button
                component="a"
                href={`/topic/${encodeURIComponent(
                  topic.topic,
                )}?user_topics=${showOnlyMyIdeas}`}
                key={index}
                data-testid={topic.topic}
                rel="noopener noreferrer"
              >
                <ListItemText
                  primary={`[${topic.ideas_count}] ${topic.topic}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography>No topics match your search.</Typography>
          )}
        </List>
      )}
    </Box>
  );
}

export default SideMenu;
