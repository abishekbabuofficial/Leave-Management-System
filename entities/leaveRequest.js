const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeaveRequest',
  tableName: 'leave_requests',
  columns: {
    req_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    emp_id: {
      type: 'int',
    },
    leave_id: {
      type: 'int',
    },
    start_date: {
      type: 'date',
    },
    end_date: {
      type: 'date',
    },
    // total_days is a generated column
    total_days: {
      type: 'int',
    },
    reason: {
      type: 'text',
    },
    status: {
      type: 'enum',
      enum: ['pending', 'approved', 'rejected', 'auto_approved', 'cancelled'],
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
      type: 'int',
    },
    current_approver_id: {
      type: 'int',
      nullable: true,
    },
    remarks: {
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    employee: {
      type: "many-to-one",
      target: "Employee", 
      joinColumn: {
        name: "emp_id",
        referencedColumnName: "Emp_ID", 
      },
    },
    leaveType: {
      type: "many-to-one",
      target: "LeaveType",
      joinColumn: {
        name: "leave_id",
        referencedColumnName: "leave_id",
      },
    }
  },
});
