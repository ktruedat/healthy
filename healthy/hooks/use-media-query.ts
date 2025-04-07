"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set the initial value
    setMatches(media.matches)
    
    // Define a callback to handle media query changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add the event listener
    media.addEventListener("change", listener)
    
    // Clean up the listener when the component unmounts
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])
  
  return matches
} 