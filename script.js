const navToggle = document.getElementById("nav-toggle");
const menuLinks = document.querySelectorAll(".menu a");

menuLinks.forEach(link => { // inchide meniu daca apesi pe un link
  link.addEventListener("click", () => {
    navToggle.checked = false;
  });
});

document.addEventListener("click", (e) => { // inchide meniu daca apesi afara
  const menu = document.querySelector(".menu");
  const toggle = document.querySelector(".menu-toggle");

  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    navToggle.checked = false;
  }
});
