import { useState } from "react";
import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { usePostHog } from "posthog-js/react";
import Notification from "./Notification";

const Feedback = ({ user, idea }) => {
  const posthog = usePostHog();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setNotification({
        show: true,
        message: "You can't submit empty feedback.",
        type: "error",
      });
      return;
    }

    let result = posthog?.capture("feedback", {
      feedback,
      user,
      idea,
    });

    setFeedback("");
    setIsOpen(false);

    setNotification({
      show: true,
      message: "Thank you for your feedback!",
      type: "success",
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex justify-center item-end py-[5.5rem] z-0"
      >
        <div className="flex w-full flex-col items-center justify-end space-y-4">
          <Transition
            show={isOpen}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Feedback
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-4">
                  <p className="text-sm text-gray-500 mb-2 text-left">
                    What can we do to improve our product?
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback here..."
                    className="w-full h-24 p-2 border border-gray-300 rounded mb-2"
                  />
                  <button
                    type="submit"
                    className="bg-[#F22749] text-white px-4 py-2 rounded w-full"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <Transition
        show={!isOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-4 left-4 pointer-events-auto z-100">
          <button
            className="bg-[#F22749] text-white rounded-full w-auto h-12 px-4 flex items-center justify-center text-sm font-medium shadow-lg"
            onClick={() => setIsOpen(true)}
          >
            Give Feedback
          </button>
        </div>
      </Transition>
      <Notification
        notification={notification}
        setNotification={setNotification}
      />
    </>
  );
};

export default Feedback;
