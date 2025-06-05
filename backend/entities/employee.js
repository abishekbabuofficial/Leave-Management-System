const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Employee",
  tableName: "employees",
  columns: {
    Emp_ID: {
      primary: true,
      type: "integer",
    },
    Emp_name: {
      type: "varchar",
    },
    Role: {
      type: "enum",
      enum: ["EMPLOYEE", "MANAGER", "HR", "DIRECTOR"],
      enumName: "employee_role_enum",
    },
    Manager_ID: {
      type: "integer",
      nullable: true,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    password: {
      type: "varchar",
      default: null,
      nullable: true,
    },
  },
  relations: {
    manager: {
      target: "Employee",
      type: "many-to-one",
      joinColumn: {
        name: "Manager_ID",
        referencedColumnName: "Emp_ID",
      },
    },
    leaveRequests: {
      target: "LeaveRequest",
      type: "one-to-many",
      inverseSide: "employee"
    },
    audit:{
      target: "Audit",
      type: "one-to-many",
      inverseSide:"employee"
    }
  }
});
