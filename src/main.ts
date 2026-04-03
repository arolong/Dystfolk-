const eventLogo = document.querySelector<HTMLImageElement>("#event-logo");
const logoFallback = document.querySelector<HTMLDivElement>("#logo-fallback");
const navButtons = document.querySelectorAll<HTMLButtonElement>(".nav-link[data-view]");
const panels = document.querySelectorAll<HTMLElement>(".view-panel");
const addTicketButtons = document.querySelectorAll<HTMLButtonElement>("[data-add-ticket]");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-button");
const clearCartButton = document.querySelector<HTMLButtonElement>("#clear-cart");
const cartEmpty = document.querySelector<HTMLElement>("#cart-empty");
const cartList = document.querySelector<HTMLElement>("#cart-list");
const cartSummary = document.querySelector<HTMLElement>("#cart-summary");
const cartTotal = document.querySelector<HTMLElement>("#cart-total");
const cartCount = document.querySelector<HTMLElement>("#cart-count");
const cartActions = document.querySelector<HTMLElement>("#cart-actions");
const quantityButtons = document.querySelectorAll<HTMLButtonElement>("[data-quantity-change]");
const quantityValues = document.querySelectorAll<HTMLElement>("[data-ticket-quantity]");
const artistPhotos = document.querySelectorAll<HTMLImageElement>(".artist-photo");
const achievementModal = document.querySelector<HTMLElement>("#achievement-modal");
const achievementContinueButton = document.querySelector<HTMLButtonElement>("#achievement-continue");
const achievementCloseButton = document.querySelector<HTMLButtonElement>("#achievement-close");
const achievementTag = document.querySelector<HTMLElement>("#achievement-tag");
const achievementTitle = document.querySelector<HTMLElement>("#achievement-title");
const achievementCopy = document.querySelector<HTMLElement>("#achievement-copy");
const preventaPriceNode = document.querySelector<HTMLElement>("#price-preventa");
const generalPriceNode = document.querySelector<HTMLElement>("#price-general");
const preventaStockNote = document.querySelector<HTMLElement>("#preventa-stock-note");
const addPreventaButton = document.querySelector<HTMLButtonElement>("#add-preventa-ticket");

const whatsappUrl = "https://wa.me/573005169934";
const eventName = "Dystfolk presenta";
let pendingCheckoutUrl = "";
const backendEnabled = import.meta.env.VITE_BACKEND_ENABLED === "true";
const backendConfigUrl = import.meta.env.VITE_BACKEND_CONFIG_URL || "/api/config";

type CheckoutGateState = "achievement";

type TicketType = "preventa" | "general";

type TicketInfo = {
  label: string;
  price: number;
};

type CartSelection = {
  type: TicketType;
  label: string;
  price: number;
  quantity: number;
};

type BackendTicketConfig = {
  label: string;
  price: number;
  stock: number;
  active: boolean;
};

type BackendConfigResponse = {
  tickets: Record<TicketType, BackendTicketConfig>;
};

const ticketInfo: Record<TicketType, TicketInfo> = {
  preventa: {
    label: "Boleta Preventa",
    price: 15000,
  },
  general: {
    label: "Boleta General",
    price: 20000,
  },
};

const draftQuantities: Record<TicketType, number> = {
  preventa: 1,
  general: 1,
};

const cartSelections: Record<TicketType, CartSelection> = {
  preventa: {
    type: "preventa",
    label: ticketInfo.preventa.label,
    price: ticketInfo.preventa.price,
    quantity: 0,
  },
  general: {
    type: "general",
    label: ticketInfo.general.label,
    price: ticketInfo.general.price,
    quantity: 0,
  },
};

const formatCop = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const applyTicketConfig = (config: BackendConfigResponse) => {
  ticketInfo.preventa.label = config.tickets.preventa.label;
  ticketInfo.preventa.price = config.tickets.preventa.price;
  ticketInfo.general.label = config.tickets.general.label;
  ticketInfo.general.price = config.tickets.general.price;

  if (preventaPriceNode) {
    preventaPriceNode.textContent = `${formatCop(config.tickets.preventa.price)} COP`;
  }

  if (generalPriceNode) {
    generalPriceNode.textContent = `${formatCop(config.tickets.general.price)} COP`;
  }

  if (addPreventaButton) {
    addPreventaButton.dataset.price = config.tickets.preventa.price.toString();

    const preventaDisponible = config.tickets.preventa.active && config.tickets.preventa.stock > 0;
    addPreventaButton.disabled = !preventaDisponible;
    addPreventaButton.textContent = preventaDisponible ? "Agregar al carrito" : "Preventa agotada";
  }

  if (preventaStockNote) {
    preventaStockNote.textContent = config.tickets.preventa.active
      ? `Stock preventa disponible: ${config.tickets.preventa.stock}`
      : "Preventa desactivada";
  }
};

