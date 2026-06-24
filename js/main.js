/* ============================================================
   TEIMURAZ BENIDZE - motion. Lenis + GSAP ScrollTrigger.
   ============================================================ */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Smooth scroll */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.6 });
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) { const el = document.querySelector(id); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0 }); } }
    });
  });
}

function showAll(){ document.querySelectorAll(".reveal").forEach((e)=>{ e.style.opacity=1; e.style.transform="none"; }); }

if (window.gsap && window.ScrollTrigger && !reduce) {
  const { gsap } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Hero kinetic entrance */
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".masthead .kicker",     { opacity: 1, y: 0, duration: 0.7 }, 0.15)
    .to(".masthead .mast-title", { opacity: 1, y: 0, duration: 1.05 }, 0.30)
    .to(".masthead .mast-sub",   { opacity: 1, y: 0, duration: 0.85 }, 0.62)
    .to(".masthead .scroll-cue", { opacity: 1, y: 0, duration: 0.6 }, 0.9);

  /* Scroll reveals (everything else) */
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".masthead")) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* Image scale-in (clipped by overflow-hidden parents) */
  gsap.utils.toArray(".shot img, .art-tile img, .portrait img").forEach((img) => {
    gsap.fromTo(img, { scale: 1.08 }, {
      scale: 1, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: img, start: "top 90%", once: true }
    });
  });

  ScrollTrigger.refresh();
} else {
  showAll();
}

/* magnetic buttons - sensitive hover */
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
  document.querySelectorAll(".btn, .topbar-cta").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.34}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}
