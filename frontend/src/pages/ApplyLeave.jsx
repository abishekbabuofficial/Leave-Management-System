import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "sonner";
import { Calendar as CalendarIcon, AlertTriangle } from "lucide-react";

const ApplyLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leave_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch leave balance
        const balanceData = await api.getLeaveBalance();
        setLeaveBalance(balanceData);

        // Fetch leave types
        const typesData = await api.getLeaveTypes();
        setLeaveTypes(typesData || []);
      } catch (error) {
        toast.error("Failed to load data");
        console.error("Data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(leaveTypes);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add emp_id from local storage or context
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const leaveData = {
        ...formData,
        leave_id: Number(formData.leave_id),
        emp_id: user.emp_ID, // Default to 1 if no user id is available
      };

      const response = await api.applyLeave(leaveData);
      toast.success("Leave application submitted successfully");
      navigate("/my-requests");
    } catch (error) {
      toast.error("Failed to submit leave application");
      console.error("Apply leave error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the number of days between two dates
  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    // Return 0 if end date is before start date
    if (endDate < startDate) return 0;

    // Calculate the difference in days
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    return diffDays;
  };

  // Get the type of leave selected
  const getSelectedLeaveType = () => {
    if (!formData.leave_id) return null;
    return leaveTypes.find((type) => type.leave_id === parseInt(formData.leave_id));
  };



  // Get remaining days for selected leave type
  const getRemainingDays = () => {
    if (!leaveBalance || !formData.leave_id) return null;

    const selectedLeaveBalance = leaveBalance.find(
            (balance) => balance.leave_type_id === parseInt(formData.leave_id)
          );
      
          if (!selectedLeaveBalance) return null;
          
          return selectedLeaveBalance.remaining;
  };

  // Check if selected days exceed available balance
  const isExceedingBalance = () => {
    const days = calculateDays();
    const remainingDays = getRemainingDays();

    if (remainingDays === null || days === 0) return false;
    return days > remainingDays;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Apply for Leave
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Leave Type Selection */}
            <div>
              <label
                htmlFor="leave_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Leave Type
              </label>
              <select
                id="leave_id"
                name="leave_id"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                value={formData.leave_id}
                onChange={handleChange}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type.leave_id} value={type.leave_id}>
                    {type.leave_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    min={
                      formData.start_date ||
                      new Date().toISOString().split("T")[0]
                    }
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Date Summary */}
            {formData.start_date && formData.end_date && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{calculateDays()} days</p>
                  </div>

                  {formData.leave_id && leaveBalance && (
                    <div>
                      <p className="text-sm text-gray-500">Available Balance</p>
                      <p className="font-medium">
                        {getRemainingDays() || 0} days
                      </p>
                    </div>
                  )}
                </div>

                {isExceedingBalance() && (
                  <div className="mt-2 flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Warning: Selected days exceed your available balance
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Reason Text Area */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for Leave
              </label>
              <textarea
                id="reason"
                name="reason"
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Please provide a detailed reason for your leave request..."
                value={formData.reason}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/my-requests")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExceedingBalance()}
              className={`px-4 py-2 bg-primary text-white rounded-md ${
                isSubmitting || isExceedingBalance()
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
