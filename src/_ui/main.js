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

function spawnRandomImages(amount = 12) {
  const source = [
    "/assets/bell.png",
    "/assets/gift.png",
    "/assets/hat.png",
    "/assets/wreath.png",
  ];
  const size = 64;
  const fragment = document.createDocumentFragment();
  const maxX = window.innerWidth - size;
  const maxY = window.innerHeight - size;

  for (let i = 0; i < amount; i++) {
    const img = document.createElement("img");
    img.className = "drag-img";

    const randomImage = source[Math.floor(Math.random() * source.length)];

    img.src = randomImage;

    img.style.left = `${Math.random() * maxX}px`;
    img.style.top = `${Math.random() * maxY}px`;
    img.style.transform = `rotate(${Math.round(Math.random() * 360)}deg)`;

    fragment.appendChild(img);
  }

  document.body.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("mousemove", (e) => {
    for (let i = 0; i < 2; i++) {
      createSnowflake(e.clientX, e.clientY);
    }
  });

  spawnRandomImages(8);

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
  let globalIndex = 0,
    last = { x: 0, y: 0 };
  const activate = (image, x, y) => {
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
    image.style.zIndex = globalIndex;

    tail.classList.toggle("active", true);

    last = { x, y };
  };

  const distanceFromLast = (x, y) => Math.hypot(x - last.x, y - last.y);

  const handleOnMove = (e) => {
    if (distanceFromLast(e.clientX, e.clientY) > window.innerWidth / 20) {
      const lead = images[globalIndex % images.length],
        tail = images[(globalIndex - 3) % images.length];

      activate(lead, e.clientX, e.clientY);

      if (tail) tail.classList.toggle("active", false);

      globalIndex++;
    }
  };
});
