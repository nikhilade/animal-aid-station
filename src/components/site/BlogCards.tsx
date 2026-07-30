import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

type Post = { title: string; author: string; date: string; img: string };

export function BlogCards({ posts }: { posts: Post[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
    gsap.defaults({ ease: "none" });

    const ripple = (index: number, active: boolean) => {
      cards.forEach((card, i) => {
        const d = Math.abs(i - index);
        const falloff = 1 / (d + 1);
        gsap.to(card, {
          y: active ? -26 * falloff : 0,
          scale: active ? 1 + 0.05 * falloff : 1,
          rotate: active ? (i - index) * 1.5 : 0,
          boxShadow: active
            ? `0 ${18 * falloff + 4}px ${40 * falloff + 10}px rgba(20,40,25,${0.22 * falloff})`
            : "0 0px 0px rgba(20,40,25,0)",
          duration: 0.5 + d * 0.12,
          delay: active ? d * 0.07 : d * 0.04,
          ease: active ? "elastic.out(1, 0.6)" : "power2.out",
          overwrite: true,
        });
      });
    };

    const cleanups = cards.map((card, i) => {
      const enter = () => ripple(i, true);
      const leave = () => ripple(i, false);
      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      return () => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      };
    });

    return () => {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(cards);
    };
  }, [posts.length]);

  return (
    <div ref={wrapRef} className="mt-14 grid gap-8 md:grid-cols-3">
      {posts.map((p) => (
        <article
          key={p.title}
          data-card
          className="cursor-pointer rounded-[2rem] bg-card p-5 will-change-transform"
        >
          <img
            src={p.img}
            alt={p.title}
            loading="lazy"
            width={800}
            height={600}
            className="h-52 w-full rounded-[1.5rem] object-cover"
          />
          <h3 className="mt-6 text-xl leading-snug">{p.title}</h3>
          <div className="mt-4 flex items-center justify-between text-sm text-foreground/70">
            <span>
              {p.author} · {p.date}
            </span>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-forest text-primary-foreground">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
