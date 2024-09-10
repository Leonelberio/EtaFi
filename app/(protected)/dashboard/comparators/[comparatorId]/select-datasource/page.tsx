//@ts-nocheck

"use client";

import { useState } from "react";

export default function HomePage() {
  const [sheets, setSheets] = useState([]);

  const handleSelectGoogleSheets = async () => {
    try {
      const response = await fetch("/api/google/initiate");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error initiating Google Sheets auth:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSelectGoogleSheets}>Connect Google Sheets</button>
      {/* Display sheets after successful connection */}
      {sheets.length > 0 && (
        <ul>
          {sheets.map((sheet) => (
            <li key={sheet.id}>{sheet.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
