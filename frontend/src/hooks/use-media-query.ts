"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Default to false on server-side
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Set initial value
      setMatches(media.matches);
      
      // Update matches when media query changes
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      
      // Cleanup
      return () => media.removeEventListener("change", listener);
    }
  }, [query]);
  
  return matches;
}
