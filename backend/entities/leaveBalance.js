const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveBalance',
  tableName: 'leave_balance',
  columns: {
    balance_id: {
      primary: true,
      type: 'integer',
      generated: true,
    },
    emp_id: {
      type: 'integer',
    },
    leave_type_id: {
      type: 'integer',
    },
    year: {
      type: 'integer', 
    },
    total_allocated: {
      type: 'integer',
    },
    carried_forward: {
      type: 'integer',
      default: 0,
    },
    used: {
      type: 'integer',
      default: 0,
    },
    remaining: {
      type: 'integer',
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
