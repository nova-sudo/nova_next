"use client";
import { useUser } from "../contexts/UserContext";
function BuyCredit() {
  const { user } = useUser();
  const clientReferenceId = user._id;

  return (
    <>
      {clientReferenceId && (
        <stripe-pricing-table
          pricing-table-id={import.meta.env.VITE_STRIPE_PRICING_TABLE_ID}
          publishable-key={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
          client-reference-id={clientReferenceId}
        ></stripe-pricing-table>
      )}
    </>
  );
}

export default BuyCredit;
