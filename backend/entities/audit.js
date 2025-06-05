const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Audit",
  tableName: "audit",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    emp_id: {
      type: "int",
    },
    req_id: {
      type: "int",
      nullable: false,
    },
    action: {
      type: "enum",
      enum: ['created', 'approved', 'rejected', 'cancelled', 'forwarded']
    },
    remarks: {
      type: "text",
    },
    timestamp: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    request: {
      type: "many-to-one",
      target: "LeaveRequest",
      joinColumn: { name: "req_id" },
    },
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: { name: "emp_id" },
    }
  },
});
