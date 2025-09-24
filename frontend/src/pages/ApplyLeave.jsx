import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "sonner";
import { Calendar as CalendarIcon, AlertTriangle, Info } from "lucide-react";
import {
  calculateTotaldays,
  isHoliday,
  isFloaterHoliday,
} from "../utils/helper";
import { useAuth } from "../context/AuthContext";
import FloaterHolidaysModal from "../components/FloaterHolidaysModal";

const ApplyLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState({
    count: 0,
    totalCount: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFloaterModal, setShowFloaterModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userDetails = user;

  const [formData, setFormData] = useState({
    leave_id: "",
    start_date: new Date().toISOString().split("T")[0] || "",
    end_date: "",
    reason: "",
    leave_type: "full",
    start_shift: null,
    end_shift: null,
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
  
  // Calculate days whenever start_date, end_date, leave_type, or shifts change
  useEffect(() => {
    const calculateDaysAsync = async () => {
      if (formData.start_date && formData.end_date) {
        setIsCalculating(true);
        try {
          const result = await calculateTotaldays(
            formData.start_date,
            formData.end_date,
            formData.leave_type,
            formData.start_shift,
            formData.end_shift,
            formData.leave_id === "3"
          );
          setCalculatedDays(result);
        } catch (error) {
          console.error("Error calculating days:", error);
          setCalculatedDays({ count: 0, totalCount: 0 });
        } finally {
          setIsCalculating(false);
        }
      } else {
        setCalculatedDays({ count: 0, totalCount: 0 });
      }
    };

    calculateDaysAsync();
  }, [
    formData.start_date,
    formData.end_date,
    formData.leave_type,
    formData.start_shift,
    formData.end_shift,
  ]);

  // direct click on weekend or holiday and prevent submission
  const handleDateChange = async (e) => {
    const { name, value } = e.target;
    const date = new Date(value).toISOString().split("T")[0];
    const day = new Date(value).getDay();

    // Check if floater leave is selected
    const isFloaterLeave = formData.leave_id === "3";
    if (day === 0 || day === 6) {
      toast.error("Weekends are not allowed to select");
      return;
    }
    if (isFloaterLeave) {
      try {
        const isFloaterHolidayDate = await isFloaterHoliday(date);
        if (!isFloaterHolidayDate) {
          toast.error(
            "For floater leave, only floater holidays can be selected"
          );
          return;
        }
      } catch (error) {
        console.error("Error checking floater holiday:", error);
        toast.error("Error validating date selection");
        return;
      }
    } else {
      // Check if the date is a holiday using the API
      try {
        const isHolidayDate = await isHoliday(date);
        if (isHolidayDate) {
          toast.error("Holidays are not allowed to select");
          return;
        }
      } catch (error) {
        console.error("Error checking holiday:", error);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // to handle changes for other fields except start_date
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If leave type changes, reset shift selections
    if (name === "leave_type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        start_shift: null,
        end_shift: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    // Validate custom leave type selections
    if (formData.leave_type === "custom") {
      if (formData.start_date === formData.end_date) {
        if (!formData.start_shift) {
          toast.error("Please select a shift for your half-day leave");
          return;
        }
      } else {
        if (!formData.start_shift && !formData.end_shift) {
          toast.error(
            "For custom leave, please select at least one half-day shift or change to full day leave"
          );
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const user = userDetails || {};
      const leaveData = {
        ...formData,
        leave_id: Number(formData.leave_id),
        emp_id: user.emp_ID,
        total_days: calculateDays(), 

        ...(formData.leave_type === "custom" && {
          start_shift: formData.start_shift,
          end_shift: formData.end_shift,
        }),
      };

      const response = await api.applyLeave(leaveData);
      toast.success("Leave application submitted successfully");
      navigate("/my-requests");
    } catch (error) {
      toast.error(error.error || "Failed to submit leave application");
      console.error("Apply leave error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get calculated days from state
  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    return calculatedDays.count || 0;
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

  // Check for leave Balance
  const isExceedingBalance = () => {
    if (formData.leave_id !== "4") {
      const days = calculateDays();
      const remainingDays = getRemainingDays();

      if (remainingDays === null || days === 0) return false;
      return days > remainingDays;
    }
  };

  // Check if custom leave selection is invalid
  const isCustomLeaveInvalid = () => {
    if (
      formData.leave_type === "custom" &&
      formData.start_date &&
      formData.end_date
    ) {
      if (formData.start_date === formData.end_date) {
        return !formData.start_shift;
      } else {
        return !formData.start_shift && !formData.end_shift;
      }
    }
    return false;
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
                {leaveTypes.map((type) => {
                  // Find the balance for this leave type
                  const balance = leaveBalance?.find(
                    (bal) => bal.leave_type_id === type.leave_id
                  );
                  const remaining = balance ? balance.remaining : 0;

                  return (
                    <option key={type.leave_id} value={type.leave_id}>
                      {type.leave_name}
                    </option>
                  );
                })}
              </select>
              {/* Leave Balance showcard */}
              {formData.leave_id && (
                <div className="mt-1 text-xs text-green-600 italic">
                  {(() => {
                    const selectedBalance = leaveBalance?.find(
                      (bal) => bal.leave_type_id === parseInt(formData.leave_id)
                    );
                    const remaining = selectedBalance
                      ? selectedBalance.remaining
                      : 0;
                    return remaining > 0 ? (
                      `${remaining} days available`
                    ) : (
                      <span className="mt-1 text-xs text-red-600 italic">
                        No days available
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* Floater Holidays Button */}
              {formData.leave_id === "3" && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowFloaterModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    View Available Floater Holidays
                  </button>
                </div>
              )}
            </div>

            {/* Leave Duration Type Selection */}
            {formData.leave_id && formData.leave_id !== "3" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Duration
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="leave_type"
                      value="full"
                      checked={formData.leave_type === "full"}
                      onChange={handleChange}
                      className="mr-2 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Full Day</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="leave_type"
                      value="custom"
                      checked={formData.leave_type === "custom"}
                      onChange={handleChange}
                      className="mr-2 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Custom (Half Day Options)
                    </span>
                  </label>
                </div>

                {/* Floater Leave Info */}
                {formData.leave_id === "3" && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium">Floater Leave Guidelines:</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>
                            • You can only select dates that are designated as
                            floater holidays
                          </li>
                          <li>
                            • Use the "View Available Floater Holidays" button
                            above to see all available dates
                          </li>
                          <li>
                            • Weekends and regular holidays cannot be selected
                            for floater leave
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                    onChange={handleDateChange}
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
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>

            {/* Shift Selection for Custom Leave Type */}
            {formData.leave_type === "custom" &&
              formData.start_date &&
              formData.end_date && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    Select Shifts for Half-Day Leave
                  </h4>

                  {/* Single Day - Show only start shift */}
                  {formData.start_date === formData.end_date ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Shift for{" "}
                        {new Date(formData.start_date).toLocaleDateString()}
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="start_shift"
                            value="first_half"
                            checked={formData.start_shift === "first_half"}
                            onChange={handleChange}
                            className="mr-2 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">
                            First Half (Morning)
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="start_shift"
                            value="second_half"
                            checked={formData.start_shift === "second_half"}
                            onChange={handleChange}
                            className="mr-2 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">
                            Second Half (Afternoon)
                          </span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Multi-day - Show start and end shifts */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date Shift -{" "}
                          {new Date(formData.start_date).toLocaleDateString()}
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="start_shift"
                              value=""
                              checked={!formData.start_shift}
                              onChange={handleChange}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              Full Day
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="start_shift"
                              value="second_half"
                              checked={formData.start_shift === "second_half"}
                              onChange={handleChange}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              Second Half Only
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date Shift -{" "}
                          {new Date(formData.end_date).toLocaleDateString()}
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="end_shift"
                              value=""
                              checked={!formData.end_shift}
                              onChange={handleChange}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              Full Day
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="end_shift"
                              value="first_half"
                              checked={formData.end_shift === "first_half"}
                              onChange={handleChange}
                              className="mr-2 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              First Half Only
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Date Summary */}
            {formData.start_date && formData.end_date && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Leave Days</p>
                    <p className="font-medium">
                      {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                      {formData.leave_type === "custom" &&
                        calculateDays() % 1 !== 0 && (
                          <span className="text-xs text-blue-600 ml-1">
                            (includes half-day)
                          </span>
                        )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Calendar Days</p>
                    <p className="font-medium">
                      {calculatedDays.totalCount} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <p className="font-medium capitalize">
                      {formData.leave_type === "full" ? "Full Day" : "Custom"}
                    </p>
                  </div>
                </div>

                {/* Show shift details for custom leave */}
                {formData.leave_type === "custom" && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {formData.start_date === formData.end_date ? (
                        // Single day
                        formData.start_shift ? (
                          `${
                            formData.start_shift === "first_half"
                              ? "First Half (Morning)"
                              : "Second Half (Afternoon)"
                          } on ${new Date(
                            formData.start_date
                          ).toLocaleDateString()}`
                        ) : (
                          "Please select a shift for the selected date"
                        )
                      ) : (
                        // Multi-day
                        <div className="space-y-1">
                          <div>
                            Start:{" "}
                            {formData.start_shift ? "Second Half" : "Full Day"}{" "}
                            on{" "}
                            {new Date(formData.start_date).toLocaleDateString()}
                          </div>
                          <div>
                            End:{" "}
                            {formData.end_shift ? "First Half" : "Full Day"} on{" "}
                            {new Date(formData.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </p>
                  </div>
                )}

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
              disabled={
                isSubmitting || isExceedingBalance() || isCustomLeaveInvalid()
              }
              className={`px-4 py-2 bg-primary text-white rounded-md ${
                isSubmitting || isExceedingBalance() || isCustomLeaveInvalid()
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Floater Holidays Modal */}
      <FloaterHolidaysModal
        isOpen={showFloaterModal}
        onClose={() => setShowFloaterModal(false)}
      />
    </div>
  );
};

export default ApplyLeave;
