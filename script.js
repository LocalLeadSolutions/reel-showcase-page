/* Reel cards: lazy-load, muted autoplay loop, tap to toggle sound (one at a time).
   FAQ accordion. */

(function () {
  const cards = Array.from(document.querySelectorAll(".reel-card"));
  let currentUnmuted = null;

  function loadVideo(card) {
    const video = card.querySelector("video");
    if (!video || video.dataset.loaded === "1") return video;
    const src = card.getAttribute("data-src");
    if (!src) return video;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.muted = true;
    video.loop = true;
    video.preload = "metadata";
    video.src = src;
    video.dataset.loaded = "1";
    video.load();
    return video;
  }

  function tryPlay(video) {
    if (!video) return;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {
        /* Autoplay can be blocked; poster stays until the user taps. */
      });
    }
  }

  function muteCard(card) {
    const video = card.querySelector("video");
    const btn = card.querySelector(".sound-btn");
    if (video) {
      video.muted = true;
    }
    card.classList.remove("is-unmuted");
    if (btn) btn.textContent = "Tap for sound";
    if (currentUnmuted === card) currentUnmuted = null;
  }

  function unmuteCard(card) {
    const video = loadVideo(card);
    const btn = card.querySelector(".sound-btn");
    if (currentUnmuted && currentUnmuted !== card) {
      muteCard(currentUnmuted);
    }
    if (video) {
      video.muted = false;
      tryPlay(video);
    }
    card.classList.add("is-unmuted");
    if (btn) btn.textContent = "Sound on";
    currentUnmuted = card;
  }

  function toggleCard(card) {
    const video = loadVideo(card);
    tryPlay(video);
    if (card.classList.contains("is-unmuted")) {
      muteCard(card);
    } else {
      unmuteCard(card);
    }
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const card = entry.target;
          const video = card.querySelector("video");
          if (entry.isIntersecting) {
            const v = loadVideo(card);
            tryPlay(v);
          } else if (video) {
            video.pause();
            if (card.classList.contains("is-unmuted")) muteCard(card);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.15 }
    );
    cards.forEach(function (card) {
      io.observe(card);
    });
  } else {
    cards.forEach(function (card) {
      tryPlay(loadVideo(card));
    });
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function (ev) {
      ev.preventDefault();
      toggleCard(card);
    });
    const btn = card.querySelector(".sound-btn");
    if (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        toggleCard(card);
      });
    }
    const video = card.querySelector("video");
    if (video) {
      video.addEventListener("ended", function () {
        /* loop attribute should restart; keep muted state as-is */
      });
    }
  });

  document.querySelectorAll(".faq-item").forEach(function (item) {
    const btn = item.querySelector("button");
    const body = item.querySelector(".faq-body");
    if (!btn || !body) return;
    const bodyId = "faq-" + Math.random().toString(36).slice(2, 8);
    body.id = bodyId;
    btn.setAttribute("aria-controls", bodyId);
    btn.addEventListener("click", function () {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      const chev = btn.querySelector(".chevron");
      if (chev) chev.textContent = open ? "−" : "+";
    });
  });
})();
