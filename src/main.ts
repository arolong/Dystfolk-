const eventLogo = document.querySelector<HTMLImageElement>("#event-logo");
const logoFallback = document.querySelector<HTMLDivElement>("#logo-fallback");
const navButtons = document.querySelectorAll<HTMLButtonElement>(".nav-link[data-view]");
const panels = document.querySelectorAll<HTMLElement>(".view-panel");
const addTicketButtons = document.querySelectorAll<HTMLButtonElement>("[data-add-ticket]");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-button");
const clearCartButton = document.querySelector<HTMLButtonElement>("#clear-cart");
const cartItem = document.querySelector<HTMLElement>("#cart-item");
const cartEmpty = document.querySelector<HTMLElement>("#cart-empty");
const cartTicketName = document.querySelector<HTMLElement>("#cart-ticket-name");
const cartTicketNote = document.querySelector<HTMLElement>("#cart-ticket-note");
const cartPrice = document.querySelector<HTMLElement>("#cart-price");
const cartCount = document.querySelector<HTMLElement>("#cart-count");
const cartActions = document.querySelector<HTMLElement>("#cart-actions");

const whatsappUrl = "https://wa.me/573005023496";
const eventName = "Dystfolk Evento";

type TicketType = "preventa" | "general";

type CartSelection = {
  type: TicketType;
  label: string;
  price: number;
};

let selectedTicket: CartSelection | null = null;

const formatCop = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const buildWhatsappMessage = (ticket: CartSelection) => {
  if (ticket.type === "preventa") {
    return `Hola, quiero adquirir una preventa para el ${eventName}.`;
  }

  return `Hola, quiero adquirir una boleta general para el ${eventName}.`;
};

const renderCart = () => {
  const hasSelection = Boolean(selectedTicket);

  if (!cartItem || !cartEmpty || !checkoutButton || !cartTicketName || !cartTicketNote || !cartPrice || !cartActions) {
    return;
  }

  if (cartCount) {
    cartCount.textContent = hasSelection ? "1" : "0";
  }

  cartItem.hidden = !hasSelection;
  cartEmpty.hidden = hasSelection;
  cartActions.hidden = !hasSelection;
  checkoutButton.disabled = !hasSelection;

  if (!selectedTicket) {
    return;
  }

  cartTicketName.textContent = selectedTicket.label;
  cartPrice.textContent = formatCop(selectedTicket.price);
  cartTicketNote.textContent =
    selectedTicket.type === "preventa"
      ? "Compra de boleta preventa."
      : "Compra de boleta general.";
};

const openWhatsappCheckout = () => {
  if (!selectedTicket) {
    return;
  }

  const message = buildWhatsappMessage(selectedTicket);
  const checkoutUrl = `${whatsappUrl}?text=${encodeURIComponent(message)}`;
  window.open(checkoutUrl, "_blank", "noopener,noreferrer");
};

addTicketButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.addTicket;
    const price = Number(button.dataset.price || 0);

    if (type !== "preventa" && type !== "general") {
      return;
    }

    selectedTicket = {
      type,
      label: type === "preventa" ? "Boleta Preventa" : "Boleta General",
      price,
    };

    renderCart();
    setActiveView("carrito");
  });
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
renderCart();

if (checkoutButton) {
  checkoutButton.addEventListener("click", openWhatsappCheckout);
}

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    selectedTicket = null;
    renderCart();
  });
}

if (eventLogo && logoFallback) {
  eventLogo.addEventListener("error", () => {
    eventLogo.hidden = true;
    logoFallback.hidden = false;
  });
}
