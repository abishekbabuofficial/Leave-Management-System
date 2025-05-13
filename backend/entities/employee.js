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
      enumName: "employee_role_enum", // Required in PostgreSQL
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
      nullable: true,
    },
  },
});
