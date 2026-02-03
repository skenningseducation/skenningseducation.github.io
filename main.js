(function () {

  function setActiveNavLink() {
    const path = location.pathname.split("/").pop() || "index.html";

    // Support both the new nav (.site-nav) and legacy nav (.menu) if any old pages remain
    const links = document.querySelectorAll('.site-nav a[href], .menu a[href]');

    links.forEach(a => a.classList.remove("is-active"));

    const active = Array.from(links).find(a => a.getAttribute("href") === path);
    if (active) active.classList.add("is-active");
  }

  // Switch active state immediately on click (nice UX)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('.site-nav a[href], .menu a[href]');
    if (!a) return;

    document.querySelectorAll('.site-nav a, .menu a').forEach(x => x.classList.remove("is-active"));
    a.classList.add("is-active");
  });

  // Ensure styles.css is loaded (helps when injecting fragments)
  if (!document.querySelector('link[href="styles.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles.css";
    document.head.appendChild(link);
  }

  async function injectEnquiryForms() {
    const targets = document.querySelectorAll('[data-enquiry-form]');
    if (!targets.length) return;

    const formUrl = location.origin + "/enquiry-form.html";

    let formHtml = "";
    try {
      const res = await fetch(formUrl, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load enquiry-form.html");
      formHtml = await res.text();
    } catch (e) {
      targets.forEach(t => {
        t.innerHTML = `<p class="small">Form failed to load. Please email us directly.</p>`;
      });
      return;
    }

    targets.forEach((t, idx) => {
      t.innerHTML = formHtml;

      const form = t.querySelector("form");
      if (!form) return;

      form.id = `contact-form-${idx}`;

      // Allow pages to set a custom email subject via data-subject
      const subjectFromDiv = t.getAttribute("data-subject") || "New enquiry – Skennings Education";
      const subjInput = form.querySelector('input[name="_subject"]');
      if (subjInput) subjInput.value = subjectFromDiv;

      const success = form.querySelector("#form-success");
      const error = form.querySelector("#form-error");
      const button = form.querySelector('button[type="submit"]');

      if (success) success.id = `form-success-${idx}`;
      if (error) error.id = `form-error-${idx}`;

      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const sEl = form.querySelector(`#form-success-${idx}`);
        const eEl = form.querySelector(`#form-error-${idx}`);

        if (sEl) sEl.style.display = "none";
        if (eEl) eEl.style.display = "none";

        if (button) {
          button.disabled = true;
          button.textContent = "Sending…";
        }

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
          });

          if (response.ok) {
            form.reset();
            if (sEl) sEl.style.display = "block";
          } else {
            if (eEl) eEl.style.display = "block";
          }
        } catch (err) {
          if (eEl) eEl.style.display = "block";
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = "Send enquiry";
          }
        }
      });
    });
  }

  function init() {
    setActiveNavLink();
    injectEnquiryForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
