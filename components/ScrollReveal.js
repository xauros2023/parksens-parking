"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Generic scroll-triggered entrance for a section. Animates the section itself
// plus, optionally, a list of staggered child selectors within it.
export default function ScrollReveal({ as: Tag = "div", stagger, className, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = stagger ? el.querySelectorAll(stagger) : el;
      const tween = gsap.from(targets, {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          once: true,
        },
      });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, [stagger]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
