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
    if (e.key === "Escape") setOpen(false);
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
    communications: [],
    event: [
      { firstName: "Rémi", lastName: "LEPAGE" },
      { firstName: "Julien", lastName: "DNL" },
      { firstName: "Sky", lastName: "" },
    ],
  };

  function poleCard(member) {
    var last = member.lastName || "";
    var initials = (member.firstName.charAt(0) + last.charAt(0)).toUpperCase();
    var media = member.photo
      ? '<img src="' + member.photo + '" alt="Portrait de ' + member.firstName + (last ? " " + last : "") + '" width="400" height="400" loading="lazy" />'
      : '<div class="mono" aria-hidden="true">' + initials + "</div>";
    var role = member.role ? "<p>" + member.role + "</p>" : "";
    var title = last
      ? member.firstName + " <span>" + last + "</span>"
      : member.firstName;
    return (
      "<li><article class=\"member\">" +
      '<div class="member__photo">' + media + "</div>" +
      "<h3>" + title + "</h3>" +
      role +
      "</article></li>"
    );
  }

  Object.keys(poleMembers).forEach(function (key) {
    var grid = document.querySelector('[data-pole-grid="' + key + '"]');
    var empty = document.querySelector('[data-pole-empty="' + key + '"]');
    var list = poleMembers[key];
    if (!grid) return;
    if (list.length) {
      grid.innerHTML = list.map(poleCard).join("");
      grid.classList.add("is-filled");
      if (empty) empty.hidden = true;
    }
  });

  document.querySelectorAll(".member__more").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("aria-controls");
      var dlg = id && document.getElementById(id);
      if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    });
  });

  document.querySelectorAll(".pole-dialog").forEach(function (dlg) {
    dlg.querySelectorAll("[data-close-dialog]").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function () {
        dlg.close();
      });
    });
    dlg.addEventListener("click", function (e) {
      var panel = dlg.querySelector(".pole-dialog__panel");
      if (e.target === dlg || (panel && !panel.contains(e.target))) dlg.close();
    });
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
