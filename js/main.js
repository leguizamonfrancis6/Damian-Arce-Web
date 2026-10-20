// Número de WhatsApp de Damián en formato internacional, sin "+" ni espacios (+54 9 342 510-2769).
const WHATSAPP_NUMBER = "5493425102769";

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Año del copyright del pie, siempre actualizado
document.getElementById("year").textContent = new Date().getFullYear();

// Enlaces de la barra: "Perfil" se centra con el nombre y "Contacto" con el contenido carrusel.
// Solo en pantallas anchas; en las angostas los bloques van apilados y los enlaces quedan en los extremos.
const navAlign = [
  [document.querySelector(".nav__link--left"), document.querySelector(".hero__title h1")],
  [document.querySelector(".nav__link--right"), document.querySelector(".topic-card")],
];
const wideScreen = window.matchMedia("(min-width: 901px)");

function centerX(el) {
  const rect = el.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function alignNavLinks() {
  navAlign.forEach(([link, target]) => {
    link.style.transform = "";
    if (!wideScreen.matches) return;
    link.style.transform = `translateX(${centerX(target) - centerX(link)}px)`;
  });
}

alignNavLinks();
window.addEventListener("resize", alignNavLinks);
window.addEventListener("load", alignNavLinks);
document.fonts?.ready.then(alignNavLinks);

// Carrusel de fondo del hero
const SLIDE_MS = 7000;
const slides = document.querySelectorAll(".hero__slide");
const practiceNames = document.querySelectorAll(".practice-label__name");
const barFill = document.querySelector(".practice-label__fill");
const chipGroups = document.querySelectorAll(".chip-groups .chips");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentSlide = 0;
let slideTimer;
let barAnimation;

// La barrita dorada se carga de cero a lleno mientras dura cada imagen
function restartBar() {
  if (barAnimation) barAnimation.cancel();
  if (!slideTimer) {
    barFill.style.width = "100%";
    return;
  }
  barFill.style.width = "";
  barAnimation = barFill.animate([{ width: "0%" }, { width: "100%" }], {
    duration: SLIDE_MS,
    easing: "linear",
    fill: "forwards",
  });
}

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("is-active", i === currentSlide));
  // El nombre de la práctica y sus preguntas acompañan a la imagen
  practiceNames.forEach((name, i) => (name.hidden = i !== currentSlide));
  chipGroups.forEach((group, i) => (group.hidden = i !== currentSlide));
  updateHeroLink();
  restartBar();
}

function startSlides() {
  if (reduceMotion) return restartBar();
  slideTimer = setInterval(() => showSlide(currentSlide + 1), SLIDE_MS);
  restartBar();
}

// Detiene el carrusel (y la barrita) cuando alguien consulta, para que al volver vea la misma práctica
function stopSlides() {
  clearInterval(slideTimer);
  slideTimer = null;
  restartBar();
}

// Preguntas del hero: cada una abre WhatsApp con la práctica y la pregunta ya escritas
const heroWa = document.getElementById("hero-wa");

chipGroups.forEach((group) => {
  const practice = group.dataset.practice;
  group.querySelectorAll(".chip").forEach((chip) => {
    chip.href = waLink(`Hola Damián, quería hacerte una consulta sobre ${practice}: ${chip.textContent.trim()}`);
    // Al volver de WhatsApp, la persona encuentra la misma práctica en pantalla
    chip.addEventListener("click", stopSlides);
  });
});

// Botón dorado "Otra consulta": consulta general sobre la práctica que se está mostrando
function updateHeroLink() {
  const practice = chipGroups[currentSlide].dataset.practice;
  heroWa.href = waLink(`Hola Damián, quería hacerte una consulta sobre ${practice}.`);
}

heroWa.addEventListener("click", stopSlides);

updateHeroLink();
startSlides();

// Formulario de contacto: arma el mensaje y abre WhatsApp
const form = document.getElementById("contact-form");
const formError = document.getElementById("form-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const nombre = data.get("nombre").trim();
  const telefono = data.get("telefono").trim();
  const tema = data.get("tema");
  const mensaje = data.get("mensaje").trim();

  if (!nombre || !mensaje) {
    formError.hidden = false;
    return;
  }
  formError.hidden = true;

  const lines = [
    `Hola Damián, soy ${nombre}.`,
    `Tema: ${tema}.`,
    "",
    mensaje,
  ];
  if (telefono) lines.push("", `Mi teléfono: ${telefono}`);

  window.open(waLink(lines.join("\n")), "_blank", "noopener");
});
