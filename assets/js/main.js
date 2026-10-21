/* ==========================================================================
   况益帆 · portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const staticMode = new URLSearchParams(window.location.search).has("static");
  if (staticMode) document.documentElement.classList.add("static-mode");

  /* ------------------------------------------------------------------------
     Loader
     ------------------------------------------------------------------------ */

  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderPct = $("#loaderPct");
  const skipLoader = $("#skipLoader");

  let loaderDone = false;

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    if (loaderBar) loaderBar.style.width = "100%";
    if (loaderPct) loaderPct.textContent = "100%";
    document.body.classList.remove("is-loading");
    window.setTimeout(() => {
      loader?.classList.add("is-done");
      loader?.setAttribute("aria-hidden", "true");
    }, reduced ? 30 : 240);
  }

  if (loader) {
    if (reduced || staticMode) {
      loaderDone = true;
      document.body.classList.remove("is-loading");
      loader.classList.add("is-done");
      loader.setAttribute("aria-hidden", "true");
    } else {
      let pct = 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 720);
        pct = Math.round(p * 100);
        if (loaderBar) loaderBar.style.width = pct + "%";
        if (loaderPct) loaderPct.textContent = pct + "%";
        if (p < 1) requestAnimationFrame(tick);
        else window.setTimeout(finishLoader, 180);
      };
      requestAnimationFrame(tick);
      skipLoader?.addEventListener("click", finishLoader);
      window.setTimeout(finishLoader, 2600);
    }
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */

  const reveals = $$(".reveal");

  if ("IntersectionObserver" in window && !reduced && !staticMode) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ------------------------------------------------------------------------
     Count-up stats
     ------------------------------------------------------------------------ */

  const counters = $$("[data-count]");

  function animateCount(el) {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduced || staticMode) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = parseFloat(el.dataset.count || "0").toFixed(parseInt(el.dataset.decimals || "0", 10));
    });
  }

  /* ------------------------------------------------------------------------
     Header, mobile menu, scroll progress
     ------------------------------------------------------------------------ */

  const header = $(".site-header");
  const progressBar = $("#progressBar");
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  function onScroll() {
    const top = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, top / max) : 0;
    if (progressBar) progressBar.style.width = (p * 100).toFixed(2) + "%";
    header?.classList.toggle("is-scrolled", top > 20);
  }

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          onScroll();
          scrollTicking = false;
        });
      }
    },
    { passive: true }
  );
  onScroll();

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    if (menuToggle) menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    if (open) {
      window.setTimeout(() => $("a", mobileMenu)?.focus(), 240);
    } else {
      menuToggle?.focus({ preventScroll: true });
    }
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!document.body.classList.contains("nav-open"));
  });

  $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* active nav */
  const navLinks = $$(".nav a");
  const sections = ["about", "accounts", "method", "travel", "ai", "experience"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
        });
      },
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ------------------------------------------------------------------------
     Cursor + parallax
     ------------------------------------------------------------------------ */

  const glow = $(".cursor-glow");
  const ring = $(".cursor-ring");

  if (finePointer && !reduced) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const loop = () => {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      if (glow) glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.addEventListener(
      "pointermove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerover",
      (e) => {
        if (e.target.closest("a, button, .account-card, .travel-card, .ai-shot, .player-portrait")) {
          ring?.classList.add("is-hot");
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerout",
      (e) => {
        if (e.target.closest("a, button, .account-card, .travel-card, .ai-shot, .player-portrait")) {
          ring?.classList.remove("is-hot");
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      if (glow) glow.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      if (glow) glow.style.opacity = "";
      if (ring) ring.style.opacity = "";
    });

    window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
  } else {
    if (glow) glow.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  /* parallax floats */
  if (finePointer && !reduced) {
    const parallaxEls = $$("[data-parallax]").filter((el) => el.id !== "playerCard");
    let pRaf = 0;
    let px = 0;
    let py = 0;

    window.addEventListener(
      "pointermove",
      (e) => {
        px = e.clientX / window.innerWidth - 0.5;
        py = e.clientY / window.innerHeight - 0.5;
        if (pRaf) return;
        pRaf = requestAnimationFrame(() => {
          parallaxEls.forEach((el) => {
            const depth = parseFloat(el.dataset.parallax || "10");
            el.style.translate = `${(px * depth).toFixed(2)}px ${(py * depth).toFixed(2)}px`;
          });
          pRaf = 0;
        });
      },
      { passive: true }
    );
  }

  /* player card tilt */
  const playerCard = $("#playerCard");
  if (playerCard && finePointer && !reduced) {
    const wrap = playerCard.parentElement;
    wrap?.addEventListener("pointermove", (e) => {
      const rect = playerCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      playerCard.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    });
    wrap?.addEventListener("pointerleave", () => {
      playerCard.style.transform = "";
    });
  }

  /* portrait toggle */
  const portrait = $("#portraitToggle");
  function togglePortrait() {
    if (!portrait) return;
    const on = portrait.classList.toggle("is-revealed");
    portrait.setAttribute("aria-pressed", String(on));
  }
  portrait?.addEventListener("click", togglePortrait);
  portrait?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePortrait();
    }
  });

  /* ------------------------------------------------------------------------
     Hero stars
     ------------------------------------------------------------------------ */

  const starsWrap = $("#heroStars");
  if (starsWrap) {
    const count = reduced ? 26 : 58;
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      const size = Math.random() > 0.82 ? 3 : 2;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.opacity = String(0.2 + Math.random() * 0.6);
      s.style.setProperty("--dur", (3 + Math.random() * 4).toFixed(2) + "s");
      s.style.setProperty("--delay", (-Math.random() * 6).toFixed(2) + "s");
      starsWrap.appendChild(s);
    }
  }

  /* ------------------------------------------------------------------------
     Game radar tabs
     ------------------------------------------------------------------------ */

  const radarTabs = $$(".radar__tabs [role='tab']");
  const genrePanels = $$(".genre-panel");

  function selectGenre(tab) {
    radarTabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    genrePanels.forEach((panel) => {
      const match = panel.id === tab.getAttribute("aria-controls");
      panel.hidden = !match;
      panel.classList.toggle("is-active", match);
    });
  }

  radarTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectGenre(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      const next = radarTabs[(i + dir + radarTabs.length) % radarTabs.length];
      selectGenre(next);
      next.focus();
    });
  });
  radarTabs.forEach((tab, i) => {
    tab.tabIndex = i === 0 ? 0 : -1;
  });

  /* ------------------------------------------------------------------------
     Account data + modal
     ------------------------------------------------------------------------ */

  const accounts = {
    niuma: {
      name: "游戏牛马仙女",
      platform: "抖音",
      id: "33424170312",
      tier: "核心经营 / CORE 01",
      quote: "“什么热门玩什么的杂食党，既是牛马也是仙女。”",
      likes: "2.3w",
      fans: "588",
      works: "178",
      tags: ["多品类", "模拟器场景", "打工人人设"],
      img: "assets/accounts/douyin-niuma.webp",
      insight:
        "把“打工人 + 玩家”双身份做成记忆点，把模拟器的多开、大屏、不卡等卖点写进日常摸鱼场景；不硬讲参数，先让用户觉得“这说的就是我”。"
    },
    zheng7: {
      name: "我真的争7",
      platform: "抖音",
      id: "93938582693",
      tier: "核心经营 / CORE 02",
      quote: "“争7不争气，但咱心态好！”",
      likes: "2.7w",
      fans: "480",
      works: "151",
      tags: ["金铲铲", "棋牌竞技", "上分情绪"],
      img: "assets/accounts/douyin-zheng7.webp",
      insight:
        "围绕版本阵容、上分情绪和“争 7”梗做内容；标题先给结论，评论区收集分段痛点，再把玩家原话变成下一条选题。"
    },
    haiwang: {
      name: "游戏在逃海王",
      platform: "抖音",
      id: "25851862279",
      tier: "核心经营 / CORE 03",
      quote: "“乙女向海王，模拟经营狂热粉。”",
      likes: "2.1w",
      fans: "600",
      works: "102",
      tags: ["乙女向", "模拟经营", "颜值卖点"],
      img: "assets/accounts/douyin-haiwang.webp",
      insight:
        "乙女向内容先卖角色与氛围，再讲活动与福利；把“老公颜值翻倍”“大屏沉浸感”转成可视化封面，让卖点在第一眼成立。"
    },
    yabiao: {
      name: "传奇押镖人",
      platform: "抖音",
      id: "50771178615",
      tier: "协助运营 / ASSIST 01",
      quote: "“十年老骨灰，只玩真传奇。”",
      likes: "1.4w",
      fans: "987",
      works: "103",
      tags: ["传奇", "MMO", "情怀叙事"],
      img: "assets/accounts/douyin-yabiao.webp",
      insight:
        "老玩家要的是“当年那口气”：攻沙、爆装、兄弟情，比参数更有说服力。用情怀开场，用实机证明这服不坑。"
    },
    haima: {
      name: "海马濑人说是",
      platform: "抖音",
      id: "21813125771",
      tier: "协助运营 / ASSIST 02",
      quote: "“动作游戏老炮，卡牌深度党。”",
      likes: "9617",
      fans: "329",
      works: "153",
      tags: ["动作", "卡牌", "硬核攻略"],
      img: "assets/accounts/douyin-haima.webp",
      insight:
        "硬核攻略要给结论：抽不抽、练不练、怎么配。把长视频拆成“结论前置 + 证据后置”，降低新玩家的理解成本。"
    },
    eryou: {
      name: "二游兔",
      platform: "抖音",
      id: "74621219587",
      tier: "协助运营 / ASSIST 03",
      quote: "“爱蹲草丛的兔子，带你抽卡舔屏。”",
      likes: "9063",
      fans: "237",
      works: "146",
      tags: ["二次元", "女性向", "审美封面"],
      img: "assets/accounts/douyin-eryou.webp",
      insight:
        "二次元内容先对味再讲理：高审美封面承接角色情绪，标题承接版本/抽卡需求；评论区维护比单向发布更重要。"
    }
  };

  const modal = $("#accountModal");
  const modalImg = $("#modalImg");
  const modalTitle = $("#modalTitle");
  const modalPlatform = $("#modalPlatform");
  const modalId = $("#modalId");
  const modalTier = $("#modalTier");
  const modalQuote = $("#modalQuote");
  const modalStats = $("#modalStats");
  const modalTags = $("#modalTags");
  const modalInsight = $("#modalInsight");
  const modalLink = $("#modalLink");
  const modalClose = $("#modalClose");
  const copyAccountId = $("#copyAccountId");

  let lastFocused = null;
  let currentAccount = null;

  function searchUrl(name) {
    return "https://www.douyin.com/search/" + encodeURIComponent(name) + "?type=user";
  }

  function openModal(key) {
    const data = accounts[key];
    if (!data || !modal) return;
    currentAccount = data;
    lastFocused = document.activeElement;

    if (modalImg) {
      modalImg.src = data.img;
      modalImg.alt = data.name + " 抖音主页截图";
    }
    if (modalTitle) modalTitle.textContent = data.name;
    if (modalId) modalId.textContent = "抖音号 " + data.id;
    if (modalTier) modalTier.textContent = data.tier + " · 抖音";
    if (modalQuote) modalQuote.textContent = data.quote;
    if (modalStats) {
      modalStats.innerHTML = `<span><b>${data.likes}</b>获赞</span><span><b>${data.fans}</b>粉丝</span><span><b>${data.works}</b>作品</span>`;
    }
    if (modalTags) {
      modalTags.innerHTML = data.tags.map((t) => `<span>${t}</span>`).join("");
    }
    if (modalInsight) modalInsight.textContent = data.insight;
    if (modalLink) modalLink.href = searchUrl(data.name);
    if (modalPlatform) {
      modalPlatform.textContent = "抖音";
      modalPlatform.className = "platform platform--dy";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => modalClose?.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentAccount = null;
    lastFocused?.focus?.({ preventScroll: true });
  }

  function trapFocus(e) {
    if (!modal || !modal.classList.contains("is-open") || e.key !== "Tab") return;
    const focusables = $$(
      "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
      modal
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $$(".account-card").forEach((card) => {
    const key = card.dataset.account;
    const open = () => openModal(key);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  modalClose?.addEventListener("click", closeModal);
  $("[data-close]", modal)?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal?.classList.contains("is-open")) closeModal();
      if (document.body.classList.contains("nav-open")) setMenu(false);
      if ($("#lightbox")?.classList.contains("is-open")) closeLightbox();
    }
    trapFocus(e);
  });

  copyAccountId?.addEventListener("click", () => {
    if (!currentAccount) return;
    copyText(currentAccount.id, "账号 ID 已复制：" + currentAccount.id);
  });

  /* ------------------------------------------------------------------------
     Account filters
     ------------------------------------------------------------------------ */

  const filterButtons = $$(".filter");
  const accountCards = $$(".account-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      accountCards.forEach((card) => {
        let show = true;
        if (filter === "core" || filter === "assist") show = card.dataset.tier === filter;
        if (filter === "douyin") show = card.dataset.platform === "douyin";
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("in");
      });
      playBlip(520, 0.04);
    });
  });

  /* ------------------------------------------------------------------------
     Pipeline
     ------------------------------------------------------------------------ */

  const steps = $$(".pipeline .step");
  const stepTitle = $("#stepTitle");
  const stepDesc = $("#stepDesc");
  const pipelineLine = $(".pipeline__line i");

  function selectStep(step) {
    const idx = steps.indexOf(step);
    steps.forEach((s) => s.classList.toggle("is-active", s === step));
    const title = $("h3", step)?.textContent || "";
    const desc = $("p", step)?.textContent || "";
    if (stepTitle) stepTitle.textContent = title;
    if (stepDesc) stepDesc.textContent = desc;
    if (pipelineLine) pipelineLine.style.width = (((idx + 0.5) / steps.length) * 100).toFixed(1) + "%";
    playBlip(600, 0.03);
  }

  steps.forEach((step) => {
    step.addEventListener("click", () => selectStep(step));
    step.addEventListener("focus", () => selectStep(step));
  });

  /* ------------------------------------------------------------------------
     AI workbench tabs
     ------------------------------------------------------------------------ */

  const wbData = {
    gen: {
      src: "assets/ai/hi_1.webp",
      alt: "喜聚创作台 AI 生图界面，包含提示词、比例与历史海报",
      label: "01 / TEXT TO IMAGE",
      text: "接入 GPT 图片生成，把短视频封面/海报需求写成提示词，直接产出可用视觉；历史资产可复用。"
    },
    word: {
      src: "assets/ai/hi_3.webp",
      alt: "喜聚创作台敏感词检测界面与词库词云",
      label: "02 / SENSITIVE WORD CHECK",
      text: "针对游戏/模拟器场景补充敏感词、风险词、可能违规词；用词库把审核经验沉淀下来，支持脚本发布前检查。"
    },
    intel: {
      src: "assets/ai/hi_detect.webp",
      alt: "喜聚创作台游戏情报中心选题列表",
      label: "03 / GAME INTELLIGENCE",
      text: "把版本公告、平台信息与玩家讨论整理成可执行的选题建议，减少“拍脑袋想选题”，提高内容命中率。"
    }
  };

  const wbTabs = $$(".wb-tabs [role='tab']");
  const wbImage = $("#wbImage");
  const wbCaption = $("#wbCaption");
  const wbStage = $("#wb-panel");

  function selectWorkbench(tab) {
    const key = tab.dataset.wb;
    const data = wbData[key];
    if (!data) return;
    wbTabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    if (wbStage) {
      wbStage.dataset.wb = key;
      wbStage.setAttribute("aria-labelledby", tab.id);
    }
    if (wbImage) {
      wbImage.style.opacity = "0";
      wbImage.src = data.src;
      wbImage.alt = data.alt;
      wbImage.onload = () => {
        wbImage.style.opacity = "1";
        wbImage.onload = null;
      };
      if (wbImage.complete && wbImage.naturalWidth > 0) {
        wbImage.style.opacity = "1";
      }
    }
    if (wbCaption) {
      wbCaption.innerHTML = `<span class="pixel-label">${data.label}</span><p>${data.text}</p>`;
    }
    playBlip(680, 0.035);
  }

  wbTabs.forEach((tab) => {
    tab.addEventListener("click", () => selectWorkbench(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const i = wbTabs.indexOf(tab);
      const next = wbTabs[(i + (e.key === "ArrowRight" ? 1 : -1) + wbTabs.length) % wbTabs.length];
      next.focus();
      selectWorkbench(next);
    });
  });

  /* preload workbench screenshots */
  Object.values(wbData).forEach((d) => {
    const img = new Image();
    img.src = d.src;
  });

  /* ------------------------------------------------------------------------
     AI demo
     ------------------------------------------------------------------------ */

  const runDemo = $("#runDemo");
  const terminal = $("#terminalLines");
  const demoOutput = $("#demoOutput");
  let demoting = false;

  const demoLines = [
    ["brief received: 三国杀 × 猪猪侠 / 联动 PVE", ""],
    ["audience: 泛游戏用户 / 三国杀玩家 / 亲子场景", ""],
    ["prompt: 3D 卡通猪侠 + 国风武将 + 桌面卡牌 + 暖光", ""],
    ["calling image model... [GPT IMAGE]", "ok"],
    ["checking safe area / logo / sensitive words... [PASS]", "ok"],
    ["exporting 16:9 / 3:4 / 4:3... [DONE]", "ok"]
  ];

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function addTerminalLine(text, cls = "") {
    if (!terminal) return;
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = `<span>&gt;</span> ${text}`;
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
  }

  async function runDemoFlow() {
    if (demoting || !terminal || !demoOutput) return;
    demoting = true;
    demoOutput.classList.remove("is-done");
    terminal.innerHTML = "";
    runDemo.disabled = true;
    runDemo.innerHTML = 'RUNNING... <span aria-hidden="true">▮</span>';
    for (const [line, cls] of demoLines) {
      addTerminalLine(line, cls);
      playBlip(cls === "ok" ? 760 : 600, 0.025);
      await wait(reduced ? 40 : 460);
    }
    demoOutput.classList.add("is-done");
    runDemo.disabled = false;
    runDemo.innerHTML = 'RUN AGAIN <span aria-hidden="true">↻</span>';
    demoting = false;
  }

  runDemo?.addEventListener("click", runDemoFlow);

  /* ------------------------------------------------------------------------
     Quests accordion
     ------------------------------------------------------------------------ */

  const quests = $$(".quest");

  quests.forEach((quest) => {
    const head = $(".quest__head", quest);
    const body = $(".quest__body", quest);
    if (!body) return;
    const initialOpen = quest.classList.contains("is-open");
    body.hidden = false;
    body.inert = !initialOpen;
    body.setAttribute("aria-hidden", String(!initialOpen));

    head?.addEventListener("click", () => {
      const isOpen = quest.classList.contains("is-open");
      if (isOpen) {
        quest.classList.remove("is-open");
        head.setAttribute("aria-expanded", "false");
        body.setAttribute("aria-hidden", "true");
        window.setTimeout(() => {
          if (!quest.classList.contains("is-open")) body.inert = true;
        }, 460);
      } else {
        quest.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        body.inert = false;
        body.setAttribute("aria-hidden", "false");
      }
      playBlip(isOpen ? 380 : 560, 0.04);
    });
  });

  /* ------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------ */

  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxClose = $("#lightboxClose");

  function openLightbox(src, caption, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || caption || "";
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => lightboxClose?.focus(), 50);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    if (!modal?.classList.contains("is-open")) document.body.style.overflow = "";
    lightboxClose?.blur();
  }

  $$("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openLightbox(btn.dataset.lightbox, btn.dataset.caption, $("img", btn)?.alt);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  $("[data-lightbox-close]", lightbox)?.addEventListener("click", closeLightbox);

  /* ------------------------------------------------------------------------
     Copy / toast
     ------------------------------------------------------------------------ */

  const toast = $("#toast");
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 2400);
  }

  function copyText(text, message) {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast(message || "已复制");
      } catch {
        showToast("复制失败，请手动选择");
      }
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => showToast(message || "已复制"),
        fallback
      );
    } else {
      fallback();
    }
  }

  $("#copyEmail")?.addEventListener("click", () => {
    copyText("ky3358690634@qq.com", "邮箱已复制：ky3358690634@qq.com");
    playBlip(720, 0.05);
  });

  /* ------------------------------------------------------------------------
     SFX
     ------------------------------------------------------------------------ */

  const sfxToggle = $("#sfxToggle");
  let sfxOn = false;
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx?.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playBlip(freq = 620, dur = 0.04) {
    if (!sfxOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.028, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.01);
  }

  sfxToggle?.addEventListener("click", () => {
    sfxOn = !sfxOn;
    sfxToggle.setAttribute("aria-pressed", String(sfxOn));
    const label = $(".sfx-label", sfxToggle);
    if (label) label.textContent = sfxOn ? "SFX ON" : "SFX OFF";
    if (sfxOn) {
      ensureAudio();
      playBlip(880, 0.06);
      window.setTimeout(() => playBlip(1180, 0.07), 90);
    }
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!sfxOn) return;
      if (e.target.closest("a, button, .account-card, .travel-card, .ai-shot")) playBlip(620, 0.025);
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------------
     Konami code easter egg
     ------------------------------------------------------------------------ */

  const konami = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let konamiIndex = 0;
  let cheatUnlocked = false;

  function confettiBurst() {
    const layer = $("#confettiLayer");
    if (!layer) return;
    const colors = ["#d8ff3e", "#5ce1e6", "#ff4d8d", "#ffb020", "#f3f4ee"];
    for (let i = 0; i < 74; i += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = 4 + Math.random() * 7 + "px";
      piece.style.height = 4 + Math.random() * 10 + "px";
      piece.style.setProperty("--dur", (1.8 + Math.random() * 1.8).toFixed(2) + "s");
      piece.style.setProperty("--delay", (Math.random() * 0.5).toFixed(2) + "s");
      piece.style.setProperty("--drift", (Math.random() * 240 - 120).toFixed(0) + "px");
      piece.style.setProperty("--rot", (Math.random() * 1080).toFixed(0) + "deg");
      layer.appendChild(piece);
    }
    window.setTimeout(() => {
      layer.innerHTML = "";
    }, 4200);
  }

  function unlockCheat() {
    if (cheatUnlocked) return;
    cheatUnlocked = true;
    document.body.classList.add("cheat-mode");
    showToast("CHEAT UNLOCKED // 隐藏关卡已开启");
    confettiBurst();
    playBlip(880, 0.06);
    window.setTimeout(() => playBlip(1320, 0.08), 120);
    window.setTimeout(() => playBlip(1760, 0.1), 240);
    const note = $("#cheatNote");
    if (note) note.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        unlockCheat();
      }
    } else {
      konamiIndex = key === konami[0] ? 1 : 0;
    }
  });

  /* ------------------------------------------------------------------------
     Small quality-of-life: mark external links, current year
     ------------------------------------------------------------------------ */

  $$('a[target="_blank"]').forEach((a) => {
    a.setAttribute("rel", "noopener noreferrer");
  });

  const year = new Date().getFullYear();
  $$(".footer-bottom > span:last-child").forEach((el) => {
    el.textContent = el.textContent.replace(/2026/g, String(year));
  });

  /* Optional deep link for QA screenshots: ?static&start=accounts */
  const params = new URLSearchParams(window.location.search);
  const startId = params.get("start");
  if (startId) {
    const target = document.getElementById(startId);
    if (target) {
      requestAnimationFrame(() => {
        const headerH = header?.offsetHeight || 0;
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - headerH);
      });
    }
  }

  /* Single-section QA view: ?static&only=about */
  const onlyId = params.get("only");
  if (onlyId) {
    const target = document.getElementById(onlyId);
    if (target) {
      document.documentElement.classList.add("only-mode");
      target.classList.add("is-qa-target");
      window.scrollTo(0, 0);
    }
  }

  /* expose a tiny debug handle (harmless) */
  window.__KYF__ = { openModal, closeModal, unlockCheat };
})();
