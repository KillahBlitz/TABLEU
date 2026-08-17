export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Forbidden: Administrator privileges required for this action'
  });
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      message: `Forbidden: Requires one of the following roles: ${roles.join(', ')}`
    });
  };
};
