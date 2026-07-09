// ─────────────────────────────────────────────────────────────────
// 0.  MOBILE HAMBURGER MENU
// ─────────────────────────────────────────────────────────────────
function toggleMobileMenu() {
  const drawer = document.getElementById('mobileDrawer');
  const burger = document.getElementById('hamburger');
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    drawer.classList.add('open');
    burger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeMobileMenu() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}
// Close drawer on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});


const INTRO_TEXT = "Hi! I am Asad Khan. A Digital Marketer from Faisalabad, Pakistan, currently learning paid ads and building my web development skills. Let's grow together!";

let introSpoken = false;

function speakIntro() {
  if (introSpoken) return;
  introSpoken = true;

  const words = INTRO_TEXT.split(' ');
  let idx = 0;
  const el = document.getElementById('speech-text');
  el.textContent = '';

  const wordTimer = setInterval(() => {
    if (idx < words.length) {
      el.textContent += (idx === 0 ? '' : ' ') + words[idx++];
    } else {
      clearInterval(wordTimer);
    }
  }, 220);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(INTRO_TEXT);
    utt.rate = 0.95;
    utt.pitch = 1.05;
    utt.volume = 1;

    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      const preferred = [
        'Google UK English Male', 'Microsoft David Desktop',
        'Microsoft Guy Online', 'en-GB', 'en-US'
      ];
      for (const p of preferred) {
        const v = voices.find(v => v.name.includes(p) || v.lang === p);
        if (v) return v;
      }
      return voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) utt.voice = pickVoice();
    else window.speechSynthesis.onvoiceschanged = () => { utt.voice = pickVoice(); };

    utt.onend = () => {
      document.getElementById('speechWave').classList.add('stopped');
      setTimeout(closeIntro, 900);
    };
    utt.onerror = () => setTimeout(closeIntro, 800);
    window.speechSynthesis.speak(utt);
  } else {
    setTimeout(closeIntro, 5000);
  }
}

function closeIntro() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const overlay = document.getElementById('speech-overlay');
  overlay.classList.add('hide');
  setTimeout(() => overlay.remove(), 700);
}

if (!sessionStorage.getItem('introShown')) {
  sessionStorage.setItem('introShown', '1');
  setTimeout(speakIntro, 800);
} else {
  document.getElementById('speech-overlay').remove();
}

// ─────────────────────────────────────────────────────────────────
// 2.  TYPED TEXT
// ─────────────────────────────────────────────────────────────────
const phrases = [
  "Digital Marketing Intern",
  "Self-Taught Web Developer",
  "Learning Paid Ads",
  "Content & Social Media",
  "Growing Every Day"
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById("typed-text");
function type() {
  const cur = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = cur.slice(0, ++charIdx);
    if (charIdx === cur.length) { deleting = true; return setTimeout(type, 1800); }
  } else {
    typedEl.textContent = cur.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 50 : 90);
}
type();

// ─────────────────────────────────────────────────────────────────
// 3.  SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add("visible"), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));

// ─────────────────────────────────────────────────────────────────
// 4.  NAVBAR SCROLL
// ─────────────────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar").style.background =
    window.scrollY > 50 ? "rgba(10,10,10,0.98)" : "rgba(10,10,10,0.85)";
});

// ─────────────────────────────────────────────────────────────────
// 5.  CONTACT FORM → Formspree
//     Sends the message to Asad's Formspree inbox, which forwards it
//     straight to his Gmail. Works on GitHub Pages with no backend.
// ─────────────────────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = document.getElementById('sendBtn');
  const successMsg = document.getElementById('successMsg');

  const first = document.getElementById('cf-first').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const msg = document.getElementById('cf-msg').value.trim();

  if (!first || !email || !msg) {
    alert('Please fill in your name, email, and message.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  successMsg.style.display = 'none';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      successMsg.textContent = '✅ Message sent! Asad will reply within 24 hours.';
      successMsg.style.display = 'block';
      contactForm.reset();
      btn.innerHTML = '✅ Sent!';
    } else {
      throw new Error('Formspree error');
    }
  } catch (err) {
    successMsg.textContent = '⚠️ Something went wrong. Please email asadkhandigital6@gmail.com directly.';
    successMsg.style.background = 'rgba(255,45,45,0.1)';
    successMsg.style.borderColor = 'rgba(255,45,45,0.3)';
    successMsg.style.color = '#FF5555';
    successMsg.style.display = 'block';
    btn.innerHTML = 'Send Message <i class="fas fa-arrow-right"></i>';
  } finally {
    setTimeout(() => {
      btn.innerHTML = 'Send Message <i class="fas fa-arrow-right"></i>';
      btn.disabled = false;
    }, 3000);
  }
});
