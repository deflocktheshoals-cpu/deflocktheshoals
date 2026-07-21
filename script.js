// DeFlock the Shoals — front-end behavior
// Everything here is progressive enhancement: the page works fully without it.
(function () {
  "use strict";
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
    var observer = new IntersectionObserver(
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
      if (section) observer.observe(section);
    });
  }
  // --- 2. Map iframe: show a fallback link if it fails to load ---
  var mapEmbed = document.getElementById("map-embed");
  if (mapEmbed) {
    var iframe = mapEmbed.querySelector("iframe");
    var fallbackShown = false;
    function showFallback() {
      if (fallbackShown) return;
      fallbackShown = true;
      mapEmbed.innerHTML =
        '<div class="map-fallback">' +
        "<p>The live map couldn't load here.</p>" +
        '<a class="btn btn-primary" href="https://maps.deflock.org/?lat=34.8208&lng=-87.5896&zoom=10.31" target="_blank" rel="noopener">Open the map on deflock.org &rarr;</a>' +
        "</div>";
    }
    // If the iframe hasn't reported a load within 8s, offer the fallback.
    var timer = setTimeout(showFallback, 8000);
    if (iframe) {
      iframe.addEventListener("load", function () { clearTimeout(timer); });
      iframe.addEventListener("error", showFallback);
    }
  }
  // --- 3. Reflect the current year in the footer, if a slot exists ---
  var yearSlot = document.getElementById("year");
  if (yearSlot) {
    yearSlot.textContent = new Date().getFullYear();
  }

  // --- 4. Contact modal: open from the "Sign up" and "Get involved" buttons ---
  var modal = document.getElementById("contact-modal");
  if (modal) {
    var openers = [
      document.getElementById("open-contact"),
      document.getElementById("open-contact-2")
    ];
    var closeBtn = document.getElementById("close-contact");
    var submitBtn = document.getElementById("submit-contact");
    var status = document.getElementById("contact-status");

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      var nameField = document.getElementById("c-name");
      if (nameField) nameField.focus();
    }
    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    openers.forEach(function (btn) {
      if (btn) btn.addEventListener("click", openModal);
    });
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Close when clicking the dark overlay area (outside the modal box).
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    if (submitBtn && status) {
      submitBtn.addEventListener("click", function () {
        var email = (document.getElementById("c-email") || {}).value || "";
        if (!email.trim()) {
          status.hidden = false;
          status.textContent = "Please add an email so we can reach you.";
          return;
        }
        status.hidden = false;
        status.textContent = "Thanks! You're on the list. We'll be in touch.";
      });
    }
  }
})();
