import React from "react";
import DelhiBooking from "../components/DelhiBooking/DelhiBooking";

// Reuse the Delhi booking component but customize it for Pune
// This is a simple wrapper page - you can customize styling as needed

export default function PuneBookingPage() {
  return (
    <div>
      <DelhiBooking />
    </div>
  );
}
