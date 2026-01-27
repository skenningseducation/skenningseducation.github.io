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
     ============================ */
  const forms = document.querySelectorAll('form[data-enquiry-form]');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const f = e.target;

      const name    = f.name?.value || "Not provided";
      const email   = f.email?.value || "Not provided";
      const phone   = f.phone?.value || "Not provided";
      const subject = f.subject?.value || "Not specified";
      const level   = f.level?.value || "Not specified";
      const year    = f.year?.value || "Not specified";
      const message = f.message?.value || "No message provided";

      const emailSubject = encodeURIComponent(
        "New enquiry – " + subject + " " + level
      );

      const emailBody = encodeURIComponent(
        "New enquiry received from the Skennings Education website\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + phone + "\n" +
        "Subject: " + subject + "\n" +
        "Level: " + level + "\n" +
        "Year group: " + year + "\n\n" +
        "Message:\n" +
        message
      );

      window.location.href =
        "mailto:ben@skenningseducation.com" +
        "?subject=" + emailSubject +
        "&body=" + emailBody;
    });
  });

})();
