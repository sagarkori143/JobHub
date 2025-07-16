"use client";
import { useEffect } from "react";

export default function TrackVisit() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const lastVisit = localStorage.getItem("jobhub_last_visit");
    if (lastVisit !== today) {
      fetch("/api/portal-stats", { method: "POST" });
      localStorage.setItem("jobhub_last_visit", today);
    }
  }, []);
  return null;
} 