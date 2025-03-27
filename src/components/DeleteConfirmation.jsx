import React from "react";

const DeleteConfirmation = ({ onDelete, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white p-6 rounded-2xl shadow-lg text-center"
        style={{
          width: window.innerWidth >= 600 ? "600px" : "100%",
          position: "absolute",
          bottom: window.innerWidth < 600 ? "0" : "auto",
          top: window.innerWidth >= 600 ? "50%" : "auto",
          left: "50%",
          transform:
            window.innerWidth >= 600
              ? "translate(-50%, -50%)"
              : "translateX(-50%)",
        }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Are you sure you want to delete this reference?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 w-3/6 py-2 rounded-lg text-black ring-black ring-1 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            id="popupDeleteButton"
            onClick={onDelete}
            className="px-4 w-3/6 py-2 rounded-lg text-red-600 ring-1 ring-red-500 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
