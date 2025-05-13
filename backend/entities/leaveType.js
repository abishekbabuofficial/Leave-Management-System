const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveType',
  tableName: 'leave_type',
  columns: {
    leave_id: {
      primary: true,
      type: 'integer',
    },
    leave_name: {
      type: 'varchar',
    },
    is_auto_approve: {
      type: 'boolean',
    },
    max_days: {
      type: 'integer',
    },
    is_rollover: {
      type: 'boolean',
    },
  },
});
