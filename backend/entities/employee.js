const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Employee',
  tableName: 'employees',
  columns: {
    Emp_ID: {
      primary: true,
      type: 'int',
    },
    Emp_name: {
      type: 'varchar',
    },
    Role: {
      type: 'enum',
      enum: ['EMPLOYEE', 'MANAGER', 'HR', 'DIRECTOR'],
    },
    Manager_ID: {
      type: 'int',
      nullable: true,
    },
    is_active: {
      type: 'tinyint',
      default: 1,
    },
    password:{
      type: 'varchar'
    },
  },
});
