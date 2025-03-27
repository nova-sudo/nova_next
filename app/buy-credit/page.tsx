// app/buy-credit/page.js
"use client";
import dynamic from "next/dynamic";

const BuyCredit = dynamic(() => import("../../src/components/BuyCredit"), {
  ssr: false, // Disable server-side rendering
  loading: () => <div>Loading payment options...</div>,
});

export default function Page() {
  return <BuyCredit />;
}
