const whatsappButtons = document.querySelectorAll<HTMLButtonElement>("[data-whatsapp]");
const eventLogo = document.querySelector<HTMLImageElement>("#event-logo");
const logoFallback = document.querySelector<HTMLDivElement>("#logo-fallback");
const navButtons = document.querySelectorAll<HTMLButtonElement>(".nav-link[data-view]");
const panels = document.querySelectorAll<HTMLElement>(".view-panel");

const whatsappUrl = "https://wa.me/573005023496";

const openWhatsapp = () => {
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

whatsappButtons.forEach((button) => {
  button.addEventListener("click", openWhatsapp);
});

const setActiveView = (viewId: string) => {
  const targetView = Array.from(panels).some((panel) => panel.id === viewId) ? viewId : "inicio";

  panels.forEach((panel) => {
    panel.classList.toggle("view-panel-active", panel.id === targetView);
    if (panel.id === targetView) {
      panel.scrollTop = 0;
    }
  });

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === targetView);
  });

  history.replaceState(null, "", `#${targetView}`);
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextView = button.dataset.view;
    if (!nextView) {
      return;
    }

    setActiveView(nextView);
  });
});

const initialHash = window.location.hash.replace("#", "");
const initialView = initialHash || "inicio";
setActiveView(initialView);

if (eventLogo && logoFallback) {
  eventLogo.addEventListener("error", () => {
    eventLogo.hidden = true;
    logoFallback.hidden = false;
  });
}
