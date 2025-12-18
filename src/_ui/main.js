import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  ScrambleTextPlugin,
);

const container = document.getElementById("container");

function createSnowflake(x, y) {
  const flake = document.createElement("div");
  flake.className = "snowflake";

  const size = Math.random() * 3 + 2;
  const duration = Math.random() * 1.5 + 0.5;
  const offsetX = (Math.random() - 0.5) * 20;

  flake.style.width = `${size}px`;
  flake.style.height = `${size}px`;
  flake.style.left = `${x + offsetX}px`;
  flake.style.top = `${y}px`;
  flake.style.animationDuration = `${duration}s`;

  container.appendChild(flake);

  setTimeout(() => {
    flake.remove();
  }, duration * 800);
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("mousemove", (e) => {
    for (let i = 0; i < 2; i++) {
      createSnowflake(e.clientX, e.clientY);
    }
  });

  Draggable.create(".drag-img", {
    bounds: "#container",
    cursor: `url("/assets/cursor-pointer.png") 10 10,
    auto`,
    inertia: true,
  });

  gsap.from(".drag-img", {
    scale: 0,
    duration: 0.8,
    ease: "elastic.inOut",
    stagger: { amount: 0.8 },
    scrollTrigger: {
      trigger: "#container",
      start: "top bottom",
      toggleActions: "play none none none",
    },
  });

  document.querySelectorAll(".scramble").forEach((el) => {
    gsap.to(el, {
      duration: 2,
      scrambleText: {
        text: el.textContent,
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      },
    });
    gsap.from(el, {
      duration: 0.8,
      opacity: 0,
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        toggleActions: "play none none none",
      },
    });
  });

  const images = document.querySelectorAll(".image");
  let globalIndex = 1,
    last = { x: 0, y: 0 };
  const activate = (image, x, y) => {
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
    image.style.zIndex = globalIndex;

    image.classList.toggle("active", true);
    // setTimeout(() => {
    //   image.classList.toggle("active", false);
    // }, 4000);

    last = { x, y };
  };

  const distanceFromLast = (x, y) => Math.hypot(x - last.x, y - last.y);

  const handleOnMove = (e) => {
    if (distanceFromLast(e.clientX, e.clientY) > 120) {
      const lead = images[globalIndex % images.length],
        tail = images[(globalIndex - 7) % images.length];

      activate(lead, e.clientX, e.clientY);

      if (tail) tail.classList.toggle("active", false);

      globalIndex++;
    }
  };

  document.addEventListener("mousemove", handleOnMove);
  document.addEventListener("touchmove", handleOnMove);

  const game = document.getElementById("game");
  const santa = document.getElementById("santa");
  const grinch = document.getElementById("grinch");
  const scoreEl = document.getElementById("score");
  const hScoreEl = document.getElementById("highest-score");
  let score = 0;
  let hScore = parseInt(localStorage.getItem("hScore")) || 0;
  hScoreEl.textContent = hScore;
  let checkCollision;

  const santaJump = () => {
    if (santa.classList.contains("jump")) return;
    santa.classList.toggle("jump", true);
    setTimeout(() => {
      santa.classList.toggle("jump", false);
    }, 800);
  };

  // valores base do design original
  const BASE_WIDTH = 1920;
  const BASE_GRINCH_TIME = 4; // segundos

  // velocidade base (px/s)
  const baseSpeed = BASE_WIDTH / BASE_GRINCH_TIME;

  // largura atual
  const screenWidth = document.documentElement.clientWidth || window.innerWidth;

  // (opcional) largura do grinch
  const grinchWidth = 56;

  // distância total que o grinch percorre
  const distance = screenWidth + grinchWidth;

  // tempo ajustado
  const grinchTime = distance / baseSpeed;

  // seta a variável CSS
  game.style.setProperty("--grinch-time", `${grinchTime}s`);

  const handleGame = () => {
    if (!game.classList.contains("playing")) {
      let checkCollision = setInterval(() => {
        const santaRect = santa.getBoundingClientRect();
        const grinchRect = grinch.getBoundingClientRect();

        const xColliding =
          grinchRect.left < santaRect.right && grinchRect.left > santaRect.left;
        const yColliding = santaRect.bottom > grinchRect.top;
        score += 1;
        scoreEl.textContent = score;

        if (xColliding && yColliding) {
          if (score > hScore) {
            hScore = score;
            hScoreEl.textContent = hScore;
            localStorage.setItem("hScore", hScore);
          }
          score = 0;
          scoreEl.textContent = score;
          clearInterval(checkCollision);
          game.classList.toggle("over", true);
          game.classList.toggle("playing", false);
        }
      }, 10);
      game.classList.toggle("over", false);
      game.classList.toggle("playing", true);
      return;
    }
    santaJump();
  };

  document.addEventListener("keypress", (e) => {
    if (e.key == " " || e.key == "Enter") {
      handleGame();
    }
  });

  window.addEventListener("click", handleGame);
});
