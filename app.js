/* =============================================
   Spotify Wrapped Mini — app.js
   Pure vanilla JS + GSAP + html2canvas + confetti
   ============================================= */

// ── Helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── State ──
let selectedMood = null;
let selectedGenre = null;

// ── Fun Stat Sentences ──
const funStats = [
  "You listened like you're in a montage scene. 🎬",
  "Your ears deserved a vacation after this. 🏝️",
  "Plot twist: your playlist was the main character. 🌟",
  "You turned vibes into a lifestyle. 💫",
  "Your neighbors filed a noise appreciation report. 🔊",
  "Spotify's algorithm blushes when it sees your taste. 😳",
  "Your headphones wrote a thank-you letter. 💌",
  "That's more hours than most people sleep. 😴",
  "You could've learned a language, but chose bangers. 🎵",
  "You didn't just listen — you experienced. ✨",
  "Your playlist hit different at 2 AM. 🌙",
  "Even your alarm clock was jealous of your playlist. ⏰",
];

// ── Mood & Genre Emojis ──
const moodEmojis = {
  'Main Character': '👑',
  'Soft Launch': '🌸',
  'Gym Arc': '💪',
  'Study Mode': '📚',
  'Healing Era': '🫧',
};

const genreEmojis = {
  'Pop': '🎤',
  'K-Pop': '💜',
  'Indie': '🍂',
  'EDM': '⚡',
  'Lo-fi': '☕',
  'Rock': '🎸',
};

// ── Scan Code Generator ──
function generateScanCode() {
  const container = $('#scan-code');
  if (!container) return;
  container.innerHTML = '';
  // Fixed pattern for recognizable QR-like look
  const pattern = [
    1,1,1,0,1,1,1,
    1,0,1,1,1,0,1,
    1,1,1,0,1,1,1,
    0,1,0,1,0,1,0,
    1,1,1,0,1,1,1,
    1,0,1,0,1,0,1,
    1,1,1,0,1,1,1,
  ];
  // Randomize the middle parts a bit
  for (let i = 0; i < 49; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    // Keep corners fixed, randomize center
    const row = Math.floor(i / 7);
    const col = i % 7;
    const isCorner = (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3);
    if (isCorner) {
      cell.classList.add(pattern[i] ? 'filled' : 'empty');
    } else {
      cell.classList.add(Math.random() > 0.4 ? 'filled' : 'empty');
    }
    container.appendChild(cell);
  }
}

// ── Initialize Pill Buttons ──
function initPills() {
  // Mood pills
  $$('.mood-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      $$('.mood-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedMood = pill.dataset.mood;
      clearValidation('mood');
    });
  });

  // Genre pills
  $$('.genre-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      $$('.genre-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedGenre = pill.dataset.genre;
      clearValidation('genre');
    });
  });
}

// ── Range Slider ──
function initSlider() {
  const slider = $('#hours-slider');
  const display = $('#hours-display');
  if (!slider || !display) return;

  slider.addEventListener('input', () => {
    display.textContent = slider.value;
  });
}

// ── Validation ──
function clearValidation(type) {
  const el = $(`#${type}-error`);
  if (el) el.classList.add('hidden');
}

function validate() {
  let valid = true;

  if (!selectedMood) {
    $('#mood-error').classList.remove('hidden');
    valid = false;
  }

  if (!selectedGenre) {
    $('#genre-error').classList.remove('hidden');
    valid = false;
  }

  return valid;
}

// ── Toast ──
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  
  if (prefersReducedMotion) {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(80px)';
    }, 2000);
  } else {
    gsap.killTweensOf(toast);
    gsap.fromTo(toast,
      { opacity: 0, y: 80 },
      {
        opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.to(toast, { opacity: 0, y: 80, duration: 0.3, delay: 1.8, ease: 'power2.in' });
        }
      }
    );
  }
}

