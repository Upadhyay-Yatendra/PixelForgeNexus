export const authorize =
  (roles = []) =>
  (req, res, next) => {
    roles = Array.isArray(roles) ? roles : [roles];
    if (!roles.length || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
