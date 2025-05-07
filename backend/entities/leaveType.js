const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveType',
  tableName: 'leave_type',
  columns: {
    leave_id: {
      primary: true,
      type: 'int',
    },
    leave_name: {
      type: 'varchar',
    },
    is_auto_approve: {
      type: 'tinyint',
    },
    max_days: {
      type: 'int',
    },
    is_rollover: {
      type: 'tinyint',
    },
  },
});