// ── Generate Wrapped ──
function generateWrapped() {
  if (!validate()) return;

  const hours = $('#hours-slider').value;
  const artist = $('#artist-input').value.trim();
  const funStat = funStats[Math.floor(Math.random() * funStats.length)];

  // Update card content
  $('#card-mood').textContent = `${moodEmojis[selectedMood] || ''} ${selectedMood}`;
  $('#card-genre').textContent = `${genreEmojis[selectedGenre] || ''} ${selectedGenre}`;
  $('#card-hours').textContent = hours;
  $('#card-fun-stat').textContent = funStat;

  if (artist) {
    $('#card-artist').textContent = `🎧 ${artist}`;
    $('#card-artist').classList.remove('hidden');
  } else {
    $('#card-artist').classList.add('hidden');
  }

  // Regenerate scan code
  generateScanCode();

  // Show action buttons
  $('#action-buttons').classList.remove('hidden');

  // ── Animations ──
  if (!prefersReducedMotion) {
    // Card pop
    gsap.fromTo('#wrapped-card',
      { scale: 0.98 },
      { scale: 1.02, duration: 0.15, ease: 'power2.out',
        onComplete: () => {
          gsap.to('#wrapped-card', { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.5)' });
        }
      }
    );

    // Stagger stat lines
    gsap.fromTo('.stat-line',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
    );

    // Background shift
    document.body.classList.remove('bg-shifted');
    void document.body.offsetWidth; // force reflow
    document.body.classList.add('bg-shifted');
  } else {
    // Show stats immediately
    $$('.stat-line').forEach((el) => {
      el.style.opacity = '1';
    });
  }

  // ── Confetti ──
  if (typeof confetti === 'function' && !prefersReducedMotion) {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#22d3ee', '#f43f5e', '#fbbf24'],
      disableForReducedMotion: true,
    });

    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.5, x: 0.3 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
        disableForReducedMotion: true,
      });
    }, 300);
  }
}

// ── Download Card as Image ──
async function downloadCard() {
  const card = $('#wrapped-card');
  const btn = $('#btn-download');

  btn.disabled = true;
  btn.innerHTML = '⏳ Capturing...';

  try {
    // ── Fix for html2canvas: it can't render background-clip: text ──
    // Temporarily swap gradient text to a solid color for capture
    const hoursEl = $('#card-hours');
    const gradientClasses = ['bg-gradient-to-r', 'from-purple-300', 'via-pink-300', 'to-cyan-300', 'bg-clip-text', 'text-transparent'];
    gradientClasses.forEach((cls) => hoursEl.classList.remove(cls));
    hoursEl.style.color = '#e0b0ff'; // Soft lavender to match the gradient feel

    // Give a tiny delay for style changes to settle
    await new Promise((r) => setTimeout(r, 100));

    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: '#1a1a2e',
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // Restore gradient text styling
    gradientClasses.forEach((cls) => hoursEl.classList.add(cls));
    hoursEl.style.color = '';

    const moodSlug = (selectedMood || 'vibe').toLowerCase().replace(/\s+/g, '-');
    const genreSlug = (selectedGenre || 'music').toLowerCase().replace(/\s+/g, '-');
    const fileName = `wrapped-${moodSlug}-${genreSlug}.png`;

    // Use toBlob for reliable downloads across all browsers
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast('❌ Download failed. Try again!');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      // Must append to body for the click to trigger a real download
      document.body.appendChild(link);
      link.click();

      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 250);

      showToast('✅ Downloaded!');
    }, 'image/png');
  } catch (err) {
    console.error('Download error:', err);
    showToast('❌ Download failed. Try again!');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '📥 Download Card';
  }
}

// ── Copy Share Text ──
function copyShareText() {
  const hours = $('#hours-slider').value;
  const text = `My vibe is ${selectedMood} • ${selectedGenre} • ${hours} hrs 🔥 #MiniWrapped`;

  // Try Web Share API (mobile)
  if (navigator.share) {
    navigator.share({
      title: 'My 2026 Wrapped',
      text: text,
    }).catch(() => {
      // Fallback to clipboard
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Copied to clipboard!');
  }).catch(() => {
    // Extra fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Copied to clipboard!');
  });
}

// ── Entrance Animations ──
function playEntranceAnimations() {
  if (prefersReducedMotion) {
    // Just show everything
    $('#form-panel').style.opacity = '1';
    $('#card-panel').style.opacity = '1';
    return;
  }

  gsap.set('#form-panel', { opacity: 0, x: -40, scale: 0.97 });
  gsap.set('#card-panel', { opacity: 0, x: 40, scale: 0.97 });

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('#form-panel', {
    opacity: 1, x: 0, scale: 1,
    duration: 0.8, ease: 'power3.out'
  })
  .to('#card-panel', {
    opacity: 1, x: 0, scale: 1,
    duration: 0.8, ease: 'power3.out'
  }, '-=0.5');
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initPills();
  initSlider();
  generateScanCode();
  playEntranceAnimations();

  // Button bindings
  $('#btn-generate').addEventListener('click', generateWrapped);
  $('#btn-download').addEventListener('click', downloadCard);
  $('#btn-copy').addEventListener('click', copyShareText);
});
