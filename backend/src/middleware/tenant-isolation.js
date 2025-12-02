const { queryInTenantSchema } = require('../config/database');
const { isValidTenant } = require('../config/tenants');

function ensureTenantIsolation(req, res, next) {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({ error: 'Tenant context required' });
  }

  const tenantId = req.user.tenantId;

  if (!isValidTenant(tenantId)) {
    return res.status(403).json({ error: 'Invalid tenant' });
  }

  req.tenantId = tenantId;
  req.queryInTenant = (query, params) => queryInTenantSchema(tenantId, query, params);

  next();
}

async function executeInTenant(tenantId, query, params = []) {
  if (!isValidTenant(tenantId)) {
    throw new Error(`Invalid tenant: ${tenantId}`);
  }
  return queryInTenantSchema(tenantId, query, params);
}

module.exports = {
  ensureTenantIsolation,
  executeInTenant,
};

