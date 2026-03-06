const Invoice = require("../models/Invoice");

/**
 * Generate unique invoice number: INV-202603-0001
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const prefix = `INV-${year}${month}-`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  })
    .sort({ invoiceNumber: -1 })
    .lean();

  let nextNum = 1;
  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.split("-").pop(), 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

module.exports = { generateInvoiceNumber };
