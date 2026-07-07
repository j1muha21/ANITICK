"use client";

import { useEffect, useState } from "react";

/** Renders a Unix timestamp (seconds) in the viewer's own timezone. */
export default function LocalTime({
  timestamp,
  className = "",
}: {
  timestamp: number;
  className?: string;
}) {
  // Empty until mounted to avoid a server/client timezone mismatch.
  const [text, setText] = useState("");

  useEffect(() => {
    setText(
      new Date(timestamp * 1000).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [timestamp]);

  return <span className={className}>{text}</span>;
}
