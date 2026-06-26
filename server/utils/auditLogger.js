const AuditLog = require('../models/AuditLog');

const logAction = async ({ workspace, user, action, resource, resourceId, resourceName, details, req, success = true, errorMessage }) => {
  try {
    await AuditLog.create({
      workspace,
      user,
      action,
      resource,
      resourceId,
      resourceName,
      details,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
      success,
      errorMessage,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAction };
