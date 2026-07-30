import { useMemo } from "react";

const pawPath =
  "M12 13.5c2.2 0 4 1.7 4 3.7 0 1.6-1.1 2.8-2.6 2.8-.6 0-1-.2-1.4-.2s-.8.2-1.4.2c-1.5 0-2.6-1.2-2.6-2.8 0-2 1.8-3.7 4-3.7Z M7.2 11c.94 0 1.7-1.03 1.7-2.3S8.14 6.4 7.2 6.4s-1.7 1.03-1.7 2.3.76 2.3 1.7 2.3z M16.8 11c.94 0 1.7-1.03 1.7-2.3S17.74 6.4 16.8 6.4s-1.7 1.03-1.7 2.3.76 2.3 1.7 2.3z M10 9.1c.83 0 1.5-.94 1.5-2.1S10.83 4.9 10 4.9s-1.5.94-1.5 2.1.67 2.1 1.5 2.1z M14 9.1c.83 0 1.5-.94 1.5-2.1S14.83 4.9 14 4.9s-1.5.94-1.5 2.1.67 2.1 1.5 2.1z";

const randomSeed = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function PawField({ className }: { className?: string }) {
  const paws = useMemo(() => {
    const cols = 12;
    const rows = 14;
    return Array.from({ length: cols * rows }, (_, i) => ({
      id: i,
      rotate: Math.round((randomSeed(i) - 0.5) * 60),
      opacity: Math.round(10 + randomSeed(i + 1) * 20) * 5,
      scale: 0.7 + randomSeed(i + 2) * 0.4,
    }));
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <div className="grid h-full w-full grid-cols-12 grid-rows-[repeat(14,1fr)]">
        {paws.map((paw) => (
          <div
            key={paw.id}
            className="pointer-events-none flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-auto fill-forest transition-all duration-300 hover:fill-clay hover:!opacity-100"
              style={{
                width: `${paw.scale * 2.25}rem`,
                height: `${paw.scale * 2.25}rem`,
                opacity: paw.opacity / 100,
                transform: `rotate(${paw.rotate}deg)`,
              }}
            >
              <path d={pawPath} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
