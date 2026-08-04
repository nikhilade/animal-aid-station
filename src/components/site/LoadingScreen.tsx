import { useEffect, useState } from "react";
import kuttoGif from "@/assets/kutto.gif";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);

  const dismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 400);
  };

  useEffect(() => {
    // Dismiss as soon as the gif renders OR after a short safety timeout,
    // whichever comes first — never block the page longer than 1.2s.
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 1200);

    return () => clearTimeout(safetyTimer);
  }, []);

  // If the image finishes decoding earlier we can fade out immediately.
  useEffect(() => {
    if (gifLoaded && !isFading) {
      dismiss();
    }
  }, [gifLoaded, isFading]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#fff] transition-opacity duration-500 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center p-4 text-center">
        <img
          src={kuttoGif}
          alt="Loading..."
          onLoad={() => setGifLoaded(true)}
          className="h-16 w-auto max-w-[120px] object-contain sm:h-20"
        />
        <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-forest/15">
          <div className="h-full w-full origin-left animate-[scale-x_1s_ease-in-out_infinite] bg-forest" />
        </div>
      </div>
    </div>
  );
}

