const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBool = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

exports.handler = async () => {
  const preventaPrice = toInt(process.env.PREVENTA_PRICE, 15000);
  const preventaStock = toInt(process.env.PREVENTA_STOCK, 25);
  const preventaActive = toBool(process.env.PREVENTA_ACTIVE, true);

  const generalPrice = toInt(process.env.GENERAL_PRICE, 20000);
  const generalStock = toInt(process.env.GENERAL_STOCK, 300);
  const generalActive = toBool(process.env.GENERAL_ACTIVE, true);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      tickets: {
        preventa: {
          label: "Boleta Preventa",
          price: preventaPrice,
          stock: preventaStock,
          active: preventaActive,
        },
        general: {
          label: "Boleta General",
          price: generalPrice,
          stock: generalStock,
          active: generalActive,
        },
      },
    }),
  };
};
