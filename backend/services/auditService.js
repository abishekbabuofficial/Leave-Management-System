const AppDataSource = require("../config/dataSource");
const Audit = require("../entities/audit");
const logger = require("../utils/logger");

const auditService = {
  createAuditEntry: async (auditData) => {
    try {
      const repo = AppDataSource.getRepository(Audit);
      const audit = repo.create(auditData);
      await repo.save(audit);
      logger.info(
        `Audit entry created for req_id: ${auditData.req_id}, action: ${auditData.action}`
      );
      return audit;
    } catch (error) {
      logger.error(`Error creating audit entry: ${error.message}`);
      throw error;
    }
  },

  // Get audit history for a specific leave request
  getAuditHistory: async (reqId) => {
    try {
      const repo = AppDataSource.getRepository(Audit);
      const auditHistory = await repo
        .createQueryBuilder("audit")
        .leftJoinAndSelect("audit.employee", "employee")
        .where("audit.req_id = :reqId", { reqId })
        .orderBy("audit.timestamp", "ASC")
        .select([
          "audit.id",
          "audit.req_id",
          "audit.action",
          "audit.remarks",
          "audit.timestamp",
          "employee.Emp_ID",
          "employee.Emp_name",
        ])
        .getMany();

      return auditHistory;
    } catch (error) {
      logger.error(
        `Error fetching audit history for req_id ${reqId}: ${error.message}`
      );
      throw error;
    }
  },

  // Get audit history for multiple leave requests
  getAuditHistoryForRequests: async (reqIds) => {
    try {
      const repo = AppDataSource.getRepository(Audit);
      const auditHistory = await repo
        .createQueryBuilder("audit")
        .leftJoinAndSelect("audit.employee", "employee")
        .where("audit.req_id IN (:...reqIds)", { reqIds })
        .orderBy("audit.req_id", "ASC")
        .addOrderBy("audit.timestamp", "ASC")
        .select([
          "audit.id",
          "audit.req_id",
          "audit.action",
          "audit.remarks",
          "audit.timestamp",
          "employee.Emp_ID",
          "employee.Emp_name",
        ])
        .getMany();

      // Group by req_id for easier consumption
      const groupedHistory = {};
      auditHistory.forEach((entry) => {
        if (!groupedHistory[entry.req_id]) {
          groupedHistory[entry.req_id] = [];
        }
        groupedHistory[entry.req_id].push(entry);
      });

      return groupedHistory;
    } catch (error) {
      logger.error(
        `Error fetching audit history for multiple requests: ${error.message}`
      );
      throw error;
    }
  },
};

module.exports = auditService;
