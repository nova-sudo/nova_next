import React, { useState } from "react";
import LinkIcon from "@mui/icons-material/Link";
import DeleteConfirmation from "../DeleteConfirmation";
import Image from "next/image";

const Citations = ({
  background,
  handleDeleteClick,
  handleEditClick,
  editIndex,
  editFields,
  handleFieldChange,
  handleSaveChanges,
  copyToClipboard,
  readOnly,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const openLinkInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDeleteRequest = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    handleDeleteClick(deleteIndex);
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  return (
    <div className="rounded-md mb-4">
      {background.map((paper, index) => (
        <div
          key={index}
          className="card bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 relative"
        >
          {editIndex === index ? (
            <div>
              <textarea
                rows={4}
                value={editFields.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="form-input mt-2 block w-full rounded-md border-gray-300"
                id="citationTitleTextArea"
              />
              <textarea
                rows={3}
                value={editFields.authors}
                onChange={(e) => handleFieldChange("authors", e.target.value)}
                className="form-textarea mt-1 block w-full rounded-md border-gray-300"
                id="citationAuthorsTextArea"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <textarea
                  rows={6}
                  value={editFields.summary}
                  onChange={(e) => handleFieldChange("summary", e.target.value)}
                  className="form-textarea mt-1 block w-full rounded-md border-gray-300"
                  id="citationSummaryTextArea"
                />
              </div>
              <button
                onClick={() => handleSaveChanges(index)}
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                id={`saveCitation${index}`}
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <p
                    className="text-gray-600 text-sm"
                    data-testid={`paper-year-${index}`}
                  >
                    {paper.year}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/quotation.svg"
                      width={16}
                      height={16}
                      alt="quote"
                    />

                    <p className="text-sm text-blue-800">{paper.citations}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  {!readOnly && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDeleteRequest(index)}
                        className="mt-0.5 text-red-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
                        id={`deleteCitation${index}`}
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
                        onClick={() => handleEditClick(index)}
                        className="text-gray-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
                        id={`editCitation${index}`}
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
                  <button
                    onClick={() => openLinkInNewTab(paper.url)}
                    className="text-gray-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
                    title="Open URL in new tab"
                    id={`openLink${index}`}
                  >
                    <LinkIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(paper)}
                    className="text-gray-500 hover:text-red-500 transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-100"
                    title="Copy Full Citation"
                    id={`copyCitation${index}`}
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
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <h3
                className="text-base font-semibold mt-4"
                id={`titleCitation${index}`}
              >
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {paper.paper_title}
                </a>
              </h3>
              <p className="text-sm" id={`authorsCitation${index}`}>
                {paper.authors.join(", ")}
              </p>

              <p className="text-sm mt-4 ">
                <div className="relative group inline-block">
                  <span className="bg-gray-200 text-gray-700 py-[0.9px] px-1 mx-1 font-semibold rounded-md">
                    Relevance
                  </span>
                </div>
                <span id={`summaryCitation${index}`}>
                  {paper.problem_relevance_summary}
                </span>
              </p>
            </div>
          )}
        </div>
      ))}
      {showDeleteModal && (
        <DeleteConfirmation
          className="z-60"
          onDelete={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Citations;
