import MarkdownEditor from "../MarkDownEditor";
import PropTypes from "prop-types";
import { PeerReviewMode } from "./PeerReviewMode";
import { useState, useEffect } from "react";
import LastModified from "../LastModified";

const ASPECT_DESCRIPTIONS = {
  impact:
    "What is the potential for significant positive impact on our society?",
  clarity:
    "How clear does the proposal describe the assumptions, proposed hypothesis, method and evaluation strategy?",
  safety: "How well does the proposal address potential for harm?",
  substance:
    "To what extent does the proposal reflect a deep understanding of the scientific and technical challenges?",
  soundness:
    "To what extent would an AI scientist agree with the claims in this proposal?",
  feasibility:
    "How feasible for a committed team with relevant expertise to implement the proposal in 6 months?",
  originality:
    "How novel is the proposed application (at the local/regional/national level), and the scientific method used/proposed (at the global level)?",
  relevance:
    "Broadly speaking, how relevant is this proposal to the field of artificial intelligence and its applications?",
};

const EMPTY_PEER_REVIEW = {
  impact: null,
  clarity: null,
  safety: null,
  substance: null,
  soundness: null,
  feasibility: null,
  originality: null,
  relevance: null,
  comments: "",
};
const PeerReview = ({
  id,
  initPeerReview = EMPTY_PEER_REVIEW,
  initMode,
  onSave,
  onDelete,
  editable = false,
}) => {
  const [peerReview, setPeerReview] = useState(initPeerReview);
  const [mode, setMode] = useState(initMode);

  //refresh current state if props change (from the parent PeerReviews component)
  useEffect(() => {
    setPeerReview(initPeerReview);
  }, [initPeerReview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPeerReview({
      ...peerReview,
      [name]: value,
    });
  };

  const handleCommentsChange = (value) => {
    setPeerReview({
      ...peerReview,
      ["comments"]: value,
    });
  };

  //check if at least one aspect is selected or comments are filled
  const isSubmitEnabled = Object.values(peerReview).some((value) => value);

  const handleEditPeerReview = () => {
    setMode(PeerReviewMode.EDIT);
  };

  const handleCancelEdit = () => {
    setMode(PeerReviewMode.VIEW);
  };

  const handleSave = () => {
    onSave(peerReview);
    if (peerReview._id) {
      setMode(PeerReviewMode.VIEW);
    } else {
      //clear the form
      setPeerReview(EMPTY_PEER_REVIEW);
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this peer review?")) {
      return;
    }
    onDelete(peerReview);
  };

  return (
    <div
      id={id}
      className="card bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 relative"
    >
      <div className="flex justify-between items-start mb-4">
        {mode == PeerReviewMode.VIEW && (
          <div>
            <div>Reviewer's Email: {peerReview.userEmail}</div>
            <LastModified timestampUTC={peerReview.updatedAt} />
          </div>
        )}
        {editable && mode != PeerReviewMode.EDIT && (
          <div className="flex space-x-4 ml-auto">
            <div></div>
            <button
              onClick={handleDelete}
              name="deleteButton"
              className="mt-0.5 text-red-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
              </svg>
            </button>
            <button
              onClick={handleEditPeerReview}
              name="editButton"
              className="text-gray-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {Object.keys(ASPECT_DESCRIPTIONS).map((aspect) => (
        <div key={aspect} className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {aspect.charAt(0).toUpperCase() + aspect.slice(1)}:
            <span className="font-normal"> {ASPECT_DESCRIPTIONS[aspect]}</span>
            {mode == PeerReviewMode.VIEW ? (
              <div>
                {peerReview[aspect]
                  ? peerReview[aspect].charAt(0).toUpperCase() +
                    peerReview[aspect].slice(1)
                  : "NA"}
              </div>
            ) : (
              <select
                name={aspect}
                value={peerReview[aspect] || ""}
                onChange={handleInputChange}
                disabled={mode == PeerReviewMode.VIEW}
                className="form-input mt-2 block w-full rounded-md border-gray-300"
              >
                <option value="">Select</option>
                <option value="strong">Strong</option>
                <option value="neutral">Neutral</option>
                <option value="weak">Weak</option>
              </select>
            )}
          </label>
        </div>
      ))}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold text-sm mb-2">
          Comments:
        </label>
        <div data-color-mode="light" className="mt-4 max-w-7xl w-full">
          <MarkdownEditor
            id="peer-review-comments"
            value={peerReview.comments}
            onChange={handleCommentsChange}
            readOnly={mode == PeerReviewMode.VIEW}
          />
        </div>
      </div>
      {mode == PeerReviewMode.EDIT && (
        <button
          onClick={handleCancelEdit}
          className="mt-2 bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
        >
          Cancel
        </button>
      )}
      {!(mode == PeerReviewMode.VIEW) && (
        <button
          id="savePeerReviewButton"
          onClick={handleSave}
          disabled={!isSubmitEnabled}
          className={`mt-2 py-2 px-4 rounded ${
            isSubmitEnabled
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {mode == PeerReviewMode.EDIT ? "Update" : "Submit"} Peer Review
        </button>
      )}
    </div>
  );
};

PeerReview.propTypes = {
  id: PropTypes.string,
  initPeerReview: PropTypes.object,
  initMode: PropTypes.oneOf(Object.values(PeerReviewMode)).isRequired,
  showNotification: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
};

export default PeerReview;
