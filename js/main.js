// Mobile navigation toggle
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

// Close the mobile menu after tapping a link
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Booking form (front-end only — shows a confirmation message)
const bookingForm = document.getElementById("bookingForm");
const formNote = document.getElementById("formNote");

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    formNote.textContent = "Please fill in every field to request a booking.";
    formNote.classList.add("error");
    return;
  }

  const name = bookingForm.name.value.trim();
  formNote.classList.remove("error");
  formNote.textContent = `Thanks, ${name}! We'll confirm your appointment shortly.`;
  bookingForm.reset();
});