const loadBackendConfig = async () => {
  if (!backendEnabled) {
    return;
  }

  try {
    const response = await fetch(backendConfigUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Config request failed: ${response.status}`);
    }

    const config = (await response.json()) as BackendConfigResponse;
    applyTicketConfig(config);
  } catch (error) {
    console.warn("Backend config unavailable. Using frontend defaults.", error);
  }
};

const buildWhatsappMessage = (tickets: CartSelection[]) => {
  if (tickets.length === 0) {
    return "Hola, quiero adquirir boletas para el Dystrap";
  }

  if (tickets.length === 1 && tickets[0].type === "preventa") {
    return "Hola, quiero adquirir una preventa para el Dystrap";
  }

  const describeTicket = (ticket: CartSelection) => {
    if (ticket.type === "preventa") {
      return ticket.quantity === 1 ? "1 preventa" : `${ticket.quantity} preventas`;
    }

    return ticket.quantity === 1 ? "1 boleta general" : `${ticket.quantity} boletas generales`;
  };

  const parts = tickets.map((ticket) => {
    const quantityText = describeTicket(ticket);

    if (ticket.type === "preventa") {
      return `${quantityText} para el Dystrap`;
    }

    return `${quantityText} para el ${eventName}`;
  });

  return `Hola, quiero adquirir ${parts.join(" y ")}.`;
};

const getCartItems = () =>
  Object.values(cartSelections).filter((ticket) => ticket.quantity > 0);

const renderCart = () => {
  const items = getCartItems();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!cartEmpty || !checkoutButton || !cartActions || !cartList || !cartSummary || !cartTotal) {
    return;
  }

  if (cartCount) {
    cartCount.textContent = totalQuantity.toString();
  }

  cartList.innerHTML = "";
  cartList.hidden = items.length === 0;
  cartSummary.hidden = items.length === 0;
  cartEmpty.hidden = items.length > 0;
  cartActions.hidden = items.length === 0;
  checkoutButton.disabled = items.length === 0;

  if (items.length === 0) {
    cartTotal.textContent = formatCop(0);
    return;
  }

  items.forEach((item) => {
    const cartRow = document.createElement("article");
    cartRow.className = "cart-item";

    const content = document.createElement("div");
    content.className = "cart-item-meta";

    const label = document.createElement("p");
    label.className = "cart-label";
    label.textContent = item.type === "preventa" ? "Preventa" : "General";

    const name = document.createElement("h3");
    name.textContent = item.label;

    const note = document.createElement("p");
    note.className = "ticket-copy";
    note.textContent = `${item.quantity} unidad${item.quantity === 1 ? "" : "es"} seleccionada${item.quantity === 1 ? "" : "s"}.`;

    const qty = document.createElement("p");
    qty.className = "cart-item-qty";
    qty.textContent = `Cantidad: ${item.quantity}`;

    content.append(label, name, note, qty);

    const price = document.createElement("strong");
    price.textContent = formatCop(item.price * item.quantity);

    cartRow.append(content, price);
    cartList.append(cartRow);
  });

  cartTotal.textContent = formatCop(totalPrice);
};

const openWhatsappCheckout = async () => {
  const items = getCartItems();

  if (items.length === 0) {
    return;
  }

  const message = buildWhatsappMessage(items);
  const checkoutUrl = `${whatsappUrl}?text=${encodeURIComponent(message)}`;

  pendingCheckoutUrl = checkoutUrl;
  showCheckoutGateModal("achievement");
};

const showCheckoutGateModal = (state: CheckoutGateState) => {
  if (!achievementModal || !achievementTag || !achievementTitle || !achievementCopy || !achievementCloseButton || !achievementContinueButton) {
    return;
  }

  achievementTag.textContent = "Logro";
  achievementTitle.textContent = "Progreso completado";
  achievementCopy.textContent = "Es hora de finalizar con tu compra";
  achievementCloseButton.textContent = "Cerrar";
  achievementContinueButton.hidden = false;

  achievementModal.hidden = false;
};

const continueCheckout = () => {
  if (!pendingCheckoutUrl) {
    return;
  }

  window.open(pendingCheckoutUrl, "_blank", "noopener,noreferrer");
  pendingCheckoutUrl = "";
};

const closeAchievementModal = () => {
  if (!achievementModal) {
    return;
  }

  achievementModal.hidden = true;
};

const renderDraftQuantities = () => {
  quantityValues.forEach((value) => {
    const type = value.dataset.ticketQuantity;

    if (type !== "preventa") {
      return;
    }

    value.textContent = draftQuantities.preventa.toString();
  });
};

quantityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.quantityChange;
    const step = Number(button.dataset.quantityStep || 0);

    if (type !== "preventa") {
      return;
    }

    const nextQuantity = draftQuantities.preventa + step;
    draftQuantities.preventa = Math.max(1, nextQuantity);
    renderDraftQuantities();
  });
});

addTicketButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.addTicket;

    if (type !== "preventa" && type !== "general") {
      return;
    }

    const quantityToAdd = type === "preventa" ? draftQuantities.preventa : 1;

    cartSelections[type].quantity += quantityToAdd;

    cartSelections[type] = {
      type,
      label: ticketInfo[type].label,
      price: Number(button.dataset.price || ticketInfo[type].price),
      quantity: cartSelections[type].quantity,
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
renderDraftQuantities();
renderCart();
void loadBackendConfig();

if (checkoutButton) {
  checkoutButton.addEventListener("click", openWhatsappCheckout);
}

if (achievementContinueButton) {
  achievementContinueButton.addEventListener("click", () => {
    continueCheckout();
    closeAchievementModal();
  });
}

if (achievementCloseButton) {
  achievementCloseButton.addEventListener("click", closeAchievementModal);
}

if (achievementModal) {
  achievementModal.addEventListener("click", (event) => {
    if (event.target === achievementModal) {
      closeAchievementModal();
    }
  });
}

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    cartSelections.preventa.quantity = 0;
    cartSelections.general.quantity = 0;
    renderCart();
  });
}

if (eventLogo && logoFallback) {
  eventLogo.addEventListener("error", () => {
    eventLogo.hidden = true;
    logoFallback.hidden = false;
  });
}

artistPhotos.forEach((photo) => {
  photo.addEventListener("error", () => {
    photo.hidden = true;
    const artistMedia = photo.closest<HTMLElement>(".artist-media");
    if (artistMedia) {
      artistMedia.classList.add("artist-media-missing");
    }
  });
});
