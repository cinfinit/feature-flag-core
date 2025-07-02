import React, { useEffect, useState } from "react";
// import "./toggleStyles.css";
type FeatureFlags = Record<string, boolean>;

// const API_URL = "http://localhost:3231/flags";

// const API_BASE = `${window.location.origin}/api`;
// const API_URL = `${API_BASE}/flags`;

interface FeatureFlagManagerProps {
  port?: number; // Optional port prop
  customUrl?: string; // Optional custom URL prop
}

  // write a logic to remove an exisiting port from the URL
   const removeCurrentPortAndSetNewPort = (url: string, port: number) => {
    const baseUrl = new URL(url); // Create a new URL object
    baseUrl.port = ''; // Clear the existing port (if any)
    baseUrl.port = port.toString(); // Set the new port
    return baseUrl.toString();
  };

//    const API_BASE = `${window.location.origin}:${port}/`; // Dynamic port

//   const API_URL = `${API_BASE}flags`;



export const FeatureFlagManager: React.FC<FeatureFlagManagerProps> = ({ port = 3231 ,customUrl}) => {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagValue, setNewFlagValue] = useState(true);

let API_BASE: string;
    if (customUrl) {
    API_BASE = customUrl.endsWith("/") ? customUrl : `${customUrl}/`;
  } else {
    API_BASE = removeCurrentPortAndSetNewPort(window.location.origin, port);
  }
//   const API_BASE = removeCurrentPortAndSetNewPort(window.location.origin, port);
  const API_URL = `${API_BASE}flags`;

//   // write a logic to remove an exisiting port from the URL
//    const removeCurrentPortAndSetNewPort = (url: string, port: number) => {
//     const baseUrl = new URL(url); // Create a new URL object
//     baseUrl.port = ''; // Clear the existing port (if any)
//     baseUrl.port = port.toString(); // Set the new port
//     return baseUrl.toString();
//   };

// //    const API_BASE = `${window.location.origin}:${port}/`; // Dynamic port

// //   const API_URL = `${API_BASE}flags`;


//     const API_BASE = removeCurrentPortAndSetNewPort(window.location.origin, port);
//   const API_URL = `${API_BASE}flags`;
  useEffect(() => {
      if (port) {
      // If a port is passed, set it to localStorage
      localStorage.setItem("featureFlagPort", port.toString());
    }
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFlags(data);
    } catch (err) {
      console.error("Failed to fetch flags:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: !currentValue }),
      });
      setFlags((prev) => ({ ...prev, [key]: !currentValue }));
    } catch (err) {
      console.error("Failed to update flag:", err);
    }
  };

  const handleDelete = async (key: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${key}"?`
    );
    if (!confirmed) return;

    try {
      await fetch(`${API_URL}/${key}`, { method: "DELETE" });
      setFlags((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete flag:", err);
    }
  };

  const handleAdd = async () => {
    const trimmedKey = newFlagName.trim();
    if (!trimmedKey) return alert("Flag name cannot be empty");
    if (flags.hasOwnProperty(trimmedKey)) return alert("Flag already exists");

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmedKey, value: newFlagValue }),
      });
      setFlags((prev) => ({ ...prev, [trimmedKey]: newFlagValue }));
      setNewFlagName("");
      setNewFlagValue(true);
    } catch (err) {
      console.error("Failed to add flag:", err);
    }
  };

  if (loading)
    return <div style={styles.loading}>Loading feature flags...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌟 Feature Flag Manager</h2>
      <a href="https://github.com/cinfinit" style={{margin:"0px", marginBottom:"0.5rem",color:'cyan'}}>@ cinfinit</a>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Flag Name</th>
            <th style={styles.th}>Enabled</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(flags).map(([key, value]) => (
            <tr key={key}>
              <td style={styles.td}>{key}</td>
              <td style={styles.td}>
                {/* <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(key, value)}
                /> */}
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleToggle(key, value)}
                  />
                  <span className="slider"></span>
                </label>
              </td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => handleDelete(key)}>
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td style={styles.td}>
              <input
                type="text"
                placeholder="New flag name"
                value={newFlagName}
                onChange={(e) => setNewFlagName(e.target.value)}
                style={styles.input}
              />
            </td>
            <td style={styles.td}>
              {/* <input
                type="checkbox"
                checked={newFlagValue}
                onChange={() => setNewFlagValue((prev) => !prev)}
              /> */}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={newFlagValue}
                  onChange={() => handleToggle(newFlagName, newFlagValue)}
                />
                <span className="slider"></span>
              </label>
            </td>
            <td style={styles.td}>
              <button style={styles.button} onClick={handleAdd}>
                ╋  Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Dark theme styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 700,
    margin: "2rem auto",
    backgroundColor: "#2C3E50",
    padding: "2rem",
    borderRadius: "8px",
    color: "#ECF0F1",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  loading: {
    color: "#ECF0F1",
    textAlign: "center",
    marginTop: "2rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "center",
    padding: "12px 8px",
    borderBottom: "2px solid #3C4A5A",
    color: "#ECF0F1",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #3C4A5A",
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    backgroundColor: "#34495E",
    border: "1px solid #3C4A5A",
    borderRadius: "4px",
    color: "#ECF0F1",
  },
  button: {
    background: "transparent",
    border: "1px solid #ECF0F1",
    color: "#ECF0F1",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};



