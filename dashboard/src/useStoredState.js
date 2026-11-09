import { useEffect, useState } from "react";

// A custom hook lets several types of records share the same saving behavior.
export default function useStoredState(key, startingRecords) {
  const [records, setRecords] = useState(() => {
    try {
      const savedRecords = JSON.parse(localStorage.getItem(key));
      return Array.isArray(savedRecords) ? savedRecords : startingRecords;
    } catch {
      return startingRecords;
    }
  });

  // Run after records change. This demo stores data only in this browser.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(records));
    } catch {
      console.warn(
        "Browser storage is unavailable. Changes will last for this session only.",
      );
    }
  }, [key, records]);

  return [records, setRecords];
}
