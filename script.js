// DeFlock the Shoals — front-end behavior
// Everything here is progressive enhancement: the page works fully without it.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- 1. Highlight the current section in the nav as you scroll ---
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id) linkFor[id] = a;
    });
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  // --- 2. Map: try to embed, fall back cleanly to the panel already in the HTML ---
  // maps.deflock.org may refuse to be framed by other sites. If it does, the
  // panel stays and the user gets a clean "open the map" call to action instead
  // of an error. We only swap in the iframe if it actually loads.
  var mapEmbed = document.getElementById("map-embed");
  if (mapEmbed) {
    var mapUrl = mapEmbed.getAttribute("data-map-url");
    if (mapUrl) {
      var probe = document.createElement("iframe");
      probe.src = mapUrl;
      probe.title = "DeFlock map of license plate readers in the Shoals";
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
        // The frame loaded, so promote it to the real, full size map.
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

  // --- 3. Current year in the footer ---
  var yearSlot = document.getElementById("year");
  if (yearSlot) {
    yearSlot.textContent = new Date().getFullYear();
  }

  // --- 4. Accordions: only one open at a time, per section ---
  var accordions = Array.prototype.slice.call(document.querySelectorAll("details.acc"));
  accordions.forEach(function (acc) {
    acc.addEventListener("toggle", function () {
      if (!acc.open) return;
      var section = acc.closest("section");
      if (!section) return;
      section.querySelectorAll("details.acc").forEach(function (other) {
        if (other !== acc) other.open = false;
      });
    });
  });

  // --- 5. Contact modal ---
  var modal = document.getElementById("contact-modal");
  if (modal) {
    var opener = document.getElementById("open-contact");
    var closeBtn = document.getElementById("close-contact");
    var form = document.getElementById("contact-form");
    var status = document.getElementById("contact-status");
    var submitBtn = document.getElementById("submit-contact");
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var first = document.getElementById("c-name");
      if (first) first.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    if (opener) opener.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    // Submit to Formspree via fetch so the user stays on the page.
    if (form && status) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        status.hidden = false;
        status.classList.remove("is-ok");
        status.textContent = "Sending...";
        if (submitBtn) submitBtn.disabled = true;

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (res.ok) {
              form.reset();
              status.classList.add("is-ok");
              status.textContent = "Thanks! Your message is on its way. We'll be in touch.";
              setTimeout(closeModal, 2500);
            } else {
              return res.json().then(function (data) {
                var msg = "Something went wrong. Please try again.";
                if (data && data.errors && data.errors.length) {
                  msg = data.errors.map(function (x) { return x.message; }).join(", ");
                }
                status.textContent = msg;
              });
            }
          })
          .catch(function () {
            status.textContent = "Couldn't send that. Check your connection and try again.";
          })
          .then(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  }

  // --- 6. Gentle scroll reveal for sections ---
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealTargets = Array.prototype.slice.call(
      document.querySelectorAll(".stat, .acc, .step, .join .card, .case")
    );
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          setTimeout(function () { el.classList.add("is-visible"); }, i * 60);
          revealObserver.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
    );

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }
})();
