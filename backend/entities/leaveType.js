const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "LeaveType",
  tableName: "leave_type",
  columns: {
    leave_id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    leave_name: {
      type: "varchar",
    },
    is_auto_approve: {
      type: "boolean",
    },
    max_days: {
      type: "integer",
    },
    is_rollover: {
      type: "boolean",
      default: false,
      nullable: true,
    },
  },
  relations: {
    balance: {
      target: "LeaveBalance",
      type: "one-to-many",
      inverseSide: "leaveType",
    },
    accrual: {
      target: "AccrualPolicy",
      type: "one-to-many",
      inverseSide: "leave_type",
    },
  },
});
