#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { readFlags, setFlag, removeFlag, getFlag } from "../core/index.js";

const app = express();


const DEFAULT_PORT = 3231;

// Simple argument parser for --port flag
const args = process.argv.slice(2); // skip first two args (node executable and script path)
let PORT = DEFAULT_PORT;
    process.env.PORT = DEFAULT_PORT.toString();

const portArgIndex = args.indexOf("--port");
if (portArgIndex !== -1 && args[portArgIndex + 1]) {
  const portFromArgs = Number(args[portArgIndex + 1]);
  if (!isNaN(portFromArgs) && portFromArgs > 0 && portFromArgs < 65536) {
    PORT = portFromArgs;
    process.env.PORT = portFromArgs.toString();
  } else {
    console.warn(`Invalid port number provided: ${args[portArgIndex + 1]}. Falling back to default port ${DEFAULT_PORT}`);
  }
}

// const PORT = 3231;


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  res.cookie('featureFlagPort', PORT.toString(), {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    httpOnly: true, // Secure the cookie to prevent JS access
    // sameSite: 'Strict', // Secure cookie handling
  });
  next();
});

// GET all feature flags
app.get("/flags", async (req, res) => {
  try {
    const flags = await readFlags();
    res.json(flags);
  } catch (error) {
    console.log('the flags error is', error);
    res.status(500).json({ error: "Failed to read flags" });
  }
});

// POST to add/update a flag
app.post("/flags", async (req: any, res: any) => {
  const { key, value } = req.body;
  if (typeof key !== "string" || typeof value !== "boolean") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    await setFlag(key, value);
    res.json({ message: "Flag updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update flag" });
  }
});

// DELETE a flag
app.delete("/flags/:key", async (req, res) => {
  const key = req.params.key;

  try {
    await removeFlag(key);
    res.json({ message: "Flag removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove flag" });
  }
});
app.get("/flags/:key", async (req: any, res: any) => {
  const value = await getFlag(req.params.key);
  if (value === undefined) {
    return res.status(404).json({ error: "Flag not found" });
  }
  res.json({ value });
});

app.listen(PORT, () => {
  console.log(`Feature Flag API running on http://localhost:${PORT}`);
});
