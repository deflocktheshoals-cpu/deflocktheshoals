document.addEventListener("DOMContentLoaded", function () {

  // --- 1. Nav scroll-spy: highlight the section you're looking at ---
  var navLinks = document.querySelectorAll(".nav-links a, .nav-mobile a");
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href");
    if (id && id.charAt(0) === "#") {
      var sec = document.querySelector(id);
      if (sec) sections.push({ link: link, sec: sec, id: id });
    }
  });

  function onScrollSpy() {
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function (item) {
      if (item.sec.offsetTop <= pos) current = item.id;
    });
    navLinks.forEach(function (link) {
      if (current && link.getAttribute("href") === current) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }
  window.addEventListener("scroll", onScrollSpy);
  onScrollSpy();

  // --- 2. Map: try to embed, fall back to the panel if it refuses ---
  var mapEmbed = document.getElementById("map-embed");
  if (mapEmbed) {
    var mapUrl = mapEmbed.getAttribute("data-map-url");
    if (mapUrl) {
      var probe = document.createElement("iframe");
      probe.src = mapUrl;
      probe.title = "DeFlock camera map of the Shoals";
      probe.setAttribute("loading", "lazy");
      probe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      probe.style.cssText =
        "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;";

      var settled = false;
      var giveUp = setTimeout(function () {
        if (settled) return;
        settled = true;
        if (probe.parentNode) probe.parentNode.removeChild(probe);
      }, 6000);

      probe.addEventListener("load", function () {
        if (settled) return;
        settled = true;
        clearTimeout(giveUp);
        probe.style.cssText = "";
        mapEmbed.innerHTML = "";
        mapEmbed.style.display = "block";
        mapEmbed.appendChild(probe);
      });

      probe.addEventListener("error", function () {
        if (settled) return;
        settled = true;
        clearTimeout(giveUp);
        if (probe.parentNode) probe.parentNode.removeChild(probe);
      });

      mapEmbed.appendChild(probe);
    }
  }

  // --- 3. Footer year ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- 4. Accordions: only one open per section ---
  var accGroups = document.querySelectorAll("section");
  accGroups.forEach(function (group) {
    var accs = group.querySelectorAll("details.acc");
    accs.forEach(function (acc) {
      acc.addEventListener("toggle", function () {
        if (acc.open) {
          accs.forEach(function (other) {
            if (other !== acc) other.open = false;
          });
        }
      });
    });
  });

  // --- 5. Contact modal ---
  var modal = document.getElementById("contact-modal");
  var openBtn = document.getElementById("open-contact");
  var closeBtn = document.getElementById("close-contact");

  function openModal() {
    if (modal) {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  }
  function closeModal() {
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
  }
  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // --- 6. Contact form via Formspree (stay on page) ---
  var form = document.getElementById("contact-form");
  var status = document.getElementById("contact-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (status) {
        status.hidden = false;
        status.classList.remove("is-ok");
        status.textContent = "Sending...";
      }
      fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (status) {
              status.classList.add("is-ok");
              status.textContent = "Thanks! Your message has been sent.";
            }
          } else {
            if (status) {
              status.textContent =
                "Something went wrong. Please try again or email us directly.";
            }
          }
        })
        .catch(function () {
          if (status) {
            status.textContent =
              "Something went wrong. Please try again or email us directly.";
          }
        });
    });
  }

  // --- 7. Scroll reveal ---
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      obs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // --- 8. Mobile nav toggle ---
  var navToggle = document.getElementById("nav-toggle");
  var navMobile = document.getElementById("nav-mobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var open = navMobile.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- 9. Image lightbox (tap to enlarge) ---
  var zoomImgs = document.querySelectorAll(".zoomable");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  if (lightbox && lightboxImg) {
    zoomImgs.forEach(function (img) {
      img.addEventListener("click", function () {
        lightboxImg.src = img.getAttribute("src");
        lightboxImg.alt = img.getAttribute("alt") || "";
        lightbox.classList.add("is-open");
      });
    });
    lightbox.addEventListener("click", function () {
      lightbox.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lightbox.classList.remove("is-open");
    });
  }

});
