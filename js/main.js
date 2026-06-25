/* ============================================================
   TEIMURAZ BENIDZE - motion. Lenis + GSAP ScrollTrigger.
   Interactive ORBIS Agent Call Simulator.
   ============================================================ */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Global Sound State
let isSoundMuted = true;
let audioCtx = null;

/* Smooth scroll & GSAP */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ 
    duration: 0.9, 
    easing: (t) => 1 - Math.pow(1 - t, 3), 
    smoothWheel: true, 
    wheelMultiplier: 1.0, 
    touchMultiplier: 1.4, 
    syncTouch: true 
  });
  
  function raf(t) { 
    lenis.raf(t); 
    requestAnimationFrame(raf); 
  }
  requestAnimationFrame(raf);
  
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) { 
        const el = document.querySelector(id); 
        if (el) { 
          e.preventDefault(); 
          lenis.scrollTo(el, { offset: -20 }); 
        } 
      }
    });
  });
}

function showAll() { 
  document.querySelectorAll(".reveal").forEach((e) => { 
    e.style.opacity = 1; 
    e.style.transform = "none"; 
  }); 
}

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

  /* Scroll reveals */
  gsap.utils.toArray(".reveal").forEach((el) => {
    if (el.closest(".masthead")) return;
    gsap.to(el, {
      opacity: 1, 
      y: 0, 
      duration: 0.9, 
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* Image scale-in */
  gsap.utils.toArray(".shot img, .art-tile img, .portrait img").forEach((img) => {
    gsap.fromTo(img, { scale: 1.08 }, {
      scale: 1, 
      duration: 1.2, 
      ease: "power3.out",
      scrollTrigger: { trigger: img, start: "top 90%", once: true }
    });
  });

  ScrollTrigger.refresh();
} else {
  showAll();
}

/* Magnetic buttons */
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
  document.querySelectorAll(".btn, .topbar-cta").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.34}px)`;
    });
    el.addEventListener("mouseleave", () => { 
      el.style.transform = ""; 
    });
  });
}

/* 1. HERO CANVAS PARTICLE SYSTEM */
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(50, Math.floor((width * height) / 30000));
  const mouse = { x: null, y: null, radius: 150 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let dirX = dx / distance;
          let dirY = dy / distance;
          this.x -= dirX * force * 1.5;
          this.y -= dirY * force * 1.5;
        }
      }
    }
    
    draw() {
      ctx.fillStyle = "rgba(140, 38, 48, 0.45)"; // Burgundy Red Wine Particles
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 110) {
          ctx.strokeStyle = `rgba(140, 38, 48, ${0.12 * (1 - dist/110)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}
initHeroCanvas();

/* 2. AUDIO CONTEXT SYNTHESIZER (0 Bytes Audio) */
function initAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playWelcomeChime() {
  if (isSoundMuted) return;
  initAudioCtx();
  try {
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.35); // E5
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(392.00, now); // G4
    osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.35); // C5
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch(e) {
    console.warn("Audio synthesis failed:", e);
  }
}

function playSuccessTone() {
  if (isSoundMuted) return;
  initAudioCtx();
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(523.25, now + 0.1);
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.22); // G5
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.7);
  } catch(e) {
    console.warn("Audio synthesis failed:", e);
  }
}

function playClickTone() {
  if (isSoundMuted) return;
  initAudioCtx();
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.08);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch(e) {
    console.warn("Audio synthesis failed:", e);
  }
}

// 3. SOUND TOGGLE BUTTON
function initSoundToggle() {
  const btn = document.getElementById("sound-toggle");
  if (!btn) return;

  const btnText = btn.querySelector(".sound-btn-text");
  const iconOff = btn.querySelector(".sound-off");
  const iconOn = btn.querySelector(".sound-on");

  const isEn = window.location.pathname.includes("-en.html") || document.documentElement.lang === "en";

  btn.addEventListener("click", () => {
    isSoundMuted = !isSoundMuted;
    if (isSoundMuted) {
      btnText.textContent = isEn ? "Sound: Off" : "Звук: Выкл";
      iconOff.classList.remove("hidden");
      iconOn.classList.add("hidden");
    } else {
      btnText.textContent = isEn ? "Sound: On" : "Звук: Вкл";
      iconOff.classList.add("hidden");
      iconOn.classList.remove("hidden");
      initAudioCtx();
      playClickTone();
    }
  });
}
initSoundToggle();

