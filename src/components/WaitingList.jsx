import { usePostHog } from "posthog-js/react";
import Notification from "./Notification";
import { useEffect, useState, useRef } from "react";


const WaitingList = () => {
  //We have to submit the form to Mailchimp manually (without using axios/fetch) to avoid CORS issues
  const formRef = useRef(null);
  const posthog = usePostHog();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [consent, setConsent] = useState(false);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleJoinWaitlist = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setNotification({
        show: true,
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    if (!consent) {
      setNotification({
        show: true,
        message:
          "You must consent to receiving emails to join the waiting list.",
        type: "error",
      });
      return;
    }

    posthog?.capture("join_waitlist", { email, organization });

    setNotification({
      show: true,
      message: "Thank you for joining the waitlist!",
      type: "success",
    });

    // Clear the fields
    setEmail("");
    setOrganization("");
    setConsent(false);

    formRef.current.submit();
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer); // Clear timeout if component unmounts
    }
  }, [notification]);

  return (

    <div className="w-3/4 lg:ml-0 mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg justify-center">
     

      <h2 className="text-lg font-bold mb-2">Join waitlist for access</h2>

      <form
        //we get action url from mailchimp form embed code generator, from this page
        //https://us17.admin.mailchimp.com/audience/forms/embedded-form/editor?a_id=1381887&f_id=141412
        ref={formRef}
        action="https://seechat.us17.list-manage.com/subscribe/post?u=634d8a21c275185df57e9638b&amp;id=915e74e8f9&amp;f_id=00b7eae3f0"
        method="post"
        target="_blank"
      >
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            Work Email
          </label>
          <input
            name="EMAIL"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="organization"
          >
            Organization
          </label>
          <input
            name="COMPANY"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2 text-xs">
              By clicking on 'Join Waitlist', I consent to receiving emails
              about SeeChat x Ideas.
            </span>
          </label>
        </div>

        <button
          onClick={handleJoinWaitlist}
          className="w-full bg-[#F22749] text-white py-2 px-4 rounded-md hover:bg-[#F22749]"
        >
          Join Waitlist
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        Note: Never share sensitive information (credit card numbers, social
        security numbers, passwords) through this form.
      </p>
      <Notification
        notification={notification}
        setNotification={setNotification}
      />
    </div>
  );
};

export default WaitingList;
