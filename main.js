(function () {

  // -----------------------------
  // Active nav link highlighting
  // -----------------------------
  function setActiveNavLink() {
    const path = location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll('.site-nav a[href], .menu a[href]');
    links.forEach(a => a.classList.remove("is-active"));
    const active = Array.from(links).find(a => a.getAttribute("href") === path);
    if (active) active.classList.add("is-active");
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('.site-nav a[href], .menu a[href]');
    if (!a) return;
    document.querySelectorAll('.site-nav a, .menu a').forEach(x => x.classList.remove("is-active"));
    a.classList.add("is-active");
  });

  if (!document.querySelector('link[href="styles.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles.css";
    document.head.appendChild(link);
  }

  async function fetchFormHtml(url, fallbackMessage) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed");
      return await res.text();
    } catch {
      return `<p class="small">${fallbackMessage}</p>`;
    }
  }

  function themeInjectedSelects(root) {
    const selects = root.querySelectorAll("select");
    selects.forEach(sel => {
      sel.classList.add("input");
      if (sel.parentElement.classList.contains("select-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "select-wrap";
      sel.parentElement.insertBefore(wrap, sel);
      wrap.appendChild(sel);
    });
  }

  async function injectEnquiryForms() {
    const targets = document.querySelectorAll('[data-enquiry-form]');
    if (!targets.length) return;

    const [defaultHtml, schoolHtml] = await Promise.all([
      fetchFormHtml("/enquiry-form.html", "Form failed to load."),
      fetchFormHtml("/school-enquiry-form.html", "School form failed to load.")
    ]);

    targets.forEach((t, idx) => {
      const isSchool = (t.getAttribute("data-form") || "").toLowerCase() === "school";
      t.innerHTML = isSchool ? schoolHtml : defaultHtml;
      themeInjectedSelects(t);

      const form = t.querySelector("form");
      if (!form) return;

      const submitLabel = isSchool ? "Request availability" : "Send enquiry";
      const button = form.querySelector("button[type='submit']");
      if (button) button.textContent = submitLabel;

      // ---- "Other" field logic ----
      form.addEventListener("change", (e) => {
        const select = e.target.closest("select[data-has-other]");
        if (!select) return;

        const otherInput = form.querySelector("[data-other-field]");
        if (!otherInput) return;

        if (select.value === "Other") {
          otherInput.style.display = "block";
          otherInput.required = true;
          otherInput.focus();
        } else {
          otherInput.style.display = "none";
          otherInput.required = false;
          otherInput.value = "";
        }
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const success = form.querySelector("#form-success");
        const error = form.querySelector("#form-error");

        if (success) success.style.display = "none";
        if (error) error.style.display = "none";

        if (button) {
          button.disabled = true;
          button.textContent = "Sending…";
        }

        try {
          const res = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
          });

          if (res.ok) {
            form.reset();
            themeInjectedSelects(t);
            if (success) success.style.display = "block";
          } else {
            if (error) error.style.display = "block";
          }
        } catch {
          if (error) error.style.display = "block";
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = submitLabel;
          }
        }
      });
    });
  }

  function init() {
    setActiveNavLink();
    injectEnquiryForms();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();

})();
