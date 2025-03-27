import { useState, useEffect } from "react";
import PropTypes from "prop-types";

UserAgreements.propTypes = {
  agreed: PropTypes.bool,
  onAgreed: PropTypes.func.isRequired,
};

function UserAgreements({ agreed, onAgreed }) {
  const [agreements, setAgreements] = useState({
    terms_and_conditions: agreed,
    privacy_policy: agreed,
    cookie_policy: agreed,
  });

  useEffect(() => {
    setAgreements({
      terms_and_conditions: agreed,
      privacy_policy: agreed,
      cookie_policy: agreed,
    });
  }, [agreed]);

  const handleChange = (event) => {
    const newAgreements = {
      ...agreements,
      [event.target.name]: event.target.checked,
    };
    setAgreements(newAgreements);

    const allAgreed = Object.values(newAgreements).every(Boolean);
    onAgreed(allAgreed);
  };

  return (
    <div className="mt-6">
      <p className="font-bold">Acknowledgements</p>
      <fieldset className="mt-2">
        <div className="space-y-5">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="terms_and_conditions"
                name="terms_and_conditions"
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={agreements.terms_and_conditions}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="terms_and_conditions" className="text-gray-500">
                I understand the&nbsp;
              </label>
              <a
                id="terms_and_conditions_link"
                className="text-gray-900 font-medium underline cursor-pointer"
                href="/legal-docs/terms_and_conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                terms of service.
              </a>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="privacy_policy"
                name="privacy_policy"
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={agreements.privacy_policy}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="privacy_policy" className="text-gray-500">
                I understand the&nbsp;
              </label>
              <a
                id="privacy_policy_link"
                className="text-gray-900 font-medium underline cursor-pointer"
                href="/legal-docs/privacy_policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy policy.
              </a>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="cookie_policy"
                name="cookie_policy"
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={agreements.cookie_policy}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="cookie_policy" className="text-gray-500">
                I understand that&nbsp;
              </label>
              <a
                id="cookie_policy_link"
                className="text-gray-900 font-medium underline cursor-pointer"
                href="/legal-docs/cookie_policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                cookies are required.
              </a>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}

export default UserAgreements;
