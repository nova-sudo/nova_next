import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Notification from "../Notification";
import { useUser } from "../../contexts/UserContext";
import PeerReview from "./PeerReview";
import { PeerReviewMode } from "./PeerReviewMode";

const PeerReviews = ({ ideaId }) => {
  const { user } = useUser();
  const [peerReviews, setPeerReviews] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/${ideaId}/peer-reviews`,
        );
        const reviews = await response.json();
        setPeerReviews(reviews);
      } catch (error) {
        showNotification("Failed to load peer reviews", "error");
      }
    };

    if (ideaId) {
      fetchReviews();
    }
  }, [ideaId]);

  const onSave = async (peerReview) => {
    try {
      const peerReviewId = peerReview._id;
      let url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/${ideaId}/peer-review`;

      if (peerReviewId) {
        url += `/${peerReviewId}`;
      }

      const response = await fetch(url, {
        method: peerReviewId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(peerReview),
      });

      if (response.ok) {
        const newPeerReview = await response.json();
        if (peerReviewId) {
          setPeerReviews(
            peerReviews.map((peerReview) =>
              peerReview._id == peerReviewId ? newPeerReview : peerReview,
            ),
          );
        } else {
          setPeerReviews([newPeerReview, ...peerReviews]);
        }
        showNotification("Peer Review saved successfully!", "success");
      } else {
        throw new Error("Failed to save peer review");
      }
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const onDelete = async (peerReview) => {
    try {
      const peerReviewId = peerReview._id;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/${ideaId}/peer-review/${peerReviewId}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        setPeerReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== peerReviewId),
        );
        showNotification("Peer Review deleted successfully!", "success");
      } else {
        showNotification("Failed to delete peer review", "error");
      }
    } catch (error) {
      showNotification("Failed to delete peer review", "error");
    }
  };

  return (
    <div className=" rounded-md mb-4" id="all-reviews-section">
      {!peerReviews.length && <p className="text-gray-500">No reviews yet</p>}
      {peerReviews.map((peerReview) => (
        <div key={peerReview._id}>
          <PeerReview
            //same user can have multiple reviews for the same idea
            id={peerReview.userEmail + "_" + peerReview._id}
            initPeerReview={peerReview}
            initMode={PeerReviewMode.VIEW}
            editable={user?._id === peerReview.userId}
            showNotification={showNotification}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      ))}

      {user && (
        <div>
          <h2 id="add-review-section" className="text-base font-semibold mt-4">
            Add New Review
          </h2>
          <div className="text-600 text-sm mb-4">
            Your email {user.username} (and NOT your alias) WILL be displayed
            upon submitting the review.
          </div>
          <PeerReview
            initMode={PeerReviewMode.ADD}
            showNotification={showNotification}
            onSave={onSave}
          />
        </div>
      )}
      <Notification
        notification={notification}
        setNotification={setNotification}
      />
    </div>
  );
};

PeerReviews.propTypes = {
  ideaId: PropTypes.string.isRequired,
};

export default PeerReviews;