// 4. INTERACTIVE PHONE MOCKUP (ORBIS Voice Agent Simulator)
function initPhoneMockup() {
  const incomingScreen = document.getElementById("incoming-call-screen");
  const activeScreen = document.getElementById("active-call-screen");
  const completeScreen = document.getElementById("complete-call-screen");
  
  const acceptBtn = document.getElementById("accept-call-btn");
  const hangupBtn = document.getElementById("hangup-call-btn");
  const confirmBtn = document.getElementById("confirm-action-btn");
  const declineBtn = incomingScreen ? incomingScreen.querySelector(".call-decline") : null;
  
  const transcriptArea = document.getElementById("transcript-area");
  const soundwave = document.getElementById("soundwave-pulse");
  const timerEl = document.getElementById("call-timer");
  
  let callTimerInterval = null;
  let activeTimers = [];

  if (!incomingScreen || !activeScreen || !completeScreen) return;

  const resetPhone = () => {
    // Clear all intervals and timeouts
    clearInterval(callTimerInterval);
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers = [];
    
    // Hide and show screens
    activeScreen.classList.remove("active");
    completeScreen.classList.remove("active");
    incomingScreen.classList.add("active");
    
    // Reset properties
    if (soundwave) soundwave.classList.remove("active-call-running");
    if (timerEl) timerEl.textContent = "00:00";
    if (transcriptArea) transcriptArea.innerHTML = "";
    if (confirmBtn) confirmBtn.classList.remove("visible");
  };

  const addTranscriptBubble = (text, type, delay) => {
    const timer = setTimeout(() => {
      const bubble = document.createElement("div");
      bubble.className = `transcript-bubble ${type}`;
      bubble.textContent = text;
      transcriptArea.appendChild(bubble);
      
      // Force layout calculation and show bubble
      setTimeout(() => {
        bubble.classList.add("visible");
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
      }, 50);

      // Play soft synth indicator sound for incoming agent text
      if (type === "agent") {
        playWelcomeChime();
      }
    }, delay);
    activeTimers.push(timer);
  };

  const startCallTimer = () => {
    let seconds = 0;
    timerEl.textContent = "00:00";
    callTimerInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60).toString().padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
  };

  // Decline incoming call
  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      playClickTone();
      resetPhone();
    });
  }

  // Hangup active call
  if (hangupBtn) {
    hangupBtn.addEventListener("click", () => {
      playClickTone();
      resetPhone();
    });
  }

  // Accept incoming call
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      playWelcomeChime();
      incomingScreen.classList.remove("active");
      activeScreen.classList.add("active");
      
      if (soundwave) soundwave.classList.add("active-call-running");
      startCallTimer();

      const isEn = window.location.pathname.includes("-en.html") || document.documentElement.lang === "en";

      // Dialogue Sequence
      const bubble1 = isEn 
        ? "Hello Temo! A new meat invoice just arrived. During the audit, I detected a price discrepancy on Ribeye."
        : "Здравствуйте, Темо! Поступил новый счет за мясо от поставщика. При аудите я обнаружил завышение цены на позицию Рибай.";
      
      const bubble2 = isEn
        ? "The overcharge is $240 compared to our contract rate. Shall I draft a dispute and send it to the supplier?"
        : "Переплата составляет $240 по сравнению с нашей базовой контрактной ценой. Сформировать претензию и отправить поставщику?";

      addTranscriptBubble(bubble1, "agent", 800);
      addTranscriptBubble(bubble2, "agent", 4500);

      // Show confirm button
      const timer = setTimeout(() => {
        if (confirmBtn) {
          confirmBtn.textContent = isEn ? "Yes, send it" : "Да, отправляй";
          confirmBtn.classList.add("visible");
        }
      }, 7200);
      activeTimers.push(timer);
    });
  }

  // Confirm Action
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      playClickTone();
      confirmBtn.classList.remove("visible");
      
      const isEn = window.location.pathname.includes("-en.html") || document.documentElement.lang === "en";

      // User says "Yes"
      const bubble = document.createElement("div");
      bubble.className = "transcript-bubble user";
      bubble.textContent = isEn ? "Yes, send it!" : "Да, отправляй!";
      transcriptArea.appendChild(bubble);
      
      setTimeout(() => {
        bubble.classList.add("visible");
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
      }, 50);

      // Finish conversation and transition to success
      const timer1 = setTimeout(() => {
        playSuccessTone();
        activeScreen.classList.remove("active");
        completeScreen.classList.add("active");
        clearInterval(callTimerInterval);
      }, 1200);
      
      // Reset back to call screening after 5 seconds of success
      const timer2 = setTimeout(() => {
        resetPhone();
      }, 6200);
      
      activeTimers.push(timer1, timer2);
    });
  }
}
initPhoneMockup();

