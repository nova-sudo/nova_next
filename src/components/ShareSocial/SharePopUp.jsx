import React, { useState } from "react";
import LinkIcon from "@mui/icons-material/Link";
import ExportToWord from "./ExportToWord";
import RedditShare from "./RedditShare";
import CloseIcon from "@mui/icons-material/Close";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import copy from "copy-to-clipboard";

const SharePopup = ({ url, title, ideaFieldsData, onClose }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const copyToClipboard = () => {
    try {
      copy(url);
      setNotification({
        show: true,
        message: "Link copied successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to copy link: ", err);
      setNotification({
        show: true,
        message: "Failed to copy link",
        type: "error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black bg-opacity-50">
      {/* Notification */}
      <div className="fixed top-5 mt-20 right-5 p-4 z-100">
        <Transition
          show={notification.show}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-50"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-72 max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === "success" ? (
                    <CheckCircleIcon
                      className="h-6 w-6 text-green-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      setNotification({ show: false, message: "", type: "" });
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      {/* Popup Window */}
      <div
        className={`
    bg-white p-6 shadow-lg rounded-2xl 
    ${window.innerWidth <= 600 ? "fixed bottom-0 rounded-b-none w-full" : "relative m-auto"}
  `}
        style={{
          width: window.innerWidth > 600 ? "600px" : "100%",
        }}
      >
        <div className="flex justify-between items-center mb-5 ">
          <h3 className="text-lg font-semibold text-center mx-auto">Share</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            value={url}
            readOnly
            className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            id="copyLinkButton"
            onClick={copyToClipboard}
            className="absolute inset-y-0 right-0 px-4 text-sm font-semibold bg-white border-gray-300 border border-l-0 flex items-center text-red-500 rounded-r-lg"
          >
            <LinkIcon className="mr-1 text-lg" />
            Copy Link
          </button>
        </div>

        <div className="flex justify-around items-center">
          <ExportToWord
            id="exportToWordButton"
            ideaFieldsData={ideaFieldsData}
          />
          <RedditShare id="redditShareButton" url={url} title={title} />
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
