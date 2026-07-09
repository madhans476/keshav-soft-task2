// src/js/contact-form.js
//
// Bootstrap's standard client-side validation pattern. Only imported
// by the contact page (see contact.njk's extra_scripts block) — no
// point shipping this to Home or About.

const form = document.getElementById('contactForm');
const successAlert = document.getElementById('formSuccess');

if (form) {
  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        successAlert.classList.add('d-none');
      } else {
        // In production this is where the form payload would be sent to the
        // server / API endpoint. Here we just confirm the data is valid.
        successAlert.classList.remove('d-none');
        form.reset();
        form.classList.remove('was-validated');
      }

      form.classList.add('was-validated');
    },
    false
  );
}
