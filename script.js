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
})();
