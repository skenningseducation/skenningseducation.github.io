(function () {

  // -----------------------------
  // Active nav link highlighting
  // -----------------------------
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

  // -----------------------------
  // Helpers
  // -----------------------------
  async function fetchFormHtml(url, fallbackMessage) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load form");
      return await res.text();
    } catch (e) {
      return `<p class="small">${fallbackMessage}</p>`;
    }
  }

  // Theme dropdowns/selects inside injected forms:
  // - add .input so they match other fields
  // - wrap in .select-wrap so the CSS arrow appears
  function themeInjectedSelects(root) {
    if (!root) return;

    const selects = root.querySelectorAll("select");
    selects.forEach(sel => {
      sel.classList.add("input");

      const parent = sel.parentElement;
      if (!parent) return;

      // Prevent double-wrapping
      if (parent.classList.contains("select-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "select-wrap";

      parent.insertBefore(wrap, sel);
      wrap.appendChild(sel);
    });
  }

  // -----------------------------
  // Inject enquiry forms (parents + schools)
  // -----------------------------
  async function injectEnquiryForms() {
    const targets = document.querySelectorAll('[data-enquiry-form]');
    if (!targets.length) return;

    // Default (parents/students) form
    const defaultFormUrl = location.origin + "/enquiry-form.html";
    // School form
    const schoolFormUrl = location.origin + "/school-enquiry-form.html";

    // Preload both (fast + avoids repeated fetches)
    const [defaultHtml, schoolHtml] = await Promise.all([
      fetchFormHtml(defaultFormUrl, "Form failed to load. Please email us directly."),
      fetchFormHtml(schoolFormUrl, "School form failed to load. Please email us directly.")
    ]);

    targets.forEach((t, idx) => {
      const mode = (t.getAttribute("data-form") || "").toLowerCase();
      const isSchool = mode === "school";

      const formHtml = isSchool ? schoolHtml : defaultHtml;
      t.innerHTML = formHtml;

      // Apply select styling/wrapping after injection
      themeInjectedSelects(t);

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

      // Give these unique IDs per injected instance (avoid collisions)
      if (success) success.id = `form-success-${idx}`;
      if (error) error.id = `form-error-${idx}`;

      // Cache the correct submit label for this form instance
      const submitLabel = isSchool ? "Request availability" : "Send enquiry";

      // Ensure initial button label is correct (in case the HTML differs)
      if (button) button.textContent = submitLabel;

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

            // Re-apply select theming in case reset/DOM changes affect it
            themeInjectedSelects(t);

            if (sEl) sEl.style.display = "block";
          } else {
            if (eEl) eEl.style.display = "block";
          }
        } catch (err) {
          if (eEl) eEl.style.display = "block";
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = submitLabel;
          }
        }
      });
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
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
