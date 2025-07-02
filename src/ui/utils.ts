// src/ui/getFlag.ts

/**
 * Gets a feature flag from the backend API.
 * Automatically uses the app's host URL as base.
 *
 * @param flagName The name of the flag to retrieve.
 * @returns Promise<boolean | undefined>
 */
export async function getFlagFromApi(
  flagName: string
): Promise<boolean | undefined> {
       const removeCurrentPortAndSetNewPort = (url: string, port: number) => {
    const baseUrl = new URL(url); // Create a new URL object
    baseUrl.port = ''; // Clear the existing port (if any)
    baseUrl.port = port.toString(); // Set the new port
    return baseUrl.toString();
  };

  try {
//  const port = Number(process.env.PORT) || 3231;
 const port = Number(localStorage.getItem("featureFlagPort")) || 3231;
 console.log('the port thing ', port )
  const API_BASE = removeCurrentPortAndSetNewPort(window.location.origin, port);
  const API_URL = `${API_BASE}flags`;
   
    const res = await fetch(`${API_URL}/${encodeURIComponent(flagName)}`);

    if (!res.ok) {
      console.warn(`Flag "${flagName}" not found (status ${res.status})`);
      return undefined;
    }

    const data = await res.json();
    return data.value;
  } catch (err) {
    console.error(`Error fetching flag "${flagName}":`, err);
    return undefined;
  }
}
