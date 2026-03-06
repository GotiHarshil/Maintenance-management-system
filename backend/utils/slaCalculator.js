const SLA_HOURS = {
  LOW: parseInt(process.env.SLA_LOW) || 72,
  MEDIUM: parseInt(process.env.SLA_MEDIUM) || 48,
  HIGH: parseInt(process.env.SLA_HIGH) || 24,
  EMERGENCY: parseInt(process.env.SLA_EMERGENCY) || 4,
};

/**
 * Calculate SLA deadline based on priority
 */
const calculateSLADeadline = (priority, createdAt = new Date()) => {
  const hours = SLA_HOURS[priority] || 48;
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

/**
 * Check if SLA has been breached
 */
const isSLABreached = (slaDeadline) => {
  return new Date() > new Date(slaDeadline);
};

/**
 * Get remaining hours until SLA deadline
 */
const getSLARemainingHours = (slaDeadline) => {
  const diff = new Date(slaDeadline) - new Date();
  return Math.max(0, Math.round((diff / (1000 * 60 * 60)) * 10) / 10);
};

module.exports = { calculateSLADeadline, isSLABreached, getSLARemainingHours, SLA_HOURS };
