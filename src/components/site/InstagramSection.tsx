import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";
import img1 from "@/assets/67459a3305d203a41fce8b5c_Mask-group-2.webp.asset.json";
import img2 from "@/assets/67459a33ff2837ab08e7f16c_Mask-group-1.webp.asset.json";
import img3 from "@/assets/67459a332f75502739bca3b7_Mask-group.webp.asset.json";
import img4 from "@/assets/67459a34be315ca7f02b1874_image-1.webp.asset.json";

const items = [
  { src: img1.url, alt: "Woman holding two white pomeranian puppies", x: -1, y: -1, rot: 113 },
  { src: img2.url, alt: "Pomeranian dog sitting with golden baubles", x: 1, y: -1, rot: 119 },
  { src: img3.url, alt: "Woman kissing her husky", x: -1, y: 1, rot: 100 },
  { src: img4.url, alt: "Smiling woman cuddling her akita", x: 1, y: 1, rot: 234 },
];

export function InstagramSection() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const p = (window.innerHeight - rect.top) / total;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // 0 at section centre, grows as it scrolls through the viewport
  const spread = (progress - 0.5) * 2; // -1 → 1

  return (
    <section
      ref={ref}
      id="instagram"
      className="relative overflow-hidden bg-sand py-28 lg:py-40"
      aria-label="Stay Pawsome with us on Instagram"
    >
      <div className="pointer-events-none absolute inset-0">
        {items.map((it, i) => (
          <img
            key={i}
            src={it.src}
            alt={it.alt}
            loading="lazy"
            className="absolute w-40 max-w-none will-change-transform sm:w-56 lg:w-80"
            style={{
              left: it.x < 0 ? "6%" : "auto",
              right: it.x > 0 ? "6%" : "auto",
              top: it.y < 0 ? "-6%" : "auto",
              bottom: it.y > 0 ? "-6%" : "auto",
              transform: `translate3d(${it.x * spread * 6}vw, ${it.y * spread * 6}vh, 0) rotate(${
                spread * (it.rot > 180 ? -8 : 8)
              }deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Stay Pawsome With Us
          <br />
          On Instagram
        </h2>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-3 text-[17px] text-foreground/85 hover:text-forest"
        >
          <Instagram className="size-6 text-clay" />
          Pet Care_Insta
        </a>
      </div>
    </section>
  );
}
