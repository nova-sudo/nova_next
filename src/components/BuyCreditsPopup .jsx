import React from "react";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import CloseIcon from "@mui/icons-material/Close";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";

const BuyCreditsPopup = ({ route, onClose }) => {
  const navigate = useNavigate();

  const handleBuyCreditsRedirect = () => {
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black bg-opacity-50">
      <Transition
        appear
        show={true}
        enter="transform ease-out duration-300 transition"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transform ease-in duration-200 transition"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
      >
        <div
          className={`bg-white p-6 shadow-lg rounded-2xl  w-full h-full 
            ${
              window.innerWidth < 600
                ? "fixed bottom-0 rounded-b-none" // Sticks to bottom for small screens
                : "absolute top-1/2 transform -translate-y-1/2" // Centers for larger screens
            }
          `}
          style={{
            maxWidth: "536px",
            maxHeight: "328px", 
          }}
        >
        

          <div className="flex flex-col items-center text-center space-y-4 ">
            <PaymentOutlinedIcon
              style={{
                fontSize: "44px",
                padding: "8px",
                backgroundColor: "#FECACA",
                borderRadius: "50%",
                color: "#DC2626",
              }}
            />
            <h1 className="text-lg font-semibold text-black">
              You have 0 credits left
            </h1>
            <p className="text-base font-normal pb-4 text-black">
              Boost your research, recharge your credits now!
            </p>
            <button
              onClick={handleBuyCreditsRedirect}
              className=" w-4/5 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-600 "
            >
              Get more credits
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default BuyCreditsPopup;
