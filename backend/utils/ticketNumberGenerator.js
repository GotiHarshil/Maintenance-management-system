const Ticket = require("../models/Ticket");

/**
 * Generate unique ticket number: TCK-2026-0001
 */
const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `TCK-${year}-`;

  const lastTicket = await Ticket.findOne({
    ticketNumber: { $regex: `^${prefix}` },
  })
    .sort({ ticketNumber: -1 })
    .lean();

  let nextNum = 1;
  if (lastTicket) {
    const lastNum = parseInt(lastTicket.ticketNumber.split("-").pop(), 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

module.exports = { generateTicketNumber };
