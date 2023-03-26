import { useEffect, useState } from "react";

export default function useScrollPosition(max = 1001) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (window.pageYOffset < max) {
        setScrollPosition(window.pageYOffset);
      }
    };
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, [max]);

  return scrollPosition;
}
