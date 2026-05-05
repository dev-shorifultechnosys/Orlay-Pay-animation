document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");
  const progress = document.getElementById("scrollProgress");
  const demoForm = document.getElementById("demoForm");
  const successMessage = document.querySelector(".success-message");
  const navLinks = document.querySelectorAll(".nav-link");
  const revealItems = document.querySelectorAll(".reveal");
  const splitItems = document.querySelectorAll(".split-reveal");
  const storySteps = document.querySelectorAll(".story-step");
  const visualCards = document.querySelectorAll(".visual-card");
  const cursorOrb = document.getElementById("cursorOrb");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  splitItems.forEach((item) => {
    const originalNodes = Array.from(item.childNodes);
    let index = 0;
    item.innerHTML = "";

    originalNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach((word) => {
          if (word.trim() === "") {
            item.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement("span");
            span.className = "word";
            span.style.setProperty("--i", index++);
            span.textContent = word;
            item.appendChild(span);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const wrapper = node.cloneNode(false);
        const words = node.textContent.split(/(\s+)/);
        words.forEach((word) => {
          if (word.trim() === "") {
            wrapper.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement("span");
            span.className = "word";
            span.style.setProperty("--i", index++);
            span.textContent = word;
            wrapper.appendChild(span);
          }
        });
        item.appendChild(wrapper);
      }
    });
  });

  function updateActiveNav() {
    const scrollPoint = window.scrollY + 130;
    document.querySelectorAll("main section[id]").forEach((section) => {
      const id = section.getAttribute("id");
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPoint >= top && scrollPoint < bottom) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${value}%`;
  }

  function handleScroll() {
    header.classList.toggle("scrolled", window.scrollY > 18);
    backToTop.classList.toggle("show", window.scrollY > 460);
    updateActiveNav();
    updateProgress();
    updateStory();
  }

  function updateStory() {
    if (!storySteps.length) return;

    let activeKey = storySteps[0].dataset.story;
    let closest = Infinity;

    storySteps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height * 0.45 - window.innerHeight * 0.45);
      if (distance < closest) {
        closest = distance;
        activeKey = step.dataset.story;
      }
    });

    storySteps.forEach((step) => {
      step.classList.toggle("active", step.dataset.story === activeKey);
    });

    visualCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.visual === activeKey);
    });
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  revealItems.forEach((item) => observer.observe(item));
  splitItems.forEach((item) => observer.observe(item));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      const nav = document.getElementById("mainNav");
      if (nav && nav.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (!prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let orbX = mouseX;
    let orbY = mouseY;

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0.03");
        const x = (event.clientX - window.innerWidth / 2) * speed;
        const y = (event.clientY - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }, { passive: true });

    function animateOrb() {
      orbX += (mouseX - orbX) * 0.08;
      orbY += (mouseY - orbY) * 0.08;
      if (cursorOrb) {
        cursorOrb.style.transform = `translate3d(${orbX - 160}px, ${orbY - 160}px, 0)`;
      }
      requestAnimationFrame(animateOrb);
    }
    animateOrb();

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.16}px, ${y * 0.18}px)`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
  }

  if (demoForm) {
    demoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      successMessage.classList.remove("show");

      if (!demoForm.checkValidity()) {
        demoForm.classList.add("was-validated");
        return;
      }

      const payload = Object.fromEntries(new FormData(demoForm).entries());
      console.log("Orlay Pay demo request:", payload);

      demoForm.reset();
      demoForm.classList.remove("was-validated");
      successMessage.classList.add("show");
    });
  }
});
