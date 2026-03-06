// SLA configuration defaults (hours)
const SLA_CONFIG = {
  LOW: parseInt(process.env.SLA_LOW) || 72,
  MEDIUM: parseInt(process.env.SLA_MEDIUM) || 48,
  HIGH: parseInt(process.env.SLA_HIGH) || 24,
  EMERGENCY: parseInt(process.env.SLA_EMERGENCY) || 4,
};

module.exports = SLA_CONFIG;
