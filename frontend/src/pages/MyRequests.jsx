import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "sonner";
import { Calendar, Filter, Search, FilePlus, XCircle } from "lucide-react";
import {
  getLeaveStatusColor,
  getLeaveTypeColor,
  getLeaveTypes,
} from "../utils/helper";

const MyRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setIsLoading(true);
        const data = await api.getLeaveHistory();
        setLeaveRequests(data || []);
      } catch (error) {
        toast.error("Failed to load leave requests");
        console.error("Leave requests error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Filter leave requests based on filters
  const filteredRequests = leaveRequests.filter((request) => {
    const matchesStatus =
      !filterStatus ||
      request.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType =
      !filterType ||
      getLeaveTypes(request.leave_id).toLowerCase() ===
        filterType.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(request.start_date).toLocaleDateString().includes(searchQuery) ||
      new Date(request.end_date).toLocaleDateString().includes(searchQuery);

    return matchesStatus && matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  };
  
  const handleCancel = async (req_id) => {
    try {
      await api.cancelLeave(req_id);
      toast.success('Leave request cancelled successfully');
      // Refresh the leave requests list
      // fetchLeaveRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel leave request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Leave Requests
          </h2>

          <button
            onClick={() => navigate("/apply-leave")}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            New Request
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Search requests..."
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
              <option value="cancelled">Cancelled</option>
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
              <option value="">All Types</option>
              <option value="casual leave">Casual Leave</option>
              <option value="sick leave">Sick Leave</option>
              <option value="floater leave">Floater Leave</option>
              <option value="lop leave">LOP Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
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
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Approver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.req_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`${getLeaveTypeColor(
                            getLeaveTypes(request.leave_id)
                          )} w-3 h-3 rounded-full mr-2`}
                        ></div>
                        <div className="text-sm font-medium text-gray-900">
                          {getLeaveTypes(request.leave_id)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">
                          {new Date(request.start_date).toLocaleDateString()} -{" "}
                          {new Date(request.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.total_days}{" "}
                      {request.total_days === 1 ? "day" : "days"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getLeaveStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td
                      title={request.reason}
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    >
                      <button
                      onClick={()=> handleCancel(request.req_id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-0.5 py-1 border border-gray-300 text-sm font-small rounded-md text-white bg-red-400 hover:bg-red-500"
                      >
                        <XCircle className="mr-1.5 h-4 w-4 text-white" />
                        Cancel
                      </button>
                    </td>
                    <td
                      title={request.reason}
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    >
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(request.updated_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {request.approver_name || "-"}
                    </td>

                    <td
                      title={request.remarks}
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                    >
                      {request.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No leave requests found</p>
            {(filterStatus || filterType || searchQuery) && (
              <p className="mt-2 text-sm">Try adjusting your filters</p>
            )}
            {!filterStatus && !filterType && !searchQuery && (
              <button
                onClick={() => navigate("/apply-leave")}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                <FilePlus className="mr-2 h-4 w-4" />
                Apply for Leave
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
