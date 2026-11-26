import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

const useIsoLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect;

function isInView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 0 && rect.top < viewH * 0.98 && rect.width + rect.height > 0;
}

/** Scroll reveal: children marked .reveal fade/rise in once the block is on screen. */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>(".reveal"));
    if (items.length === 0) return;

    let played = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const play = () => {
      if (played) return;
      played = true;
      items.forEach((item, index) => {
        item.style.transitionDelay = reduced ? "0ms" : `${index * 70}ms`;
        item.classList.add("is-shown");
      });
    };

    // Observe after layout. A missed first callback used to leave the page at
    // opacity: 0 until a tab switch delivered a new intersection entry.
    if (isInView(el)) play();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          play();
          io.disconnect();
        }
      },
      { threshold: [0, 0.01] },
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      if (!isInView(el)) return;
      play();
      ro.disconnect();
      io.disconnect();
    });
    ro.observe(el);

    const onVisible = () => {
      if (document.visibilityState !== "visible" || !isInView(el)) return;
      play();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
