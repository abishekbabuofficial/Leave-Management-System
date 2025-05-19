import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getLeaveTypeColor } from "../utils/helper";
import { useAuth } from "../context/AuthContext";

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [remarks, setRemarks] = useState({});
  const { user } = useAuth();

  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPendingRequests();
        setPendingRequests(data || []);
      } catch (error) {
        toast.error("Failed to load pending requests");
        console.error("Pending requests error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const filteredRequests = pendingRequests.filter((request) => {
    const matchesSearch =
      !searchQuery ||
      request.employee.Emp_name.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      !filterType ||
      request.leaveType.leave_name.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const handleRemarkChange = (requestId, value) => {
    setRemarks({
      ...remarks,
      [requestId]: value,
    });
  };

  const handleApprove = async (requestId) => {
    try {
      // const user = JSON.parse(localStorage.getItem("user")) || {};
      const approverId = user.emp_ID;
      console.log(approverId);
      
      const remark = remarks[requestId] || "";

      await api.approveLeave(requestId, approverId, "approved", remark);
      setPendingRequests(
        pendingRequests.filter((request) => request.req_id !== requestId)
      );
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error("Failed to approve request");
      console.error("Approve request error:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const approverId = user.emp_ID;
      const remark = remarks[requestId] || "";

      await api.approveLeave(requestId, approverId, "rejected", remark);
      setPendingRequests(
        pendingRequests.filter((request) => request.req_id !== requestId)
      );
      toast.success("Request rejected successfully");
    } catch (error) {
      toast.error("Failed to reject request");
      console.error("Reject request error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            Pending Leave Requests
          </h2>
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
        </div>
      </div>

      {/* Pending Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.req_id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.employee.Emp_name}
                    </h3>
                    {/* <p className="text-sm text-gray-600">
                      {request.position && ` - ${request.position}`}
                    </p> */}
                    <div className="mt-1 flex items-center">
                      <div
                        className={`${getLeaveTypeColor(
                          request.leaveType.leave_name
                        )} w-3 h-3 rounded-full mr-2`}
                      ></div>
                      <span className="text-sm">
                        {request.leaveType.leave_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(request.start_date).toLocaleDateString()} -{" "}
                      {new Date(request.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{request.total_days}</span>{" "}
                    {request.total_days === 1 ? "day" : "days"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Updated {new Date(request.updated_at).toLocaleDateString()}</span>{" "}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-10">
                <div><h4 className="text-sm font-medium text-gray-700">Reason:</h4>
                <p className="mt-1 text-sm text-gray-600">{request.reason}</p></div>
                {request.remarks && (<div><h4 className="text-sm font-medium text-gray-700">Remarks from previous approver:</h4>
                <p className="mt-1 text-sm text-gray-600">{request.remarks}</p></div>)}
                
              </div>

              <div className="mt-4 flex flex-wrap sm:justify-end space-x-3">
                <input
                  type="text"
                  placeholder="Enter remarks..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary mt-2 mb-2 w-full"
                  value={remarks[request.req_id] || ""}
                  onChange={(e) =>
                    handleRemarkChange(request.req_id, e.target.value)
                  }
                />
                <button
                  onClick={() => handleReject(request.req_id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(request.req_id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90"
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Approve
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No pending requests found</p>
            {(filterType || searchQuery) && (
              <p className="mt-2 text-sm">Try adjusting your filters</p>
            )}
            {!filterType && !searchQuery && (
              <p className="mt-2 text-sm">
                All leave requests have been processed
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
