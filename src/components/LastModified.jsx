import moment from "moment";
import PropTypes from "prop-types";

const LastModified = ({ timestampUTC }) => {
  // Function to normalize different timestamp formats
  const normalizeTimestamp = (timestamp) => {
    if (!timestamp) {
      return null;
    }

    // If timestamp already ends with Z, return as is
    if (timestamp.endsWith("Z")) {
      return timestamp;
    }

    // If timestamp contains timezone offset (+00:00)
    if (timestamp.includes("+")) {
      // Convert to ISO string by replacing the + with Z
      return timestamp.replace(/\+00:00$/, "Z");
    }

    // Add Z if no timezone specified
    return `${timestamp}Z`;
  };

  const normalizedTimestamp = normalizeTimestamp(timestampUTC);

  // Handle invalid timestamp
  if (!normalizedTimestamp) {
    return <span>Last modified: Unknown</span>;
  }

  const formattedDate = moment(normalizedTimestamp);

  // Handle invalid date
  if (!formattedDate.isValid()) {
    return <span>Last modified: Invalid date</span>;
  }

  return (
    <span title={formattedDate.toLocaleString()}>
      Last modified: {formattedDate.fromNow()}
    </span>
  );
};

LastModified.propTypes = {
  timestampUTC: PropTypes.string.isRequired,
};

export default LastModified;
