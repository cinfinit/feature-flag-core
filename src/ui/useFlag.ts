import { useState, useEffect } from "react";

export function useFlagFromApi(flagName: string): boolean | undefined {
  const [flagValue, setFlagValue] = useState<boolean | undefined>(undefined);

  const removeCurrentPortAndSetNewPort = (url: string, port: number) => {
    const baseUrl = new URL(url);
    baseUrl.port = ""; // Clear existing port
    baseUrl.port = port.toString(); // Set new port
    return baseUrl.toString();
  };

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        const port = Number(localStorage.getItem("featureFlagPort")) || 3231;
        const API_BASE = removeCurrentPortAndSetNewPort(window.location.origin, port);
        const API_URL = `${API_BASE}flags`;

        const res = await fetch(`${API_URL}/${encodeURIComponent(flagName)}`);
        if (res.ok) {
          const data = await res.json();
          setFlagValue(data.value); // Set the flag value
        } else {
          console.warn(`Flag "${flagName}" not found (status ${res.status})`);
          setFlagValue(undefined); // Set undefined if flag is not found
        }
      } catch (err) {
        console.error(`Error fetching flag "${flagName}":`, err);
        setFlagValue(undefined); // Handle error gracefully
      }
    };

    fetchFlag();
  }, [flagName]); // Depend on the flag name for fetching the latest value

  return flagValue; // Return the flag value synchronously
}
