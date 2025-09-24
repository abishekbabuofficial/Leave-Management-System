const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "AccrualPolicy",
  tableName: "accrual_policy",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    Role: {
      type: "enum",
      enum: ["EMPLOYEE", "MANAGER", "HR", "DIRECTOR"],
      enumName: "accrual_policy_role_enum",
    },
    leave_id: {
      type: "int",
    },
    total_days_year: {
      type: "numeric",
      default: 0,
    },
  },
  relations: {
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: { name: "leave_id" },
    },
  },
});
