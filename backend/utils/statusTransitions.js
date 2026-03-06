// Define which statuses each status can transition TO
const ALLOWED_TRANSITIONS = {
  CREATED:              ["REVIEWED", "CLOSED"],
  REVIEWED:             ["ASSIGNED", "CLOSED"],
  ASSIGNED:             ["ACCEPTED", "REVIEWED"],
  ACCEPTED:             ["ESTIMATION_SUBMITTED"],
  ESTIMATION_SUBMITTED: ["ESTIMATION_APPROVED", "ACCEPTED"],
  ESTIMATION_APPROVED:  ["IN_PROGRESS"],
  IN_PROGRESS:          ["ON_HOLD", "WORK_COMPLETED"],
  ON_HOLD:              ["IN_PROGRESS"],
  WORK_COMPLETED:       ["VERIFIED", "DISPUTED"],
  VERIFIED:             ["BILLED"],
  DISPUTED:             ["IN_PROGRESS", "CLOSED"],
  BILLED:               ["PAID"],
  PAID:                 ["CLOSED"],
  CLOSED:               [], // Terminal state — no further transitions
};

// Define which roles can SET each target status
const TRANSITION_ROLES = {
  REVIEWED:             ["ADMIN"],
  ASSIGNED:             ["ADMIN"],
  ACCEPTED:             ["TECHNICIAN"],
  ESTIMATION_SUBMITTED: ["TECHNICIAN"],
  ESTIMATION_APPROVED:  ["USER", "ADMIN"],
  IN_PROGRESS:          ["TECHNICIAN"],
  ON_HOLD:              ["TECHNICIAN", "ADMIN"],
  WORK_COMPLETED:       ["TECHNICIAN"],
  VERIFIED:             ["USER", "ADMIN"],
  DISPUTED:             ["USER"],
  BILLED:               ["ADMIN", "FINANCE"],
  PAID:                 ["FINANCE"],
  CLOSED:               ["ADMIN"],
};

/**
 * Check if transition from currentStatus to newStatus is valid
 */
const isValidTransition = (currentStatus, newStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed && allowed.includes(newStatus);
};

/**
 * Check if a user role is allowed to set the target status
 */
const canUserTransition = (newStatus, userRole) => {
  const allowedRoles = TRANSITION_ROLES[newStatus];
  return allowedRoles && allowedRoles.includes(userRole);
};

/**
 * Get all available transitions for a user based on current status and role
 */
const getAvailableTransitions = (currentStatus, userRole) => {
  const possibleNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  return possibleNext.filter((status) => {
    const roles = TRANSITION_ROLES[status] || [];
    return roles.includes(userRole);
  });
};

module.exports = {
  isValidTransition,
  canUserTransition,
  getAvailableTransitions,
  ALLOWED_TRANSITIONS,
  TRANSITION_ROLES,
};
