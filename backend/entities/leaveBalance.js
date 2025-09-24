const { EntitySchema } = require("typeorm");
const employee = require("./employee");

module.exports = new EntitySchema({
  name: "LeaveBalance",
  tableName: "leave_balance",
  columns: {
    balance_id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    emp_id: {
      type: "integer",
      nullable: false,
    },
    leave_type_id: {
      type: "integer",
      nullable: false,
    },
    // year: {
    //   type: 'integer',
    // },
    total_allocated: {
      type: "numeric",
      nullable: true,
    },
    // carried_forward: {
    //   type: 'integer',
    //   default: 0,
    // },
    used: {
      type: "numeric",
      default: 0,
    },
    remaining: {
      type: "numeric",
      nullable: true,
    },
  },
  // uniques: [
  //   {
  //     name: 'unique_leave_year',
  //     columns: ['emp_id', 'leave_type_id', 'year'],
  //   },
  // ],
  relations: {
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: {
        name: "leave_type_id",
        referencedColumnName: "leave_id",
      },
      cascade: ["insert", "update"],
    },
    employee: {
      type: "many-to-one",
      target: "Employee",
      joinColumn: {
        name: "emp_id",
        referencedColumnName: "Emp_ID",
      },
      cascade: ["insert", "update"],
    },
  },
});
