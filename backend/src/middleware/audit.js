const pool = require('../config/database');

const auditLog = (action, tableName = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      if (res.statusCode < 400) { // Only log successful operations
        const auditData = {
          user_id: req.user ? req.user.id : null,
          action: action,
          table_name: tableName,
          record_id: req.params.id || null,
          old_values: req.oldValues || null,
          new_values: req.body || null,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        };

        pool.query(
          'INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            auditData.user_id,
            auditData.action,
            auditData.table_name,
            auditData.record_id,
            JSON.stringify(auditData.old_values),
            JSON.stringify(auditData.new_values),
            auditData.ip_address,
            auditData.user_agent
          ]
        ).catch(err => console.error('Audit log error:', err));
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { auditLog };
