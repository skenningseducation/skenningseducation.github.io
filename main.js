(function () {

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

    // Works on GitHub Pages + custom domains
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

      // Unique IDs (in case multiple forms appear on one page)
      form.id = `contact-form-${idx}`;

      // Set subject from the placeholder attribute
      const subjectFromDiv = t.getAttribute("data-subject") || "New enquiry – Skennings Education";
      const subjInput = form.querySelector('input[name="_subject"]');
      if (subjInput) subjInput.value = subjectFromDiv;

      // Make success/error unique too
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectEnquiryForms);
  } else {
    injectEnquiryForms();
  }

})();
