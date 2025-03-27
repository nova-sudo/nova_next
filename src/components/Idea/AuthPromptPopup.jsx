import React, { useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Auth-related icon
import { useRouter } from "next/navigation";
const AuthPromptPopup = ({ route, onClose, show }) => {
 
  const router = useRouter();



  const handleAuthRedirect = () => {
    router.push(route);
  };

  return (
    
      <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black bg-opacity-50">
        <div
          className={`bg-white p-6 shadow-lg rounded-2xl w-full h-full 
            ${window.innerWidth < 600 ? "fixed bottom-0 rounded-b-none" : "absolute top-1/2 transform -translate-y-1/2"}
          `}
          style={{
            maxWidth: "536px",
            maxHeight: "328px",
          }}
        >
          

          <div className="flex mt-10 flex-col items-center text-center space-y-4">
            <AccountCircleIcon
              style={{
                fontSize: "44px",
                padding: "8px",
                backgroundColor: "#FECACA",
                borderRadius: "50%",
                color: "#DC2626",
              }}
            />
            <h3 className="text-lg font-semibold text-black">
              You are not signed in
            </h3>
            <p className="text-base font-normal pb-8 text-black">
              Join now for access to powerful AI research assistance!
            </p>
            <button
              onClick={handleAuthRedirect}
              className="w-3/5 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              id="signupButton"
            >
              Sign Up or Log In
            </button>
          </div>
        </div>
      </div>
    
  );
};

export default AuthPromptPopup;
