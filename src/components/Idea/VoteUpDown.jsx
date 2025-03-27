import { IconButton } from "@mui/material";
import {
  ThumbUp,
  ThumbUpOffAlt,
  ThumbDown,
  ThumbDownOffAlt,
} from "@mui/icons-material";
import PropTypes from "prop-types";

export const VOTE = Object.freeze({
  UP: "up",
  DOWN: "down",
  NONE: "none",
});

export const VoteUpDown = ({ id, vote, disabled, onChange }) => {
  const handleVote = (newVote) => {
    //clicking current vote again will reset voting to NONE
    newVote = (newVote === vote) ? VOTE.NONE : newVote;
    onChange(newVote);
  };

  return (
    <div id={id}>
      <IconButton
        onClick={() => handleVote(VOTE.UP)}
        sx={{ color: "#F22749" }}
        disabled={disabled}
        id="thumb-up-button"
      >
        {vote === VOTE.UP ? (
          <ThumbUp id="thumb-up-icon-on" />
        ) : (
          <ThumbUpOffAlt id="thumb-up-icon-off" />
        )}
      </IconButton>
      <IconButton
        onClick={() => handleVote(VOTE.DOWN)}
        sx={{ color: "#F22749" }}
        disabled={disabled}
        id="thumb-down-button"
      >
        {vote === VOTE.DOWN ? (
          <ThumbDown id="thumb-down-icon-on" />
        ) : (
          <ThumbDownOffAlt id="thumb-down-icon-off" />
        )}
      </IconButton>
    </div>
  );
};

VoteUpDown.propTypes = {
  id: PropTypes.string.isRequired,
  vote: PropTypes.oneOf(Object.values(VOTE)).isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};