// 5. INTERACTIVE WHATSAPP SIMULATOR (Phone 1)
function initWhatsAppMockup() {
  const chat = document.getElementById("wa-chat-container");
  const typing = document.getElementById("wa-typing-indicator");
  const status = document.getElementById("wa-status");
  
  if (!chat || !typing) return;
  
  // Script dialogue in Russian or English depending on page language
  const isEn = window.location.pathname.includes("-en.html") || document.documentElement.lang === "en";
  
  const scriptRU = [
    { type: "in", text: "Prime Cost за неделю: 58.4%. Маржа выросла на +1.2% за счет оптимизации закупок мяса.", time: "Пн, 07:01" },
    { type: "in", text: "🚨 Найден счет от Sysco с завышением цены на лосось. Сумма переплаты $340. Подготовить претензию поставщику в вашем стиле?", time: "Вт, 09:14" },
    { type: "out", text: "Да, отправляй.", time: "Вт, 09:15" },
    { type: "in", text: "[Отправлено] Претензия Sysco доставлена на email. Ожидайте кредит в течение 3 рабочих дней.", time: "Вт, 09:16" },
    { type: "in", text: "⭐ Yelp: новая оценка 2 звезды. По жалобе на шум за столом 14. Ответ в тональности заведения готов. Опубликовать?", time: "Ср, 10:12" },
    { type: "out", text: "Отправляй.", time: "Ср, 10:14" },
    { type: "in", text: "[Опубликовано] Ответ размещен. Оценка клиента изменена на 4 звезды в 23:58. ✓", time: "Ср, 23:59" },
    { type: "in", text: "☀️ Отчет: $340 сэкономлено, репутация спасена, переработок персонала нет.", time: "Пт, 18:00" },
    { type: "out", text: "Отлично, варю кофе. 👍", time: "Пт, 18:01" }
  ];

  const scriptEN = [
    { type: "in", text: "Weekly P&L: Prime Cost 58.4%. Margin up +1.2% due to meat supplier audit.", time: "Mon 7:01 AM" },
    { type: "in", text: "🚨 Sysco invoice off by $340 on Salmon. Dispute drafted in your brand voice. Send it?", time: "Tue 9:14 AM" },
    { type: "out", text: "Send it.", time: "Tue 9:15 AM" },
    { type: "in", text: "[Sent] Dispute email delivered. Credit expected in 3 business days.", time: "Tue 9:16 AM" },
    { type: "in", text: "⭐ Yelp: new 2-star review. Table 14 noise. Response ready in brand voice. Post it?", time: "Wed 10:12 AM" },
    { type: "out", text: "Send it.", time: "Wed 10:14 AM" },
    { type: "in", text: "[Sent] Response posted. Review updated to 4 stars at 11:58 PM. ✓", time: "Wed 11:59 PM" },
    { type: "in", text: "☀️ Shift report: $340 recovered, reputation secure, no overtime. All stable.", time: "Fri 6:00 PM" },
    { type: "out", text: "Great. Making coffee. 👍", time: "Fri 6:01 PM" }
  ];

  const script = isEn ? scriptEN : scriptRU;
  const ticks = `<svg class="wa-blue-tick" viewBox="0 0 16 11"><path d="M11.8 1L15 4.2 8.6 10.5 7.4 9.3 11.8 1zM7.6 1L10.8 4.2 4.4 10.5 1 7.1 2.2 5.9 4.4 8.1 7.6 1z"/></svg>`;
  
  let idx = 0;
  let activeTimeouts = [];

  const clearTimeouts = () => {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts = [];
  };

  const resetChat = () => {
    clearTimeouts();
    chat.innerHTML = "";
    chat.appendChild(typing);
    typing.style.display = "none";
    if (status) status.textContent = "online";
    idx = 0;
    activeTimeouts.push(setTimeout(nextMessage, 1500));
  };

  const addMessageBubble = (text, type, time) => {
    const bubble = document.createElement("div");
    bubble.className = "wa-msg " + (type === "in" ? "wa-msg-in" : "wa-msg-out");
    bubble.innerHTML = text + `<div class="wa-msg-meta">${time} ${type === "out" ? ticks : ""}</div>`;
    chat.insertBefore(bubble, typing);
    chat.scrollTop = chat.scrollHeight;
    
    if (type === "in") {
      playClickTone();
    }
  };

  const nextMessage = () => {
    if (idx >= script.length) {
      activeTimeouts.push(setTimeout(resetChat, 6000));
      return;
    }

    const currentMsg = script[idx];
    
    if (currentMsg.type === "in") {
      if (status) status.textContent = "typing...";
      typing.style.display = "block";
      chat.scrollTop = chat.scrollHeight;
      
      activeTimeouts.push(setTimeout(() => {
        typing.style.display = "none";
        if (status) status.textContent = "online";
        addMessageBubble(currentMsg.text, "in", currentMsg.time);
        idx++;
        activeTimeouts.push(setTimeout(nextMessage, 2200));
      }, 1500));
    } else {
      addMessageBubble(currentMsg.text, "out", currentMsg.time);
      idx++;
      activeTimeouts.push(setTimeout(nextMessage, 2000));
    }
  };

  resetChat();
}
initWhatsAppMockup();

