const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveRequest',
  tableName: 'leave_requests',
  columns: {
    req_id: {
      primary: true,
      type: 'integer',
      generated: true,
    },
    emp_id: {
      type: 'integer',
    },
    leave_id: {
      type: 'integer',
    },
    start_date: {
      type: 'date',
    },
    end_date: {
      type: 'date',
    },
    total_days: {
      type: 'integer',
    },
    reason: {
      type: 'text',
    },
    status: {
      type: 'enum',
      enum: ['pending', 'approved', 'rejected', 'auto_approved', 'cancelled'],
      enumName: 'leave_status_enum', // helpful for PostgreSQL schema
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    escalation_level: {
      type: 'integer',
    },
    current_approver_id: {
      type: 'integer',
      nullable: true,
    },
    approver_name: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    remarks: {
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    employee: {
      type: 'many-to-one',
      target: 'Employee',
      joinColumn: {
        name: 'emp_id',
        referencedColumnName: 'Emp_ID',
      },
    },
    leaveType: {
      type: 'many-to-one',
      target: 'LeaveType',
      joinColumn: {
        name: 'leave_id',
        referencedColumnName: 'leave_id',
      },
    },
  },
});
