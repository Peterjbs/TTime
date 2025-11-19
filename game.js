
(() => {
  console.log("[Init] game.js (advanced engine) initializing");

  // -----------------------------
  // Globals
  // -----------------------------
  const quads = [];
  let videos = [];
  let createdObjectURLs = new Set();
  let cycleAbort = false;
  const activeIntervals = new Set();
  let fallbackLoadPromise = null;

  const status = document.getElementById("status");
  const folderPicker = document.getElementById("folderPicker");
  const btnStart = document.getElementById("btnStart");
  const btnStop = document.getElementById("btnStop");
  const btnFSAll = document.getElementById("btnFSAll");
  const btnMuteAll = document.getElementById("btnMuteAll");

  // -----------------------------
  // Vibes
  // -----------------------------
  const VIBES = [
    {
      key: "neon-arena",
      name: "Neon Arena",
      palette: {
        base: "#050816",
        accent: "#ff3b9d",
        dark: "#02040a",
      },
      text: "#f8f2ff",
      panel_pattern:
        "radial-gradient(circle at top left, rgba(255,59,157,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(40,193,255,0.18), transparent 60%), linear-gradient(135deg, #02030a 0%, #050816 45%, #050816 55%, #02030a 100%)",
      layout: {
        video: 3,
        panel: 2,
      },
      font: {
        family:
          "'Orbitron', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "600",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.25) saturate(1.3) brightness(1.05)",
        css_animation:
          "neonArenaDrift 16s ease-in-out infinite alternate, neonArenaHue 32s linear infinite",
        overlay_gradient:
          "radial-gradient(circle at 20% 10%, rgba(255,59,157,0.35), transparent 55%), radial-gradient(circle at 80% 90%, rgba(40,193,255,0.28), transparent 55%)",
        overlay_blend_mode: "screen",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 18000,
    },
    {
      key: "midnight-court",
      name: "Midnight Court",
      palette: {
        base: "#050910",
        accent: "#ffb547",
        dark: "#020307",
      },
      text: "#fdf7ec",
      panel_pattern:
        "linear-gradient(145deg, rgba(6,10,18,0.98), rgba(6,10,18,0.94)), repeating-linear-gradient(135deg, rgba(255,181,71,0.12) 0, rgba(255,181,71,0.12) 1px, transparent 1px, transparent 4px)",
      layout: {
        video: 5,
        panel: 3,
      },
      font: {
        family: "'Playfair Display', 'Times New Roman', serif",
        weight: "500",
        transform: "none",
      },
      video_effects: {
        css_filter: "contrast(1.18) saturate(1.15) brightness(0.98)",
        css_animation: "midnightCourtZoom 22s ease-in-out infinite alternate",
        overlay_gradient:
          "linear-gradient(180deg, rgba(5,9,16,0) 0%, rgba(5,9,16,0.45) 55%, rgba(5,9,16,0.85) 100%)",
        overlay_blend_mode: "soft-light",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 24000,
    },
    {
      key: "chromatic-rush",
      name: "Chromatic Rush",
      palette: {
        base: "#05040b",
        accent: "#7bffb3",
        dark: "#010107",
      },
      text: "#f3fff9",
      panel_pattern:
        "linear-gradient(135deg, rgba(123,255,179,0.18), rgba(81,119,255,0.18)), radial-gradient(circle at 0% 100%, rgba(255,94,247,0.32), transparent 60%), radial-gradient(circle at 100% 0%, rgba(0,229,255,0.32), transparent 60%)",
      layout: {
        video: 4,
        panel: 2,
      },
      font: {
        family:
          "'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "700",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.3) saturate(1.5) brightness(1.05)",
        css_animation:
          "chromaticRushHue 28s linear infinite, chromaticRushDrift 18s ease-in-out infinite alternate",
        overlay_gradient:
          "conic-gradient(from 180deg at 50% 50%, rgba(255,94,247,0.18), rgba(0,229,255,0.24), rgba(123,255,179,0.18), rgba(255,94,247,0.18))",
        overlay_blend_mode: "overlay",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 15000,
    },
    {
      key: "glass-studio",
      name: "Glass Studio",
      palette: {
        base: "#0b1018",
        accent: "#46c5ff",
        dark: "#05070b",
      },
      text: "#f6fbff",
      panel_pattern:
        "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)), radial-gradient(circle at top left, rgba(70,197,255,0.22), transparent 55%)",
      layout: {
        video: 5,
        panel: 3,
      },
      font: {
        family:
          "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "600",
        transform: "none",
      },
      video_effects: {
        css_filter: "contrast(1.18) saturate(1.1) brightness(1.1)",
        css_animation: "glassStudioParallax 26s ease-in-out infinite alternate",
        overlay_gradient:
          "linear-gradient(135deg, rgba(15,21,32,0.1), rgba(15,21,32,0.7)), radial-gradient(circle at 10% 0%, rgba(70,197,255,0.18), transparent 60%)",
        overlay_blend_mode: "screen",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 21000,
    },
    {
      key: "sunset-drive",
      name: "Sunset Drive",
      palette: {
        base: "#1b0a22",
        accent: "#ff8a3c",
        dark: "#06020a",
      },
      text: "#fff5eb",
      panel_pattern:
        "linear-gradient(180deg, rgba(255,157,92,0.18), rgba(50,7,76,0.9)), radial-gradient(circle at top right, rgba(255,214,102,0.35), transparent 55%)",
      layout: {
        video: 4,
        panel: 3,
      },
      font: {
        family:
          "'Quicksand', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "700",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.12) saturate(1.45) brightness(1.02)",
        css_animation: "sunsetDriveSway 20s ease-in-out infinite alternate",
        overlay_gradient:
          "linear-gradient(135deg, rgba(255,138,60,0.45), rgba(255,214,102,0.18), rgba(151,71,255,0.35))",
        overlay_blend_mode: "soft-light",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 19000,
    },
    {
      key: "monolith-grid",
      name: "Monolith Grid",
      palette: {
        base: "#050608",
        accent: "#00ffaa",
        dark: "#010203",
      },
      text: "#f8fff9",
      panel_pattern:
        "linear-gradient(135deg, #050608, #050608), repeating-linear-gradient(90deg, rgba(0,255,170,0.26) 0, rgba(0,255,170,0.26) 1px, transparent 1px, transparent 7px)",
      layout: {
        video: 6,
        panel: 2,
      },
      font: {
        family:
          "'Share Tech Mono', 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        weight: "400",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.35) saturate(1.2) brightness(0.98)",
        css_animation:
          "monolithGridVibrate 32s cubic-bezier(0.42,0,0.58,1) infinite alternate, monolithGridScan 6s linear infinite",
        overlay_gradient:
          "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)",
        overlay_blend_mode: "screen",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 26000,
    },
    {
      key: "aerobic-broadcast",
      name: "Aerobic Broadcast",
      palette: {
        base: "#05131f",
        accent: "#ff4c6a",
        dark: "#02070d",
      },
      text: "#fefaff",
      panel_pattern:
        "linear-gradient(120deg, rgba(5,19,31,0.96), rgba(5,19,31,0.94)), repeating-linear-gradient(-45deg, rgba(255,76,106,0.22) 0, rgba(255,76,106,0.22) 2px, transparent 2px, transparent 6px)",
      layout: {
        video: 5,
        panel: 4,
      },
      font: {
        family:
          "'Bangers', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "400",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.3) saturate(1.4) brightness(1.05)",
        css_animation:
          "aerobicBroadcastPulse 12s ease-in-out infinite alternate, aerobicBroadcastHue 40s linear infinite",
        overlay_gradient:
          "radial-gradient(circle at 10% 0%, rgba(255,76,106,0.45), transparent 60%), radial-gradient(circle at 100% 100%, rgba(86,204,242,0.3), transparent 60%)",
        overlay_blend_mode: "screen",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 17000,
    },
    {
      key: "lunar-laboratory",
      name: "Lunar Laboratory",
      palette: {
        base: "#050916",
        accent: "#8af3ff",
        dark: "#02030a",
      },
      text: "#f5fbff",
      panel_pattern:
        "linear-gradient(145deg, rgba(5,9,22,0.96), rgba(5,9,22,0.94)), radial-gradient(circle at 15% 10%, rgba(138,243,255,0.28), transparent 55%), radial-gradient(circle at 85% 90%, rgba(161,196,253,0.22), transparent 55%)",
      layout: {
        video: 4,
        panel: 3,
      },
      font: {
        family: "'DM Serif Display', 'Times New Roman', serif",
        weight: "400",
        transform: "none",
      },
      video_effects: {
        css_filter: "contrast(1.15) saturate(1.05) brightness(1.08)",
        css_animation: "lunarLabFloat 24s ease-in-out infinite alternate",
        overlay_gradient:
          "radial-gradient(circle at 50% 0%, rgba(138,243,255,0.35), transparent 60%), linear-gradient(180deg, rgba(5,9,22,0.0), rgba(5,9,22,0.8))",
        overlay_blend_mode: "lighten",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 23000,
    },
    {
      key: "ink-theatre",
      name: "Ink Theatre",
      palette: {
        base: "#050307",
        accent: "#ff4f4f",
        dark: "#020104",
      },
      text: "#fff7f2",
      panel_pattern:
        "radial-gradient(circle at top center, rgba(255,79,79,0.22), transparent 55%), linear-gradient(180deg, #050307 0%, #050307 40%, #050307 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)",
      layout: {
        video: 3,
        panel: 2,
      },
      font: {
        family: "'Playfair Display', 'Times New Roman', serif",
        weight: "600",
        transform: "uppercase",
      },
      video_effects: {
        css_filter: "contrast(1.4) saturate(1.2) brightness(0.96)",
        css_animation: "inkTheatreVignette 26s ease-in-out infinite alternate",
        overlay_gradient:
          "radial-gradient(circle at center, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.9) 100%)",
        overlay_blend_mode: "multiply",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 21000,
    },
    {
      key: "soft-echo",
      name: "Soft Echo",
      palette: {
        base: "#070a10",
        accent: "#c1a4ff",
        dark: "#04060b",
      },
      text: "#fdf9ff",
      panel_pattern:
        "linear-gradient(135deg, rgba(193,164,255,0.32), rgba(145,234,228,0.18)), radial-gradient(circle at 0% 100%, rgba(255,214,165,0.35), transparent 55%)",
      layout: {
        video: 4,
        panel: 3,
      },
      font: {
        family:
          "'Quicksand', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        weight: "500",
        transform: "none",
      },
      video_effects: {
        css_filter: "contrast(1.05) saturate(1.08) brightness(1.12)",
        css_animation: "softEchoDrift 30s ease-in-out infinite alternate",
        overlay_gradient:
          "linear-gradient(180deg, rgba(7,10,16,0.1) 0%, rgba(7,10,16,0.75) 70%), radial-gradient(circle at 10% 0%, rgba(193,164,255,0.3), transparent 55%)",
        overlay_blend_mode: "screen",
        overlay_video: null,
      },
      videoChangeFrequencyMs: 25000,
    },
  ];

  // -----------------------------
  // Actions, emoji, phases
  // -----------------------------
  const ACTIONS = [
    {
      label: "Mirror the lead performer",
      description: "Copy everything the main actor does without breaking character.",
      seconds: 60,
      points: 12,
    },
    {
      label: "Hydrate break",
      description: "Drink water (or nearest beverage) slowly and deliberately.",
      seconds: 45,
      points: 8,
    },
    {
      label: "Balance challenge",
      description: "Stand on one foot and hold your pose the entire time.",
      seconds: 75,
      points: 14,
    },
    {
      label: "Feet above head",
      description: "Find a safe way to elevate your legs higher than your head.",
      seconds: 90,
      points: 16,
    },
    {
      label: "Freestyle dance",
      description: "Improvise moves that match the video's energy without stopping.",
      seconds: 80,
      points: 15,
    },
  ];

  const EMOJI = {
    Puff: "🌬️",
    Sniff: "🍾",
    Mask: "🤿",
    Action: "📨",
    Chill: "🧊",
    Replay: "🔁",
    Trivia: "❓",
    Peace: "🕊️",
    RedoLast: "🔂",
    Grid: "🔠",
  };

  const TRIVIA_QUESTIONS = [
    {
      question: "How many ribs does the average human have?",
      answers: ["24", "18", "32"],
      correct: 0,
      points: 10,
    },
    {
      question: "Which planet spins on its side compared to the others?",
      answers: ["Neptune", "Uranus", "Mars"],
      correct: 1,
      points: 8,
    },
    {
      question: "What is the only metal that is liquid at room temperature?",
      answers: ["Mercury", "Gallium", "Sodium"],
      correct: 0,
      points: 10,
    },
    {
      question: "How many minutes are in a standard day?",
      answers: ["1440", "1360", "1520"],
      correct: 0,
      points: 6,
    },
    {
      question: "Which color completes the CMYK model? Cyan, Magenta, Yellow and…",
      answers: ["Black", "Blue", "Khaki"],
      correct: 0,
      points: 7,
    },
    {
      question: "What gas do plants absorb during photosynthesis?",
      answers: ["Oxygen", "Hydrogen", "Carbon dioxide"],
      correct: 2,
      points: 6,
    },
    {
      question: "Which instrument has 47 strings and 7 pedals?",
      answers: ["Harp", "Cello", "Lute"],
      correct: 0,
      points: 9,
    },
    {
      question: "How many bones are babies born with?",
      answers: ["206", "270", "150"],
      correct: 1,
      points: 11,
    },
  ];

  function getVibeBase(q) {
    return (
      q?.vibe?.panel_pattern ||
      q?.vibe?.palette?.base ||
      "#111"
    );
  }

  function getPhaseGroup(phaseName = "") {
    if (phaseName.startsWith("PUFF_")) return "puff";
    if (phaseName.startsWith("SNIFF")) return "sniff";
    if (phaseName.startsWith("MASK")) return "mask";
    if (phaseName.startsWith("ACTION")) return "action";
    return "other";
  }

  // Higher-level phases
  const PHASES = {
    IDLE_GAP: {
      handler: handleIdlePhase,
      // 0–99s random gap reused
      duration: [0, 99000],
      ui: {
        infoColor: "vibe_base",
        showIdleCountdown: true,
      },
    },

    // Puff
    READY_TO_PUFF: {
      handler: handleTimedPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Get Ready to Light",
        videoText: "READY",
      },
    },
    PUFF_LIGHT: {
      handler: handleTimedPhase,
      duration: 25000,
      ui: {
        infoColor: "#FF4500",
        infoText: "LIGHT",
        videoText: "LIGHT",
        videoEffect: "light",
        showCancel: true,
        cancelTarget: "IDLE_GAP",
      },
    },
    PUFF_SMOKE: {
      handler: handleTimedPhase,
      duration: 12000,
      ui: {
        infoColor: "linear-gradient(to bottom, #FFA500, #808080)",
        infoText: "SMOKE",
        videoText: "SMOKE",
        videoEffect: "smoke",
        showCancel: true,
        cancelTarget: "IDLE_GAP",
      },
    },
    PUFF_INHALE: {
      handler: handleTimedPhase,
      duration: 5000,
      ui: {
        infoColor: "#008000",
        infoText: "INHALE",
        videoText: "INHALE",
        videoEffect: "inhale",
        showCancel: true,
        cancelTarget: "PUFF_VALIDATION",
      },
    },
    PUFF_HOLD: {
      handler: handleTimedPhase,
      duration: 4000,
      ui: {
        infoColor: "#808080",
        infoText: "HOLD",
        videoText: "HOLD",
        videoEffect: "hold",
        showCancel: true,
        cancelTarget: "PUFF_VALIDATION",
      },
    },
    PUFF_EXHALE: {
      handler: handleTimedPhase,
      duration: 5000,
      ui: {
        infoColor: "#0000FF",
        infoText: "EXHALE",
        videoText: "EXHALE",
        videoEffect: "exhale",
        showCancel: true,
        cancelTarget: "PUFF_VALIDATION",
      },
    },
    PUFF_VALIDATION: {
      handler: handleValidationPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Did you complete the puff?",
      },
    },
    BREATH_COUNT_QUESTION: {
      handler: handleBreathQuestionPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "How many breaths?",
      },
    },

    // Sniff
    READY_TO_SNIFF: {
      handler: handleTimedPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Get ready to sniff",
        videoText: "READY",
      },
    },
    SNIFF_MAIN: {
      handler: handleTimedPhase,
      duration: 8000,
      ui: {
        infoColor: "#FFFF00",
        infoText: "SNIFF",
        videoText: "SNIFF",
        videoEffect: "sniff",
        // no manual abort; validation handles ✓/✗
      },
    },
    SNIFF_VALIDATION: {
      handler: handleValidationPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Did you complete the sniff?",
      },
    },

    // Mask
    READY_FOR_MASK: {
      handler: handleTimedPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Get ready for the mask",
        videoText: "READY",
      },
    },
    MASK_MAIN: {
      handler: handleTimedPhase,
      duration: 20000,
      ui: {
        infoColor: "#36454F",
        infoText: "Keep the mask on",
        videoText: "MASK",
        videoEffect: "mask",
        showCancel: true,
        cancelTarget: "MASK_VALIDATION",
      },
    },
    MASK_VALIDATION: {
      handler: handleValidationPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Did you keep it on?",
      },
    },

    // Actions
    READY_TO_ACTION: {
      handler: handleTimedPhase,
      duration: 5000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Get Ready",
        videoText: "READY",
      },
    },
    ACTION_MAIN: {
      handler: handleActionPhase,
      duration: null, // set per-action
      ui: {
        infoColor: "vibe_accent",
        infoText: "ACTION",
        videoText: "ACTION",
        videoEffect: "action",
        showCancel: true,
        cancelTarget: "IDLE_GAP",
      },
    },
    ACTION_VALIDATION: {
      handler: handleValidationPhase,
      duration: 10000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Did you finish the action?",
      },
    },

    // Choice / grid / replay / trivia / chill / peace
    YOU_CHOOSE_OVERLAY: {
      handler: handleChoicePhase,
      duration: 20000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Choose your next event",
      },
    },
    GRID_CHOICE_OVERLAY: {
      handler: handleGridChoicePhase,
      duration: 20000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Choose your next video",
      },
    },
    REPLAY_VIDEO_MAIN: {
      handler: handleReplayPhase,
      duration: null,
      ui: {
        infoColor: "vibe_base",
        infoText: "REPLAY",
        videoText: "REPLAY",
        videoEffect: "action",
      },
    },
    TRIVIA_MAIN: {
      handler: handleTriviaPhase,
      duration: 90000,
      ui: {
        infoColor: "#6a0dad",
        infoText: "Trivia Question",
        videoEffect: "trivia",
      },
    },
    CHILL_MAIN: {
      handler: handleTimedPhase,
      duration: 30000,
      ui: {
        infoColor: "vibe_base",
        infoText: "Chill for 30 seconds",
      },
    },
    PEACE_MAIN: {
      handler: handleTimedPhase,
      duration: 90000,
      ui: {
        infoColor: "#FFFFFF",
        infoText: "Chill for 90 seconds",
        videoEffect: "peace",
      },
    },
  };

  // -----------------------------
  // General helpers
  // -----------------------------
  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => { activeIntervals.delete(id); resolve(); }, ms);
      activeIntervals.add(id);
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(id);
            activeIntervals.delete(id);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true }
        );
      }
    });
  }

  function randDuration(range) {
    if (Array.isArray(range)) {
      const [min, max] = range;
      return Math.floor(min + Math.random() * (max - min));
    }
    return range;
  }

  function clipName(clip) {
    return (clip && clip.name) || (clip && clip.file && clip.file.name) || "";
  }

  function resolveLibraryClip(targetClip) {
    if (!targetClip) return null;
    if (!videos.length) return targetClip;
    const directIdx = videos.indexOf(targetClip);
    if (directIdx !== -1) return videos[directIdx];

    const targetName = clipName(targetClip);
    if (!targetName) return targetClip;
    const nameMatchIdx = videos.findIndex(
      (clip) => clipName(clip) === targetName
    );
    if (nameMatchIdx !== -1) return videos[nameMatchIdx];
    return videos[0] || targetClip;
  }

  function isLikelyVideo(fileLike = {}) {
    const name = (fileLike.name || "").toLowerCase();
    if (fileLike.type && fileLike.type.startsWith("video/")) return true;
    return [".mp4", ".mov", ".webm", ".m4v", ".mkv", ".avi"].some((ext) =>
      name.endsWith(ext)
    );
  }

  function convertToTitleCase(str = "") {
    return str
      .replace(/\.[^/.]+$/, "")
      .replace(/[_\-]+/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }

  function randomMidStart(duration) {
    const dur = Number.isFinite(duration) && duration > 1 ? duration : 5;
    const padStart = 0.5;
    const padEnd = 1.0;
    const min = padStart;
    const max = Math.max(min + 0.5, dur - padEnd);
    return min + Math.random() * (max - min);
  }

  function getClipSource(clip) {
    if (!clip) return "";
    if (clip.cachedUrl) return clip.cachedUrl;
    if (clip.file) {
      const url = URL.createObjectURL(clip.file);
      clip.cachedUrl = url;
      createdObjectURLs.push(url);
      return url;
    }
    if (clip.url) {
      clip.cachedUrl = clip.url;
      return clip.url;
    }
    return "";
  }

  function releaseClipUrls() {
    videos.forEach((clip) => {
      if (clip && clip.cachedUrl && clip.cachedUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(clip.cachedUrl);
        } catch {}
      }
      delete clip.cachedUrl;
    });
    createdObjectURLs.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    createdObjectURLs = [];
  }

  // -----------------------------
  // Fallback clip loading
  // -----------------------------
  async function loadClipsFromDirectory() {
    try {
      const res = await fetch("clips/", { cache: "no-store" });
      if (!res.ok) return false;
      const html = await res.text();
      const hrefMatches = [...html.matchAll(/href="([^"]+)"/gi)].map(
        (m) => m[1]
      );
      const videoFiles = hrefMatches.filter((href) =>
        isLikelyVideo({ name: href })
      );
      const uniqueFiles = [...new Set(videoFiles)].map((path) =>
        path.startsWith("clips/") ? path : `clips/${path}`
      );
      if (!uniqueFiles.length) return false;
      videos = uniqueFiles.map((path) => {
        const name = path.split("/").pop() || path;
        return { name, url: path };
      });
      status.textContent = `Loaded ${videos.length} local clips from /clips.`;
      return true;
    } catch {
      return false;
    }
  }

  async function loadFallbackClips() {
    if (fallbackLoadPromise) return fallbackLoadPromise;
    fallbackLoadPromise = (async () => {
      const okDir = await loadClipsFromDirectory();
      if (!okDir) {
        try {
          const res = await fetch("clips.json", { cache: "no-store" });
          if (!res.ok) throw new Error("No clips.json");
          const list = await res.json();
          if (Array.isArray(list) && list.length) {
            videos = list.map((path) => {
              const cleanPath = path.replace(/^\//, "");
              const name = cleanPath.split("/").pop() || cleanPath;
              return { name, url: cleanPath };
            });
            status.textContent = `Loaded ${videos.length} built-in clips. Choose theme and press START.`;
          }
        } catch {
          /* ignore */
        }
      }
      return videos;
    })();
    return fallbackLoadPromise;
  }

  async function ensureClipsAvailable() {
    if (videos.length >= 4) return true;
    await loadFallbackClips();
    return videos.length >= 4;
  }

  // -----------------------------
  // Thumbnails for grids
  // -----------------------------
  async function setThumbnail(videoEl, clip) {
    if (!clip) return;
    const resolvedClip = resolveLibraryClip(clip);
    const url = getClipSource(resolvedClip);
    if (!url) return;

    const prev = videoEl.dataset.srcUrl;
    if (prev && prev !== url && prev.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }
    videoEl.dataset.srcUrl = url;
    videoEl.src = url;

    const onMeta = () => {
      videoEl.currentTime = randomMidStart(videoEl.duration);
      videoEl.play().catch(() => {});
    };
    const onErr = () => {
      if (url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
    };

    videoEl.addEventListener("loadedmetadata", onMeta, { once: true });
    videoEl.addEventListener("error", onErr, { once: true });
  }

  // -----------------------------
  // Video cycling per quad
  // -----------------------------
  function startVideoCycling(qi, initialClip) {
    const q = quads[qi];
    if (!q) return;
    const v = q.video;
    if (!v || !videos.length) return;

    const playClip = async (clip) => {
      const resolved = resolveLibraryClip(clip) || videos[0];
      if (!resolved) return;
      const clipIdx = videos.indexOf(resolved);
      q.clipIndex = clipIdx >= 0 ? clipIdx : 0;
      q.currentClip = resolved;
      const url = getClipSource(resolved);
      if (!url) return;
      v.src = url;
      try {
        await v.play();
      } catch {
        setTimeout(() => v.dispatchEvent(new Event("ended")), 100);
      }
    };

    if (v._cycleEndedHandler)
      v.removeEventListener("ended", v._cycleEndedHandler);
    if (v._cycleErrorHandler)
      v.removeEventListener("error", v._cycleErrorHandler);

    v._cycleEndedHandler = async () => {
      if (cycleAbort || !videos.length) return;
      if (v.src && v.src.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(v.src);
        } catch {}
      }

      let nextIdx = q.clipIndex;
      let attempts = 0;
      while (attempts < videos.length) {
        nextIdx = (nextIdx + 1) % videos.length;
        const nextClip = videos[nextIdx];
        const clipInUse = quads.some(
          (other, idx) => idx !== qi && other.currentClip === nextClip
        );
        if (!clipInUse || videos.length <= quads.length) break;
        attempts++;
      }

      const nextClip = videos[nextIdx];
      if (nextClip) {
        await playClip(nextClip);
      }
    };

    v._cycleErrorHandler = () => v.dispatchEvent(new Event("ended"));

    v.addEventListener("ended", v._cycleEndedHandler);
    v.addEventListener("error", v._cycleErrorHandler);

    playClip(initialClip);
  }

  // -----------------------------
  // UI helpers: overlays & countdowns
  // -----------------------------
  function hideOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove("show");
  }

  function registerOverlayTimer(q, timerId) {
    if (!q.overlayTimers) q.overlayTimers = new Set();
    q.overlayTimers.add(timerId);
    activeIntervals.add(timerId);
  }

  function clearOverlayTimers(q) {
    if (!q.overlayTimers) return;
    q.overlayTimers.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
      activeIntervals.delete(id);
    });
    q.overlayTimers.clear();
  }

  function waitForButtons(overlay, duration, signal) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve("timeout"), duration);
      const onClick = (e) => {
        if (e.target.classList.contains("confirm")) {
          clearTimeout(timer);
          overlay.removeEventListener("click", onClick);
          resolve("confirm");
        } else if (e.target.classList.contains("fail")) {
          clearTimeout(timer);
          overlay.removeEventListener("click", onClick);
          resolve("fail");
        }
      };
      overlay.addEventListener("click", onClick);
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            overlay.removeEventListener("click", onClick);
            resolve("abort");
          },
          { once: true }
        );
      }
    });
  }

  function waitForOverlayChoice(overlay, duration, signal) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve("timeout"), duration);
      const handler = (e) => {
        clearTimeout(timer);
        overlay.removeEventListener("choice", handler);
        resolve(e.detail);
      };
      overlay.addEventListener("choice", handler);
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            overlay.removeEventListener("choice", handler);
            resolve("abort");
          },
          { once: true }
        );
      }
    });
  }

  function pickUnique(list, count) {
    const arr = [...list];
    const result = [];
    while (result.length < count && arr.length) {
      const idx = Math.floor(Math.random() * arr.length);
      result.push(arr.splice(idx, 1)[0]);
    }
    return result;
  }

  function startOverlayTimer(q, overlay, duration, onTimeout = () => {}) {
    if (!overlay) return () => {};
    let timeLeft = Math.ceil(duration / 1000);
    const timerSpan =
      overlay.querySelector(".breath-count-timer") ||
      overlay.querySelector(".action-choice-timer") ||
      overlay.querySelector(".grid-choice-timer") ||
      overlay.querySelector(".special-overlay-timer");
    if (timerSpan) timerSpan.textContent = timeLeft;
    const timerId = setInterval(() => {
      timeLeft--;
      if (timerSpan) timerSpan.textContent = Math.max(0, timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerId);
        activeIntervals.delete(timerId);
        if (q.overlayTimers) q.overlayTimers.delete(timerId);
        onTimeout();
      }
    }, 1000);
    registerOverlayTimer(q, timerId);
    return () => {
      clearInterval(timerId);
      activeIntervals.delete(timerId);
      if (q.overlayTimers) q.overlayTimers.delete(timerId);
    };
  }

  function showActionMainOverlay(q, action, duration) {
    const overlay = q.actionMainOverlay;
    if (!overlay) return () => {};
    if (q.actionMainTitle) q.actionMainTitle.textContent = action.label;
    if (q.actionMainInstruction)
      q.actionMainInstruction.textContent =
        action.description || action.label;
    if (q.actionMainDetails)
      q.actionMainDetails.textContent = `${Math.ceil(duration / 1000)}s • Worth ${
        action.points ?? 8
      } pts`;
    overlay.classList.add("show");
    const stopTimer = startOverlayTimer(q, overlay, duration, () => {
      overlay.classList.remove("show");
    });
    return () => {
      stopTimer();
      overlay.classList.remove("show");
    };
  }

  function hideTriviaOverlay(q) {
    if (!q.triviaOverlay) return;
    hideOverlay(q.triviaOverlay);
    if (q.triviaAnswers) {
      q.triviaAnswers.classList.remove("locked");
      q.triviaAnswers.innerHTML = "";
    }
    if (q.triviaFeedback) {
      q.triviaFeedback.textContent = "";
      q.triviaFeedback.classList.remove("good", "bad");
    }
  }

  function showTriviaOverlay(q) {
    if (!q.triviaOverlay) return () => {};
    q.triviaOverlay.classList.add("show");
    if (q.triviaAnswers) {
      q.triviaAnswers.classList.remove("locked");
      q.triviaAnswers.innerHTML = "";
    }
    if (q.triviaFeedback) {
      q.triviaFeedback.textContent = "";
      q.triviaFeedback.classList.remove("good", "bad");
    }
    return () => hideTriviaOverlay(q);
  }

  function presentTriviaQuestion(q, question, signal) {
    return new Promise((resolve) => {
      const answersEl = q.triviaAnswers;
      const questionEl = q.triviaQuestion;
      const feedbackEl = q.triviaFeedback;
      if (!answersEl || !questionEl) {
        resolve("answered");
        return;
      }

      answersEl.classList.remove("locked");
      answersEl.innerHTML = "";
      questionEl.textContent = question.question;
      if (feedbackEl) {
        feedbackEl.textContent = "";
        feedbackEl.classList.remove("good", "bad");
      }

      let settled = false;
      const cleanup = (result = "answered") => {
        if (settled) return;
        settled = true;
        answersEl.classList.remove("locked");
        answersEl.innerHTML = "";
        if (feedbackEl) {
          feedbackEl.textContent = "";
          feedbackEl.classList.remove("good", "bad");
        }
        resolve(result);
      };

      const buttons = question.answers.map((text, idx) => {
        const btn = document.createElement("button");
        btn.className = "trivia-answer";
        btn.type = "button";
        btn.textContent = text;
        btn.addEventListener("click", () => selectAnswer(idx));
        answersEl.appendChild(btn);
        return btn;
      });

      const selectAnswer = (idx) => {
        if (answersEl.classList.contains("locked")) return;
        answersEl.classList.add("locked");
        const isCorrect = idx === question.correct;
        buttons.forEach((btn, i) => {
          btn.disabled = true;
          if (i === question.correct) btn.classList.add("correct");
          if (i === idx && !isCorrect) btn.classList.add("wrong");
        });
        if (feedbackEl) {
          feedbackEl.textContent = isCorrect ? "Correct!" : "Wrong!";
          feedbackEl.classList.toggle("good", isCorrect);
          feedbackEl.classList.toggle("bad", !isCorrect);
        }
        if (isCorrect) addTally(q, question.points ?? 8);
        else addTally(q, -3);
        sleep(2000, signal)
          .catch(() => {})
          .then(() => cleanup("answered"));
      };

      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            cleanup("abort");
          },
          { once: true }
        );
      }
    });
  }

  // -----------------------------
  // Phase UI
  // -----------------------------
  function stopVideoCountdown(q) {
    if (q.countdownRaf) {
      cancelAnimationFrame(q.countdownRaf);
      q.countdownRaf = null;
    }
  }

  function clearPhaseUI(q) {
    stopVideoCountdown(q);
    clearOverlayTimers(q);
    q.infoTextOverlay.classList.remove("show");
    q.videoCountdownOverlay.classList.remove("show");
    Object.values(q.eventOverlays).forEach((o) => o.classList.remove("show"));

    hideOverlay(q.validationOverlay);
    hideOverlay(q.breathCountOverlay);
    hideOverlay(q.actionChoiceOverlay);
    hideOverlay(q.gridChoiceOverlay);
    hideOverlay(q.actionMainOverlay);
    hideTriviaOverlay(q);

    q.nextEventTimerOverlay.classList.remove("show");
    q.nextEventName.textContent = "Event";
    q.nextEventTime.textContent = "0";

    q.bottomBar.classList.remove("show-cancel-buttons");
    q.cancelButtons.forEach((btn) => btn.classList.remove("show"));

    q.panelContainer.style.background = getVibeBase(q);
    q.countdownText.textContent = "";
    q.countdownTimer.textContent = "0";
  }

  function setPhaseUI(q, phase, uiRules, data = {}) {
    clearPhaseUI(q);

    // Background
    let infoColor = uiRules.infoColor || "vibe_base";
    if (infoColor === "vibe_base") {
      q.panelContainer.style.background = getVibeBase(q);
    } else if (infoColor === "vibe_accent") {
      q.panelContainer.style.background = q.vibe.palette.accent;
    } else if (infoColor === "vibe") {
      q.panelContainer.style.background = q.vibe.palette.base;
    } else if (infoColor === "accent") {
      q.panelContainer.style.background = q.vibe.palette.accent;
    } else {
      q.panelContainer.style.background = infoColor;
    }

    // Info text
    let idleCountdownEl = null;
    if (phase.phaseName === "IDLE_GAP" && data.duration && data.nextEventName) {
      const seconds = Math.ceil(data.duration / 1000);
      q.infoTextOverlay.innerHTML = `
        <div class="info-text-idle">
          <div class="countdown">${seconds}</div>
          <div class="label">
            <span class="until-text">Until</span>
            <span class="next-event-name">${data.nextEventName.toUpperCase()}</span>
          </div>
        </div>`;
      q.infoTextOverlay.classList.add("show");
      idleCountdownEl = q.infoTextOverlay.querySelector(".countdown");
    } else if (uiRules.infoText) {
      q.infoTextOverlay.textContent = uiRules.infoText;
      q.infoTextOverlay.classList.add("show");
    }

    const showVideoCountdown = data.showVideoCountdown ?? true;
    const showNextEventTimer =
      data.showNextEventTimer ?? Boolean(uiRules.showIdleCountdown);

    const countdownTargets = [];

    if (showVideoCountdown && data.duration) {
      q.videoCountdownOverlay.classList.add("show");
      const label = data.videoText ?? uiRules.videoText ?? phase.phaseName;
      q.countdownText.textContent = label || "";
      countdownTargets.push((secs) => {
        q.countdownTimer.textContent = secs;
      });
    } else {
      q.videoCountdownOverlay.classList.remove("show");
      q.countdownText.textContent = "";
      q.countdownTimer.textContent = "0";
    }

    if (showNextEventTimer && data.duration) {
      q.nextEventTimerOverlay.classList.add("show");
      if (data.nextEventName) q.nextEventName.textContent = data.nextEventName;
      countdownTargets.push((secs) => {
        q.nextEventTime.textContent = secs;
      });
    } else {
      q.nextEventTimerOverlay.classList.remove("show");
    }

    if (idleCountdownEl && data.duration) {
      countdownTargets.push((secs) => {
        idleCountdownEl.textContent = secs;
      });
    }

    if (data.duration && countdownTargets.length) {
      const total = data.duration;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const remaining = Math.max(0, total - elapsed);
        const secs = Math.ceil(remaining / 1000);
        countdownTargets.forEach((update) => update(secs));
        if (remaining > 0 && !cycleAbort) {
          q.countdownRaf = requestAnimationFrame(tick);
        } else {
          stopVideoCountdown(q);
        }
      };
      if (q.countdownRaf) cancelAnimationFrame(q.countdownRaf);
      q.countdownRaf = requestAnimationFrame(tick);
    } else {
      stopVideoCountdown(q);
    }

    // Video overlays
    if (uiRules.videoEffect && q.eventOverlays[uiRules.videoEffect]) {
      q.eventOverlays[uiRules.videoEffect].classList.add("show");
    }

    // Show cancel buttons if needed
    if (uiRules.showCancel) {
      q.bottomBar.classList.add("show-cancel-buttons");
      q.cancelButtons.forEach((btn) => btn.classList.add("show"));
    }
  }

  // -----------------------------
  // Scoring helpers
  // -----------------------------
  function addTally(q, points) {
    q.score += points;
    q.tally.textContent = `Score: ${q.score}`;
  }

  // -----------------------------
  // Show cancel buttons (confirm/fail) with scoring
  // -----------------------------
  function showCancelButtons(q, phase, cancelTargetPhase) {
    q.bottomBar.classList.add("show-cancel-buttons");
    q.cancelButtons.forEach((btn) => btn.classList.add("show"));

    let resolver;
    const promise = new Promise((resolve) => {
      resolver = resolve;
    });

    const phaseName = phase?.phaseName || q.currentPhase?.phaseName || "";

    const onConfirm = async () => {
      const group = getPhaseGroup(phaseName);
      if (group === "puff") {
        // Manual breath count for puff
        await promptManualBreaths(q);
      } else if (group === "sniff") {
        addTally(q, 10);
      } else if (group === "mask") {
        addTally(q, 10);
      } else if (group === "action") {
        const pts = phase.action?.points ?? 8;
        addTally(q, pts);
      }
      cleanup("confirm");
    };

    const onFail = () => {
      addTally(q, -5);
      cleanup("fail");
    };

    function cleanup(reason) {
      q.bottomBar.classList.remove("show-cancel-buttons");
      q.cancelButtons.forEach((btn) => btn.classList.remove("show"));
      q.btnPhaseConfirm.removeEventListener("click", onConfirm);
      q.btnPhaseFail.removeEventListener("click", onFail);
      if (cancelTargetPhase) {
        q.phaseQueue.unshift({ phaseName: cancelTargetPhase });
      }
      resolver("cancel");
    }

    q.btnPhaseConfirm.addEventListener("click", onConfirm, { once: true });
    q.btnPhaseFail.addEventListener("click", onFail, { once: true });

    return { promise, cleanup };
  }

  async function promptManualBreaths(q) {
    // Uses breathCountOverlay buttons 1–5 to award points
    return new Promise((resolve) => {
      const overlay = q.breathCountOverlay;
      const container = overlay.querySelector(".breath-count-choices");
      container.innerHTML = "";
      const clickHandlers = [];

      // Create 1–5 choices
      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement("button");
        btn.className = "breath-count-item";
        btn.dataset.num = i;
        btn.textContent = `${i}`;
        const handler = () => {
          const n = parseInt(btn.dataset.num, 10);
          if (Number.isFinite(n)) {
            // generous scoring: 10 pts per breath
            addTally(q, n * 10);
          }
          cleanup();
        };
        btn.addEventListener("click", handler);
        clickHandlers.push({ btn, handler });
        container.appendChild(btn);
      }

      overlay.classList.add("show");
      const cancelTimer = startOverlayTimer(q, overlay, 10000, () => {
        cleanup();
      });

      function cleanup() {
        cancelTimer();
        clickHandlers.forEach(({ btn, handler }) =>
          btn.removeEventListener("click", handler)
        );
        overlay.classList.remove("show");
        resolve();
      }
    });
  }

  // -----------------------------
  // Phase handlers
  // -----------------------------
  async function handleIdlePhase(q, phase, rules, signal) {
    const duration = phase.duration ?? randDuration(rules.duration);
    setPhaseUI(q, phase, rules.ui, {
      duration,
      nextEventName: phase.nextEventName || "Next",
      showVideoCountdown: false,
      showNextEventTimer: false,
    });
    await sleep(duration, signal);
    return true;
  }

  async function handleTimedPhase(q, phase, rules, signal) {
    const duration = phase.duration ?? rules.duration;
    setPhaseUI(q, phase, rules.ui, {
      duration,
      videoText: rules.ui.videoText,
      loopText: phase.loopText,
    });

    const timerPromise = sleep(duration, signal);

    if (rules.ui.showCancel) {
      const { promise: cancelPromise, cleanup } = showCancelButtons(
        q,
        phase,
        rules.ui.cancelTarget
      );
      try {
        const winner = await Promise.race([timerPromise, cancelPromise]);
        cleanup();
        if (winner === "cancel") {
          return false;
        }
      } catch (e) {
        cleanup();
        throw e;
      }
    } else {
      await timerPromise;
    }

    if (phase.phaseName === "PUFF_EXHALE") {
      q.loopCounter++;
      q.completedBreaths++;
    }

    return true;
  }

  async function handleValidationPhase(q, phase, rules, signal) {
    const duration = rules.duration;
    setPhaseUI(q, phase, rules.ui, { duration, showVideoCountdown: false });

    const overlay = q.validationOverlay;
    const title = overlay.querySelector(".validation-title");
    if (title) title.textContent = rules.ui.infoText || "Did you complete it?";

    overlay.classList.add("show");
    const stopTimer = startOverlayTimer(q, overlay, duration, () => {
      hideOverlay(overlay);
    });
    const res = await waitForButtons(overlay, duration, signal);
    stopTimer();
    hideOverlay(overlay);

    if (res === "confirm") {
      if (
        phase.phaseName === "SNIFF_VALIDATION" ||
        phase.phaseName === "MASK_VALIDATION"
      ) {
        addTally(q, 10);
      } else if (phase.phaseName === "PUFF_VALIDATION") {
        // If they didn't cancel earlier, give a flat puff reward
        addTally(q, 20);
      } else if (phase.phaseName === "ACTION_VALIDATION") {
        addTally(q, 10);
      }
    } else if (res === "fail") {
      addTally(q, -5);
    } else if (res === "timeout") {
      addTally(q, -2);
    }

    return true;
  }

  async function handleBreathQuestionPhase(q, phase, rules, signal) {
    const duration = rules.duration;
    setPhaseUI(q, phase, rules.ui, { duration, showVideoCountdown: false });

    const overlay = q.breathCountOverlay;
    const container = overlay.querySelector(".breath-count-choices");
    container.innerHTML = "";
    const clickHandlers = [];

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.className = "breath-count-item";
      btn.dataset.num = i;
      btn.textContent = `${i}`;
      const handler = () => {
        const clickedNum = parseInt(btn.dataset.num, 10);
        let score = 0;
        if (Number.isFinite(clickedNum) && clickedNum <= q.completedBreaths) {
          score = clickedNum * 10;
        }
        addTally(q, score);
        cleanup();
      };
      btn.addEventListener("click", handler);
      clickHandlers.push({ btn, handler });
      container.appendChild(btn);
    }

    overlay.classList.add("show");
    const cancelTimer = startOverlayTimer(q, overlay, duration, () => {
      cleanup();
    });

    function cleanup() {
      cancelTimer();
      clickHandlers.forEach(({ btn, handler }) =>
        btn.removeEventListener("click", handler)
      );
      overlay.classList.remove("show");
    }

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          cleanup();
        },
        { once: true }
      );
    }

    // Just wait for duration, scoring happens on click
    await sleep(duration, signal).catch(() => {});
    return true;
  }

  async function handleActionPhase(q, phase, rules, signal) {
    const action = phase.action || randomlySelectItem(ACTIONS);
    const duration = phase.duration || action.seconds * 1000;
    setPhaseUI(q, phase, rules.ui, {
      duration,
      videoText: action.label,
      showVideoCountdown: false,
    });

    const dismissActionOverlay = showActionMainOverlay(q, action, duration);
    const { promise: cancelPromise, cleanup } = showCancelButtons(
      q,
      phase,
      rules.ui.cancelTarget
    );
    let resultScore = -2; // default small reward

    try {
      const timerPromise = sleep(duration, signal);
      const winner = await Promise.race([timerPromise, cancelPromise]);
      if (winner === "cancel") {
        dismissActionOverlay();
        cleanup();
        return false;
      }
    } catch (e) {
      dismissActionOverlay();
      cleanup();
      throw e;
    }

    // timer completed with no manual confirm/fail
    addTally(q, resultScore);
    dismissActionOverlay();
    cleanup();
    return true;
  }

  async function handleChoicePhase(q, phase, rules, signal) {
    const duration = rules.duration;
    setPhaseUI(q, phase, rules.ui, { duration, showVideoCountdown: false });

    const overlay = q.actionChoiceOverlay;
    const listEl = overlay.querySelector(".action-choice-choices");
    listEl.innerHTML = "";
    const clickHandlers = [];

    let choicePool = [
      { label: "Puff", emoji: EMOJI.Puff, event: "Puff" },
      { label: "Sniff", emoji: EMOJI.Sniff, event: "Sniff" },
      { label: "Mask", emoji: EMOJI.Mask, event: "Mask" },
      { label: "Task", emoji: EMOJI.Action, event: "Action" },
      { label: "New Vid", emoji: EMOJI.Grid, event: "Grid" },
      { label: "Chill", emoji: EMOJI.Chill, event: "Chill" },
      { label: "Replay", emoji: EMOJI.Replay, event: "Replay" },
      { label: "Trivia", emoji: EMOJI.Trivia, event: "Trivia" },
      { label: "Peace", emoji: EMOJI.Peace, event: "Peace" },
    ];
    if (q.lastEvent) {
      choicePool.push({
        label: "Redo Last",
        emoji: EMOJI.RedoLast,
        event: "Redo Last",
      });
    }

    const choices = [];
    for (let i = 0; i < 3; i++) {
      if (!choicePool.length) break;
      const idx = Math.floor(Math.random() * choicePool.length);
      choices.push(choicePool.splice(idx, 1)[0]);
    }

    overlay.classList.add("show");

    const cancelTimer = startOverlayTimer(q, overlay, duration, () => {
      cleanup();
    });

    function cleanup() {
      cancelTimer();
      clickHandlers.forEach(({ item, handler }) =>
        item.removeEventListener("click", handler)
      );
      overlay.classList.remove("show");
    }

    choices.forEach((choice) => {
      const item = document.createElement("div");
      item.className = "action-choice-item";
      item.innerHTML = `<div class="emoji">${choice.emoji}</div><div>${choice.label}</div>`;
      const handler = () => {
        const newEventPhases = getEventPhases(q, choice.event);
        q.phaseQueue.unshift(...newEventPhases);
        cleanup();
      };
      item.addEventListener("click", handler);
      clickHandlers.push({ item, handler });
      listEl.appendChild(item);
    });

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          cleanup();
        },
        { once: true }
      );
    }

    await sleep(duration, signal).catch(() => {});
    return true;
  }

  async function handleGridChoicePhase(q, phase, rules, signal) {
    const duration = rules.duration;
    setPhaseUI(q, phase, rules.ui, { duration, showVideoCountdown: false });

    const overlay = q.gridChoiceOverlay;
    const listEl = overlay.querySelector(".grid-choice-choices");
    listEl.innerHTML = "";
    const clickHandlers = [];
    let selectionMade = false;
    let cleaned = false;

    const currentUrl = q.video.src;
    const pool = videos.filter((clip) => {
      if (videos.length > 1 && q.currentClip && clip === q.currentClip) {
        return false;
      }
      const name = clipName(clip);
      return name ? !currentUrl.includes(name) : true;
    });
    let tempPool = [...pool];
    const choices = [];
    while (choices.length < 4 && tempPool.length > 0) {
      choices.push(
        tempPool.splice(Math.floor(Math.random() * tempPool.length), 1)[0]
      );
    }
    if (!choices.length) {
      return true;
    }

    overlay.classList.add("show");
    const wasPlaying = !q.video.paused && !q.video.ended;
    q.video.pause();

    choices.forEach((clip, idx) => {
      const item = document.createElement("div");
      item.className = "grid-choice-item";
      const v = document.createElement("video");
      v.playsInline = true;
      v.muted = true;
      v.preload = "metadata";
      const label = document.createElement("div");
      label.className = "item-label";
      label.textContent = convertToTitleCase(clip.name) || `Video ${idx + 1}`;
      item.appendChild(v);
      item.appendChild(label);

      setThumbnail(v, clip);

      const handler = () => {
        addTally(q, 10);
        selectionMade = true;
        const resolved = resolveLibraryClip(clip);
        startVideoCycling(q.id, resolved || clip);
        cleanup();
      };
      item.addEventListener("click", handler, { once: true });
      clickHandlers.push({ item, handler });
      listEl.appendChild(item);
    });

    const cancelTimer = startOverlayTimer(q, overlay, duration, () => {
      cleanup();
    });

    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      cancelTimer();
      clickHandlers.forEach(({ item, handler }) =>
        item.removeEventListener("click", handler)
      );
      overlay.classList.remove("show");
      // clean up any blob thumbnails if needed
      listEl.querySelectorAll("video").forEach((v) => {
        if (v.src && v.src.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(v.src);
          } catch {}
        }
      });
      if (!selectionMade && wasPlaying) {
        q.video.play().catch(() => {});
      }
    }

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          cleanup();
        },
        { once: true }
      );
    }

    await sleep(duration, signal).catch(() => {});
    cleanup();
    return true;
  }

  async function handleReplayPhase(q, phase, rules, signal) {
    q.video.currentTime = 0;
    await q.video.play().catch(() => {});
    const duration = Math.min((q.video.duration || 60) * 1000, 60000);
    setPhaseUI(q, phase, rules.ui, { duration });
    await sleep(duration, signal);
    addTally(q, 5);
    return true;
  }

  async function handleTriviaPhase(q, phase, rules, signal) {
    const duration = rules.duration;
    setPhaseUI(q, phase, rules.ui, { duration });

    if (!q.triviaOverlay || !TRIVIA_QUESTIONS.length) {
      await sleep(duration, signal).catch(() => {});
      return true;
    }

    const questionCount = Math.min(5, TRIVIA_QUESTIONS.length);
    if (q.triviaTotal) q.triviaTotal.textContent = `${questionCount}`;
    const questions = pickUnique(TRIVIA_QUESTIONS, questionCount);

    const dismissTrivia = showTriviaOverlay(q);
    const stopTimer = startOverlayTimer(q, q.triviaOverlay, duration, () => {
      hideTriviaOverlay(q);
    });
    const phaseStart = performance.now();

    try {
      for (let i = 0; i < questions.length; i++) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (q.triviaCurrent) q.triviaCurrent.textContent = `${i + 1}`;
        const result = await presentTriviaQuestion(q, questions[i], signal);
        if (result === "abort" || signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
      }
      const elapsed = performance.now() - phaseStart;
      const remaining = Math.max(0, duration - elapsed);
      if (remaining > 0) await sleep(remaining, signal);
    } finally {
      stopTimer();
      dismissTrivia();
    }

    return true;
  }

  // -----------------------------
  // Event sequences & queue
  // -----------------------------
  function randomlySelectItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getEventPhases(q, eventName) {
    const phases = [];
    switch (eventName) {
      case "Puff":
        phases.push({ phaseName: "READY_TO_PUFF" });
        phases.push({ phaseName: "PUFF_LIGHT" });
        phases.push({ phaseName: "PUFF_SMOKE" });
        q.loopCounter = 0;
        q.completedBreaths = 0;
        for (let i = 0; i < 5; i++) {
          phases.push({ phaseName: "PUFF_INHALE", loopText: i + 1 });
          phases.push({ phaseName: "PUFF_HOLD", loopText: i + 1 });
          phases.push({ phaseName: "PUFF_EXHALE", loopText: i + 1 });
        }
        phases.push({ phaseName: "PUFF_VALIDATION" });
        phases.push({ phaseName: "BREATH_COUNT_QUESTION" });
        break;
      case "Sniff":
        phases.push({ phaseName: "READY_TO_SNIFF" });
        phases.push({ phaseName: "SNIFF_MAIN" });
        phases.push({ phaseName: "SNIFF_VALIDATION" });
        break;
      case "Mask":
        phases.push({ phaseName: "READY_FOR_MASK" });
        phases.push({ phaseName: "MASK_MAIN" });
        phases.push({ phaseName: "MASK_VALIDATION" });
        break;
      case "Action": {
        const action = randomlySelectItem(ACTIONS);
        phases.push({
          phaseName: "READY_TO_ACTION",
        });
        phases.push({
          phaseName: "ACTION_MAIN",
          duration: action.seconds * 1000,
          action,
        });
        phases.push({ phaseName: "ACTION_VALIDATION" });
        break;
      }
      case "You Choose":
        phases.push({ phaseName: "YOU_CHOOSE_OVERLAY" });
        break;
      case "Grid":
        phases.push({ phaseName: "GRID_CHOICE_OVERLAY" });
        break;
      case "Chill":
        phases.push({ phaseName: "CHILL_MAIN" });
        break;
      case "Peace":
        phases.push({ phaseName: "PEACE_MAIN" });
        break;
      case "Trivia":
        phases.push({ phaseName: "TRIVIA_MAIN" });
        break;
      case "Replay":
        phases.push({ phaseName: "REPLAY_VIDEO_MAIN" });
        break;
      case "Redo Last":
        if (q.lastEvent && q.lastEvent !== "Redo Last") {
          return getEventPhases(q, q.lastEvent);
        }
        return getEventPhases(q, "Chill");
      default:
        return getEventPhases(q, "Chill");
    }
    return phases;
  }

  function buildAndEnqueueNextEvent(q) {
    const rand = Math.random();
    let nextEventName;
    if (rand < 0.5) nextEventName = "You Choose";
    else if (rand < 0.6) nextEventName = "Puff";
    else if (rand < 0.7) nextEventName = "Sniff";
    else if (rand < 0.8) nextEventName = "Mask";
    else if (rand < 0.9) nextEventName = "Action";
    else nextEventName = "Trivia";

    const idleRules = PHASES.IDLE_GAP;
    const idleDuration = randDuration(idleRules.duration);
    const idlePhase = {
      phaseName: "IDLE_GAP",
      duration: idleDuration,
      nextEventName,
    };

    const eventPhases = getEventPhases(q, nextEventName);
    q.phaseQueue.push(idlePhase, ...eventPhases);
    q.lastEvent = nextEventName;
  }

  async function processNextPhaseInQueue(q) {
    if (q.isProcessing || cycleAbort) return;
    q.isProcessing = true;

    if (q.phaseQueue.length < 3) {
      buildAndEnqueueNextEvent(q);
    }

    const phase = q.phaseQueue.shift();
    if (!phase) {
      q.isProcessing = false;
      return;
    }

    q.currentPhase = phase;
    q.abortController.abort();
    q.abortController = new AbortController();
    const signal = q.abortController.signal;

    const rules = PHASES[phase.phaseName];
    if (!rules) {
      q.isProcessing = false;
      setTimeout(() => processNextPhaseInQueue(q), 10);
      return;
    }

    try {
      await rules.handler(q, phase, rules, signal);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("[Phase error]", err);
      }
    }

    clearPhaseUI(q);
    q.isProcessing = false;
    q.currentPhase = null;

    if (!cycleAbort) {
      setTimeout(() => processNextPhaseInQueue(q), 10);
    }
  }

  // -----------------------------
  // Per-quad object & vibe application
  // -----------------------------
  function createQuad(rootEl, index) {
    const q = {
      el: rootEl,
      id: index,

      videoContainer: rootEl.querySelector(".video-container"),
      panelContainer: rootEl.querySelector(".panel-container"),
      video: rootEl.querySelector(".quad-video"),
      vibeOverlay: rootEl.querySelector(".vibe-overlay"),

      videoCountdownOverlay: rootEl.querySelector(".video-countdown-overlay"),
      countdownText: rootEl.querySelector(".countdown-text"),
      countdownTimer: rootEl.querySelector(".countdown-timer"),

      infoTextOverlay: rootEl.querySelector(".info-text-overlay"),

      nextEventTimerOverlay: rootEl.querySelector(".nextEventTimer"),
      nextEventName: rootEl.querySelector(".nextEventName"),
      nextEventTime: rootEl.querySelector(".nextEventTime"),

      validationOverlay: rootEl.querySelector(".validation-overlay"),
      breathCountOverlay: rootEl.querySelector(".breath-count-overlay"),
      actionChoiceOverlay: rootEl.querySelector(".action-choice-overlay"),
      gridChoiceOverlay: rootEl.querySelector(".grid-choice-overlay"),
      actionMainOverlay: rootEl.querySelector(".action-main-overlay"),
      actionMainTitle: rootEl.querySelector(".action-main-title"),
      actionMainInstruction: rootEl.querySelector(".action-main-instruction"),
      actionMainDetails: rootEl.querySelector(".action-main-details"),
      actionMainTimer: rootEl.querySelector(".action-main-timer"),
      btnActionConfirm: rootEl.querySelector(".action-main-confirm"),
      btnActionFail: rootEl.querySelector(".action-main-fail"),
      triviaOverlay: rootEl.querySelector(".trivia-overlay"),
      triviaQuestion: rootEl.querySelector(".trivia-question"),
      triviaAnswers: rootEl.querySelector(".trivia-answers"),
      triviaTimer: rootEl.querySelector(".trivia-timer"),
      triviaCurrent: rootEl.querySelector(".trivia-current"),
      triviaTotal: rootEl.querySelector(".trivia-total"),
      triviaFeedback: rootEl.querySelector(".trivia-feedback"),

      bottomBar: rootEl.querySelector(".bottom-bar"),
      btnPhaseConfirm: rootEl.querySelector(".btn-phase-confirm"),
      btnPhaseFail: rootEl.querySelector(".btn-phase-fail"),
      btnReset: rootEl.querySelector(".btnReset"),
      btnRestart: rootEl.querySelector(".btnRestart"),
      tally: rootEl.querySelector(".tally"),
      shuffleVideo: rootEl.querySelector(".shuffleVideo"),
      btnFS: rootEl.querySelector(".btnFS"),
      btnSound: rootEl.querySelector(".btnSound"),

      chooseTint: rootEl.querySelector(".chooseTint"),
      chooseGrid: rootEl.querySelector(".start-grid"),
      chooseGridItems: rootEl.querySelectorAll(".start-grid .choose-grid-item"),
      startThemeTitle: rootEl.querySelector(".start-theme-title"),
      vibePreview: rootEl.querySelector(".vibe-preview"),
      vibePreviewInfo: rootEl.querySelector(".preview-panel-info"),
      vibePreviewVideo: rootEl.querySelector(".preview-panel-video"),
      btnPlayerStart: rootEl.querySelector(".btn-player-start"),
      btnChangeTheme: rootEl.querySelector(".btn-change-theme"),

      eventOverlays: {},
      cancelButtons: rootEl.querySelectorAll(".btn-task-cancel"),

      score: 0,
      lastEvent: null,
      isProcessing: false,
      phaseQueue: [],
      currentPhase: null,
      abortController: new AbortController(),
      vibe: VIBES[0],
      clipIndex: 0,
      currentClip: null,
      selectedStartClip: null,
      loopCounter: 0,
      completedBreaths: 0,
      countdownRaf: null,
      overlayTimers: new Set(),
    };

    rootEl.querySelectorAll(".event-overlay").forEach((o) => {
      const effect = o.dataset.effect;
      if (effect) q.eventOverlays[effect] = o;
    });

    if (q.btnActionConfirm && q.btnPhaseConfirm) {
      q.btnActionConfirm.addEventListener("click", () => {
        q.btnPhaseConfirm.click();
      });
    }
    if (q.btnActionFail && q.btnPhaseFail) {
      q.btnActionFail.addEventListener("click", () => {
        q.btnPhaseFail.click();
      });
    }

    if (q.triviaTotal) {
      q.triviaTotal.textContent = "5";
    }

    return q;
  }

  function applyVibe(q, vibe) {
    q.vibe = vibe;
    const pal = vibe.palette;
    const font = vibe.font;

    // Mark the quadrant with the active vibe key for CSS theme files
    if (q.el && vibe.key) {
      q.el.dataset.vibe = vibe.key;
    }

    q.panelContainer.style.fontFamily = font.family;
    q.panelContainer.style.fontWeight = font.weight;
    q.panelContainer.style.textTransform = font.transform;
    q.panelContainer.style.background =
      vibe.panel_pattern || pal.base || "#111";

    q.video.style.filter = vibe.video_effects.css_filter || "none";
    q.video.style.animation = vibe.video_effects.css_animation || "none";
    q.vibeOverlay.style.background = vibe.video_effects.overlay_gradient;
    q.vibeOverlay.style.mixBlendMode = vibe.video_effects.overlay_blend_mode;

    q.el.style.setProperty("--themeBase", pal.base);
    q.el.style.setProperty("--themeDark", pal.dark || pal.base);
    q.el.style.setProperty("--themeAccent", pal.accent);
    q.el.style.setProperty("--themeText", vibe.text || "#f8fbff");
    q.el.style.setProperty("--video-fr", vibe.layout.video);
    q.el.style.setProperty("--panel-fr", vibe.layout.panel);

    if (q.vibePreviewInfo) {
      q.vibePreviewInfo.style.background = pal.base;
      q.vibePreviewInfo.style.color = vibe.text || pal.accent;
      q.vibePreviewInfo.style.fontFamily = font.family;
      q.vibePreviewInfo.style.fontWeight = font.weight;
      q.vibePreviewInfo.style.textTransform = font.transform;
      q.vibePreviewInfo.style.borderColor = `${pal.accent}77`;
    }
    if (q.vibePreviewVideo) {
      q.vibePreviewVideo.style.background = pal.dark;
      q.vibePreviewVideo.style.color = pal.accent;
      q.vibePreviewVideo.style.fontFamily = font.family;
      q.vibePreviewVideo.style.fontWeight = font.weight;
      q.vibePreviewVideo.style.textTransform = font.transform;
      q.vibePreviewVideo.style.borderColor = `${pal.accent}77`;
    }
    if (q.startThemeTitle) {
      q.startThemeTitle.textContent = vibe.name.toUpperCase();
      q.startThemeTitle.style.color = pal.accent;
      q.startThemeTitle.style.fontFamily = font.family;
      q.startThemeTitle.style.textTransform = font.transform;
    }
  }

  // -----------------------------
  // App start/stop
  // -----------------------------
  async function startApp() {
    cycleAbort = false;
    const ok = await ensureClipsAvailable();
    if (!ok) {
      status.textContent = "Load at least 4 videos.";
      return;
    }

    const playerReady = [false, false];

    quads.forEach((q, i) => {
      q.score = 0;
      q.tally.textContent = "Score: 0";
      q.phaseQueue = [];
      q.isProcessing = false;
      q.abortController.abort();
      q.abortController = new AbortController();
      q.lastEvent = null;
      q.loopCounter = 0;
      q.completedBreaths = 0;

      const vibeIdx = i % VIBES.length;
      applyVibe(q, VIBES[vibeIdx]);

      // populate start grid with random clips
      const pool = [...videos];
      q.chooseGridItems.forEach((item, idx) => {
        const clip = pool[idx % pool.length];
        const v = item.querySelector("video");
        const label = item.querySelector(".item-label");
        setThumbnail(v, clip);
        label.textContent = convertToTitleCase(clipName(clip));
        item.onclick = () => {
          q.selectedStartClip = clip;
          q.chooseGridItems.forEach((it) =>
            it.classList.toggle("selected", it === item)
          );
        };
      });

      q.btnChangeTheme.onclick = () => {
        const nextIndex =
          (VIBES.findIndex((v) => v.key === q.vibe.key) + 1) % VIBES.length;
        applyVibe(q, VIBES[nextIndex]);
      };

      q.btnPlayerStart.onclick = () => {
        playerReady[i] = true;
        q.btnPlayerStart.disabled = true;
        q.btnPlayerStart.textContent = "READY!";
        q.btnPlayerStart.style.opacity = "0.5";

        if (playerReady.every(Boolean)) {
          document
            .querySelectorAll(".quadrant")
            .forEach((el) => el.classList.remove("choose-phase"));

          quads.forEach((qq, j) => {
            const clip = qq.selectedStartClip || videos[j] || videos[0];
            const resolvedClip = resolveLibraryClip(clip) || clip;
            startVideoCycling(j, resolvedClip);
            clearPhaseUI(qq);

            // seed initial event & start processing
            buildAndEnqueueNextEvent(qq);
            processNextPhaseInQueue(qq);
            qq.chooseTint.style.display = "none";
          });
        }
      };

      q.chooseTint.style.display = "flex";
      q.el.classList.add("choose-phase");
    });

    status.textContent =
      "Pick a video & theme in each panel, then press START inside the panels.";
  }

  function stopApp() {
    cycleAbort = true;

    quads.forEach((q) => {
      q.abortController.abort("stop");
      q.isProcessing = false;
      q.phaseQueue = [];
      q.currentPhase = null;

      clearPhaseUI(q);

      if (q.video) {
        q.video.pause();
        if (q.video._cycleEndedHandler) {
          q.video.removeEventListener("ended", q.video._cycleEndedHandler);
          q.video._cycleEndedHandler = null;
        }
        if (q.video._cycleErrorHandler) {
          q.video.removeEventListener("error", q.video._cycleErrorHandler);
          q.video._cycleErrorHandler = null;
        }
        if (q.video.src && q.video.src.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(q.video.src);
          } catch {}
        }
        q.video.src = "";
      }
      q.currentClip = null;

      q.vibeOverlay.style.background = "transparent";
      q.chooseTint.style.display = "flex";
      q.el.classList.add("choose-phase");
    });

    activeIntervals.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    activeIntervals.clear();
    releaseClipUrls();

    status.textContent = "Stopped. Reload or choose videos to start again.";
  }

  // -----------------------------
  // Global controls
  // -----------------------------
  function attachGlobalControls() {
    quads.forEach((q, i) => {
      q.shuffleVideo.addEventListener("click", () => {
        q.video.dispatchEvent(new Event("ended"));
      });

      q.btnFS.addEventListener("click", () => {
        const el = q.el;
        (el.requestFullscreen ||
          el.webkitRequestFullscreen ||
          el.msRequestFullscreen)?.call(el);
      });

      q.btnSound.addEventListener("click", () => {
        quads.forEach((qq, idx) => {
          const active = idx === i;
          qq.video.muted = !active;
          qq.btnSound.classList.toggle("active", active);
          qq.btnSound.textContent = active ? "🔊" : "🔈";
        });
      });

      q.btnReset.addEventListener("click", () => {
        clearPhaseUI(q);
      });

      q.btnRestart.addEventListener("click", () => {
        q.abortController.abort("restart");
        q.abortController = new AbortController();
        clearPhaseUI(q);
        q.phaseQueue = [];
        buildAndEnqueueNextEvent(q);
        processNextPhaseInQueue(q);
      });
    });

    folderPicker.addEventListener(
      "change",
      (e) => {
        releaseClipUrls();
        createdObjectURLs = [];
        const files = [...e.target.files].filter(isLikelyVideo);
        if (files.length < 4) {
          status.textContent = "Load at least 4 videos.";
          return;
        }
        videos = files.map((f) => ({ file: f, name: f.name }));
        status.textContent = `Loaded ${videos.length} videos. Choose theme and press START.`;
      },
      { passive: true }
    );

    btnStart.addEventListener("click", async () => {
      const ready = await ensureClipsAvailable();
      if (!ready) {
        status.textContent = "Load at least 4 videos first.";
        return;
      }
      startApp();
    });

    btnStop.addEventListener("click", stopApp);

    btnFSAll.addEventListener("click", () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) el.requestFullscreen?.();
      else document.exitFullscreen?.();
    });

    btnMuteAll.addEventListener("click", () => {
      const anyMuted = quads.some((q) => q.video.muted);
      quads.forEach((q) => {
        q.video.muted = !anyMuted;
      });
      btnMuteAll.textContent = anyMuted ? "🔊" : "🔇";
    });
  }

  // -----------------------------
  // Boot
  // -----------------------------
  quads.push(createQuad(document.getElementById("q1"), 0));
  quads.push(createQuad(document.getElementById("q2"), 1));
  quads.forEach((q) => applyVibe(q, VIBES[0]));

  attachGlobalControls();
  loadFallbackClips();

  console.log("[Init] ✓ Advanced game.js ready");
})();
