const cron = require("node-cron");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");

// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  try {
    const now = new Date();

    // 1. Find tickets that just breached SLA
    const breached = await Ticket.find({
      slaBreached: false,
      slaDeadline: { $lte: now },
      status: { $nin: ["CLOSED", "PAID", "VERIFIED", "BILLED", "WORK_COMPLETED"] },
      isDeleted: false,
    });

    for (const ticket of breached) {
      ticket.slaBreached = true;
      await ticket.save();

      // Notify admin / reviewer
      const notifyUserId = ticket.reviewedBy || ticket.createdBy;
      await Notification.create({
        userId: notifyUserId,
        ticketId: ticket._id,
        type: "SLA_BREACHED",
        message: `SLA BREACHED: Ticket ${ticket.ticketNumber} has exceeded its deadline`,
      });

      // Also notify assigned technician if exists
      if (ticket.assignedTo) {
        await Notification.create({
          userId: ticket.assignedTo,
          ticketId: ticket._id,
          type: "SLA_BREACHED",
          message: `SLA BREACHED: Ticket ${ticket.ticketNumber} assigned to you has exceeded its deadline`,
        });
      }
    }

    // 2. Warn tickets approaching SLA (within 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const approaching = await Ticket.find({
      slaBreached: false,
      slaDeadline: { $lte: twoHoursFromNow, $gt: now },
      status: { $nin: ["CLOSED", "PAID", "VERIFIED", "BILLED", "WORK_COMPLETED"] },
      isDeleted: false,
    });

    for (const ticket of approaching) {
      if (ticket.assignedTo) {
        await Notification.create({
          userId: ticket.assignedTo,
          ticketId: ticket._id,
          type: "SLA_WARNING",
          message: `SLA WARNING: Ticket ${ticket.ticketNumber} deadline is within 2 hours`,
        });
      }
    }

    if (breached.length || approaching.length) {
      console.log(
        `[SLA Checker] ${breached.length} breached, ${approaching.length} warnings at ${now.toISOString()}`
      );
    }
  } catch (error) {
    console.error("[SLA Checker] Error:", error.message);
  }
});

console.log("SLA Checker cron job initialized (runs every 15 minutes)");
