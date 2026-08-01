import { useEffect, useState } from "react";
import kuttoGif from "@/assets/kutto.gif";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const dismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 700);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#fff] transition-opacity duration-700 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center p-4 text-center">
        <img
          src={kuttoGif}
          alt="Loading..."
          className="h-20 w-auto max-w-[160px] object-contain sm:h-24 md:h-28"
        />
      </div>
    </div>
  );
}
