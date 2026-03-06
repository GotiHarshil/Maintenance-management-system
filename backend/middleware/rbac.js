// Check specific permissions from role
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({ message: "Forbidden: No role assigned" });
    }

    const userPermissions = req.user.roleId.permissions;
    const hasAll = requiredPermissions.every((p) =>
      userPermissions.includes(p)
    );

    if (!hasAll) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
        required: requiredPermissions,
      });
    }
    next();
  };
};

// Check role name directly
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({ message: "Forbidden: No role assigned" });
    }

    if (!allowedRoles.includes(req.user.roleId.name)) {
      return res.status(403).json({
        message: `Forbidden: Requires role ${allowedRoles.join(" or ")}`,
      });
    }
    next();
  };
};

module.exports = { checkPermission, checkRole };
