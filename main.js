(function () {

  /* ============================
     Mobile menu toggle
     ============================ */

  const burger = document.querySelector('[data-burger]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (burger && panel) {
    burger.addEventListener('click', () => {
      panel.classList.toggle('show');
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!expanded));
    });
  }

  /* ============================
     Enquiry form handler
     Sends email via mailto:
     ============================ */

  const forms = document.querySelectorAll('form[data-enquiry-form]');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const f = e.target;

      const subject = encodeURIComponent(
        "New enquiry — " +
        (f.subject?.value || "") + " " +
        (f.level?.value || "") +
        (f.year?.value ? (" (Year " + f.year.value + ")") : "")
      );

      const body = encodeURIComponent(
        "Name: " + (f.name?.value || "") + "\n" +
        "Email: " + (f.email?.value || "") + "\n" +
        (f.phone?.value ? "Phone: " + f.phone.value + "\n" : "") +
        "Subject: " + (f.subject?.value || "") + "\n" +
        "Level: " + (f.level?.value || "") + "\n" +
        "Year group: " + (f.year?.value || "") + "\n\n" +
        "Message:\n" + (f.message?.value || "")
      );

      window.location.href =
        "mailto:ben@skenningseducation.com" +
        "?subject=" + subject +
        "&body=" + body;
    });
  });

})();
