(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var iconOpen = document.querySelector(".icon-menu");
  var iconClose = document.querySelector(".icon-close");

  function setOpen(open) {
    if (!header || !toggle) return;
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    if (iconOpen && iconClose) {
      iconOpen.hidden = open;
      iconClose.hidden = !open;
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var box = document.getElementById("photo-lightbox");
    if (box && box.open) {
      box.close();
      return;
    }
    setOpen(false);
  });

  window.addEventListener(
    "scroll",
    function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-in");
    });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  var poleMembers = {
    communications: [
      { firstName: "Rémi", lastName: "Lepage" },
      { firstName: "Julien", lastName: "DNL" },
      { firstName: "Sky", lastName: "" },
    ],
    event: [],
  };

  function poleName(member) {
    var last = member.lastName || "";
    var label = last ? member.firstName + " " + last : member.firstName;
    return "<li>" + label + "</li>";
  }

  Object.keys(poleMembers).forEach(function (key) {
    var grid = document.querySelector('[data-pole-grid="' + key + '"]');
    var empty = document.querySelector('[data-pole-empty="' + key + '"]');
    var list = poleMembers[key];
    if (!grid) return;
    if (list.length) {
      grid.innerHTML = list.map(poleName).join("");
      grid.classList.add("is-filled");
      if (empty) empty.hidden = true;
    }
  });

  document.querySelectorAll(".member__more").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var id = btn.getAttribute("aria-controls");
      var dlg = id && document.getElementById(id);
      if (dlg && typeof dlg.showModal === "function") {
        setTimeout(function () {
          dlg.showModal();
        }, 0);
      }
    });
  });

  document.querySelectorAll(".pole-dialog").forEach(function (dlg) {
    dlg.querySelectorAll("[data-close-dialog]").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dlg.close();
      });
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
  });

  function parseList(el, attr) {
    try {
      return JSON.parse(el.getAttribute(attr) || "[]");
    } catch (err) {
      return [];
    }
  }

  var lightbox = document.getElementById("photo-lightbox");
  var lightboxImg = lightbox && lightbox.querySelector("img");
  var lbPrev = lightbox && lightbox.querySelector("[data-lightbox-prev]");
  var lbNext = lightbox && lightbox.querySelector("[data-lightbox-next]");
  var lightboxState = { sources: [], alts: [], index: 0 };

  function showLightbox(sources, alts, index) {
    if (!lightbox || !lightboxImg || !sources.length) return;
    lightboxState = { sources: sources, alts: alts, index: index };
    lightboxImg.src = sources[index];
    lightboxImg.alt = alts[index] || "";
    var many = sources.length > 1;
    if (lbPrev) lbPrev.hidden = !many;
    if (lbNext) lbNext.hidden = !many;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
  }

  function stepLightbox(delta) {
    var n = lightboxState.sources.length;
    if (!n) return;
    lightboxState.index = (lightboxState.index + delta + n) % n;
    lightboxImg.src = lightboxState.sources[lightboxState.index];
    lightboxImg.alt = lightboxState.alts[lightboxState.index] || "";
  }

  if (lightbox) {
    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        lightbox.close();
      });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    if (lbPrev) lbPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      stepLightbox(-1);
    });
    if (lbNext) lbNext.addEventListener("click", function (e) {
      e.stopPropagation();
      stepLightbox(1);
    });
  }

  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var sources = parseList(gallery, "data-images");
    var alts = parseList(gallery, "data-alts");
    if (!sources.length) return;
    var img = gallery.querySelector("[data-gallery-image]");
    var count = gallery.querySelector("[data-gallery-count]");
    var index = 0;

    function render() {
      if (img) {
        img.src = sources[index];
        img.alt = alts[index] || "";
      }
      if (count) count.textContent = index + 1 + " / " + sources.length;
    }

    function step(delta) {
      index = (index + delta + sources.length) % sources.length;
      render();
    }

    var prev = gallery.querySelector("[data-gallery-prev]");
    var next = gallery.querySelector("[data-gallery-next]");
    if (prev) prev.addEventListener("click", function (e) {
      e.stopPropagation();
      step(-1);
    });
    if (next) next.addEventListener("click", function (e) {
      e.stopPropagation();
      step(1);
    });
    var frame = gallery.querySelector("[data-gallery-open]");
    if (frame) {
      frame.addEventListener("click", function () {
        showLightbox(sources, alts, index);
      });
    }
    if (sources.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      if (count) count.hidden = true;
    }
    render();
  });

  var form = document.getElementById("contact-form");
  if (!form) return;

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.namedItem("name");
    var email = form.elements.namedItem("email");
    var subject = form.elements.namedItem("subject");
    var message = form.elements.namedItem("message");
    var phone = form.elements.namedItem("phone");
    var company = form.elements.namedItem("company");
    var errors = {};

    function show(field, msg) {
      var input = form.elements.namedItem(field);
      var err = document.getElementById("err-" + field);
      if (!input) return;
      input.classList.toggle("is-error", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) {
        err.textContent = msg || "";
        err.hidden = !msg;
      }
    }

    if (!name.value.trim()) errors.name = "Merci d’indiquer votre nom.";
    if (!emailRe.test(email.value.trim())) errors.email = "Cette adresse e-mail ne semble pas valide.";
    if (!subject.value.trim()) errors.subject = "Merci de préciser le sujet de votre message.";
    if (message.value.trim().length < 20) {
      errors.message = "Quelques mots de plus nous aideront à vous répondre (20 caractères min.).";
    }

    ["name", "email", "subject", "message"].forEach(function (f) {
      show(f, errors[f]);
    });

    var first = Object.keys(errors)[0];
    if (first) {
      form.elements.namedItem(first).focus();
      return;
    }

    var body = [
      "Nom : " + name.value,
      company.value ? "Société : " + company.value : null,
      phone.value ? "Téléphone : " + phone.value : null,
      "E-mail : " + email.value,
      "",
      message.value,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href =
      "mailto:sponsor.formulaepf@epfedu.fr?subject=" +
      encodeURIComponent(subject.value) +
      "&body=" +
      encodeURIComponent(body);

    var ok = document.getElementById("form-ok");
    if (ok) ok.hidden = false;
  });
})();
