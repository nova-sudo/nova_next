// app/profile.js
"use client"; // Keep this since SessionAuthForNextJS likely needs client-side logic
import dynamic from "next/dynamic";
import { SessionAuthForNextJS } from "../../src/components/SessionAuthForNextJS";

// Dynamic import with SSR disabled and a loading fallback
const Profile = dynamic(() => import("../../src/main/ProfilePage"), {
  ssr: false, // Disable server-side rendering
  loading: () => <div>Loading profile...</div>, // Optional: fallback UI during load
});

export default function Page() {
  return (
    <SessionAuthForNextJS>
      <Profile />
    </SessionAuthForNextJS>
  );
}