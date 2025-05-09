import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import { Search, Filter, Calendar } from "lucide-react";
import { getLeaveStatusColor, getLeaveTypeColor } from "../utils/helper";

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Generate months for filtering
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2023, i, 1);
    return {
      value: i.toString(),
      label: date.toLocaleString("default", { month: "long" }),
    };
  });

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setCurrentUser(user);

    const fetchApprovals = async () => {
      try {
        setIsLoading(true);
        // Get all leave requests from the system
        const allLeaveRequests = await api.getLeaveRequests();

        setApprovals(allLeaveRequests || []);
      } catch (error) {
        toast.error("Failed to load approvals");
        console.error("Approvals error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  console.log(approvals)

  // Filter approvals based on filters
  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      !searchQuery ||
      approval.employee?.Emp_name?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      approval.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      !filterStatus ||
      approval.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType =
      !filterType ||
      approval.leaveType?.leave_name?.toLowerCase() ===
        filterType.toLowerCase();

    // Filter by month if selected
    let matchesMonth = true;
    if (filterMonth !== "") {
      const month = new Date(approval.start_date).getMonth().toString();
      matchesMonth = month === filterMonth;
    }

    return matchesSearch && matchesStatus && matchesType && matchesMonth;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          My Approval History
        </h2>
        <p className="text-gray-600 mb-6">
          View all leave requests you have approved or rejected
        </p>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Search employee or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Leave Types</option>
              <option value="casual leave">Casual Leave</option>
              <option value="sick leave">Sick Leave</option>
              <option value="floater leave">Floater Leave</option>
              <option value="lop leave">LOP Leave</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredApprovals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApprovals.map((approval) => (
                  <tr key={approval.req_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {approval.employee?.Emp_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`${getLeaveTypeColor(
                            approval.leaveType?.leave_name
                          )} w-3 h-3 rounded-full mr-2`}
                        ></div>
                        <div className="text-sm text-gray-900">
                          {approval.leaveType?.leave_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(approval.start_date).toLocaleDateString()} -{" "}
                          {new Date(approval.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.total_days}{" "}
                      {approval.total_days === 1 ? "day" : "days"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getLeaveStatusColor(
                          approval.status
                        )}`}
                      >
                        {approval.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {currentUser?.name || currentUser?.username || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {approval.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No approval history found</p>
            {(filterStatus || filterType || filterMonth || searchQuery) && (
              <p className="mt-2 text-sm">Try adjusting your filters</p>
            )}
            {!filterStatus && !filterType && !filterMonth && !searchQuery && (
              <p className="mt-2 text-sm">
                You haven't approved or rejected any leave requests yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
