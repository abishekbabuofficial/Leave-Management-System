const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveBalance',
  tableName: 'leave_balance',
  columns: {
    balance_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    emp_id: {
      type: 'int',
    },
    leave_type_id: {
      type: 'int',
    },
    year: {
      type: 'year',
    },
    total_allocated: {
      type: 'int',
    },
    carried_forward: {
      type: 'int',
      default: 0,
    },
    used: {
      type: 'int',
      default: 0,
    },
    remaining: {
      type: 'int',
    },
  },
  uniques: [
    {
      name: 'unique_leave_year',
      columns: ['emp_id', 'leave_type_id', 'year'],
    },
  ],
  relations: {
    leaveType: {
      type: "many-to-one",
      target: "LeaveType", 
      joinColumn: {
        name: "leave_type_id",
        referencedColumnName: "leave_id", 
      },
    },
  },
});
