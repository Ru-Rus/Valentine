const lockScreen = document.getElementById("lockScreen");
const mainContent = document.getElementById("mainContent");
const music = document.getElementById("bgMusic");
const floatingHeartsContainer = document.getElementById("floatingHearts");

mainContent.style.display = "none";

let currentSlide = 0;
let totalSlides = 5;

// Password Check
async function checkPassword() {
  const input = document.getElementById("passwordInput").value;
  const errorMsg = document.getElementById("errorMsg");

console.log(input)

  if (!input) {
    errorMsg.innerText = "❌ Please enter a password ❤️";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: input }),
    });

    const data = await res.json();

    if (data.success) {
      console.log("Password correct! Unlocking...");
      lockScreen.style.display = "none";
      mainContent.style.display = "block";
      errorMsg.style.display = "none";
      
      // Start music
      music.volume = 0.3;
      music.play().catch((err) => {
        console.log("Music autoplay blocked. User interaction might be required.");
      });
      
      // Trigger animations
      setTimeout(() => {
        fetchLetter().then(() => {
          startCountdown();
          typeLetter();
        });
        launchConfetti();
        createFloatingHearts();
      }, 500);
    } else {
      console.log("Password incorrect");
      errorMsg.innerText = "❌ Wrong password, try again 💔";
      errorMsg.style.display = "block";
      document.getElementById("passwordInput").value = "";
      document.getElementById("passwordInput").focus();
    }
  } catch (error) {
    console.error("Error checking password:", error);
    errorMsg.innerText = "❌ Connection error, please try again ❤️";
    errorMsg.style.display = "block";
  }
}

// Confetti Animation
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let pieces = [];
  const colors = ["#ff6b9d", "#ff85c0", "#ffb3d9", "#ffd4e5", "#fff"];

  for (let i = 0; i < 200; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 5,
      speed: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.1 - 0.05,
    });
  }

  let duration = 6000;
  let start = Date.now();

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - (Date.now() - start) / duration);

      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

      ctx.restore();

      p.y += p.speed;
      p.x += Math.sin(p.rotation) * 0.5;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height) {
        p.y = -p.size;
        p.x = Math.random() * canvas.width;
      }
    });

    if (Date.now() - start < duration) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}

// Floating Hearts
function createFloatingHearts() {
  const interval = setInterval(() => {
    if (mainContent.style.display === "none") {
      clearInterval(interval);
      return;
    }

    const heart = document.createElement("div");
    heart.classList.add("floating-heart");
    heart.textContent = ["💕", "💖", "💗", "💝", "❤️"][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + "%";
    heart.style.animationDuration = (3 + Math.random() * 2) + "s";
    floatingHeartsContainer.appendChild(heart);

    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, 5000);
  }, 800);
}

// Create Hearts on Button Click
function createHearts() {
  console.log("Making it rain hearts!");
  launchConfetti(); // Also launch confetti with hearts
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.classList.add("floating-heart");
      heart.textContent = ["💕", "💖", "💗", "💝", "❤️"][Math.floor(Math.random() * 5)];
      heart.style.left = Math.random() * 100 + "%";
      heart.style.bottom = "0";
      heart.style.animationDuration = (4 + Math.random() * 2) + "s";
      heart.style.fontSize = (2 + Math.random() * 2) + "rem";
      floatingHeartsContainer.appendChild(heart);

      setTimeout(() => {
        if (heart.parentNode) {
          heart.remove();
        }
      }, 6000);
    }, i * 30);
  }
}

// Countdown Timer
function startCountdown() {
  const targetDate = new Date("2026-02-14T00:00:00").getTime();

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const countdownElement = document.getElementById("countdown");
    
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.innerHTML = `<strong>⏰ Only ${days}d ${hours}h ${minutes}m ${seconds}s until we celebrate together ✨</strong>`;
    } else {
      countdownElement.innerHTML = "<strong>🎉 Happy Valentine's Day! It's time to celebrate! 💕</strong>";
    }
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Typing Effect - Fetch from API
let loveLetterText = "";

async function fetchLetter() {
  try {
    const res = await fetch("/api/letter");
    const data = await res.json();
    loveLetterText = data.letter || "Letter not found";
  } catch (error) {
    console.error("Error fetching letter:", error);
    loveLetterText = "Letter could not be loaded";
  }
}

function typeLetter() {
  if (!loveLetterText) {
    console.error("Letter text not loaded");
    return;
  }

  const typingTextElement = document.getElementById("typingText");
  typingTextElement.innerHTML = "";
  let index = 0;

  const typeCharacter = () => {
    if (index < loveLetterText.length) {
      const character = loveLetterText[index];

      if (character === "\n") {
        typingTextElement.innerHTML += "<br>";
      } else {
        typingTextElement.innerHTML += character;
      }

      index++;
      setTimeout(typeCharacter, 30);
    }
  };

  typeCharacter();
}

// Scroll to Letter
function scrollToLetter() {
  const letterSection = document.getElementById("letter");
  if (letterSection) {
    letterSection.scrollIntoView({ behavior: "smooth", block: "start" });
    console.log("Scrolling to letter...");
  }
}

// Gallery Controls
function nextSlide() {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlide();
  console.log("Next slide:", currentSlide);
}

function prevSlide() {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlide();
  console.log("Previous slide:", currentSlide);
}

function goToSlide(n) {
  currentSlide = n;
  updateSlide();
  console.log("Current slide:", currentSlide);
}

function updateSlide() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  // Hide all slides
  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  // Remove active class from all dots
  dots.forEach((dot) => {
    dot.classList.remove("active");
  });

  // Show current slide
  if (slides[currentSlide]) {
    slides[currentSlide].classList.add("active");
  }

  // Add active class to current dot
  if (dots[currentSlide]) {
    dots[currentSlide].classList.add("active");
  }

  // Update counter
  const slideNumber = document.getElementById("slideNumber");
  if (slideNumber) {
    slideNumber.textContent = currentSlide + 1;
  }
}

// Auto-play slides every 8 seconds
let autoPlayInterval = setInterval(() => {
  if (mainContent.style.display !== "none") {
    nextSlide();
  }
}, 8000);

// Handle window resize for confetti canvas
window.addEventListener("resize", () => {
  const canvas = document.getElementById("confettiCanvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Allow Enter key to submit password
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("passwordInput");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkPassword();
      }
    });
    passwordInput.focus();
  }

  // Initialize total slides
  const slides = document.querySelectorAll(".slide");
  totalSlides = slides.length;
  const totalSlidesEl = document.getElementById("totalSlides");
  if (totalSlidesEl) {
    totalSlidesEl.textContent = totalSlides;
  }
});

// Initial slide update
setTimeout(() => {
  updateSlide();
}, 100);

