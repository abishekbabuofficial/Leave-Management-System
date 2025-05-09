import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import Loading from "../components/Loading";
import { getLeaveTypes, getLeaveTypeColor } from "../utils/helper";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveData, setLeaveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'week'

  // Sample departments and roles for filtering
  const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"];
  const roles = ["EMPLOYEE", "MANAGER", "ADMIN", "HR"];

  // Store employee data for quick lookup
  const [employeeData, setEmployeeData] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getTeamMembers();
        setTeamMembers(response || []);

        // Process team members and their leave requests
        const empData = {};
        const leaveRequests = [];

        response.forEach((member) => {
          // Store employee data for quick lookup
          empData[member.Emp_ID] = {
            name: member.Emp_name,
            role: member.Role,
            department: member.department || "N/A",
          };

          // Extract all leave requests
          if (member.leaveRequests && member.leaveRequests.length > 0) {
            member.leaveRequests.forEach((request) => {
              leaveRequests.push(request);
            });
          }
        });

        setEmployeeData(empData);
        setAllLeaveRequests(leaveRequests);
        setLeaveData(leaveRequests);
      } catch (error) {
        toast.error("Failed to load calendar data");
        console.error("Calendar data error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Get dates for previous month to fill the calendar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
      return {
        date: new Date(
          year,
          month - 1,
          prevMonthLastDay - startingDayOfWeek + i + 1
        ),
        isCurrentMonth: false,
      };
    });

    // Get dates for current month
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      return {
        date: new Date(year, month, i + 1),
        isCurrentMonth: true,
      };
    });

    // Get dates for next month to fill the calendar
    const nextMonthDays = Array.from(
      { length: 42 - (startingDayOfWeek + daysInMonth) },
      (_, i) => {
        return {
          date: new Date(year, month + 1, i + 1),
          isCurrentMonth: false,
        };
      }
    );

    // Combine all dates
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const getWeekData = () => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = date.getDate() - day;

    // Start with Sunday of the current week
    const startDate = new Date(date.setDate(diff));

    // Generate an array of 7 days starting from the Sunday
    return Array.from({ length: 7 }, (_, i) => {
      return {
        date: new Date(new Date(startDate).setDate(startDate.getDate() + i)),
        isCurrentMonth:
          new Date(
            new Date(startDate).setDate(startDate.getDate() + i)
          ).getMonth() === currentDate.getMonth(),
      };
    });
  };

  const getDaysOfWeek = () => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  };

  const getLeavesForDate = (date) => {
    // Filter leave data for the given date
    return leaveData.filter((leave) => {
      const leaveStartDate = new Date(leave.start_date);
      const leaveEndDate = new Date(leave.end_date);

      // Reset time part for accurate date comparison
      const startDate = new Date(
        leaveStartDate.getFullYear(),
        leaveStartDate.getMonth(),
        leaveStartDate.getDate()
      );
      const endDate = new Date(
        leaveEndDate.getFullYear(),
        leaveEndDate.getMonth(),
        leaveEndDate.getDate()
      );
      const compareDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      // Check if the date falls within the leave period
      return compareDate >= startDate && compareDate <= endDate;
    });
  };

  // Filter leaves based on search query and filters
  const filterLeaves = (leaves) => {
    if (!leaves) return [];

    return leaves.filter((leave) => {
      // Get employee info if available
      const employee = employeeData[leave.emp_id] || {};

      // Match by employee name if available, otherwise always match
      const nameMatch =
        !searchQuery ||
        (employee.name &&
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Match by department if filter is set and department is available
      const deptMatch =
        !filterDepartment ||
        (employee.department && employee.department === filterDepartment);

      // Match by role if filter is set and role is available
      const roleMatch =
        !filterRole || (employee.role && employee.role === filterRole);

      return nameMatch && deptMatch && roleMatch;
    });
  };

  const getLeaveTypeColor = (leaveId) => {
    // Use the helper function to get leave type name by ID
    const leaveType = getLeaveTypes(leaveId);

    switch (leaveType?.toLowerCase()) {
      case "casual leave":
        return "bg-leave-casual";
      case "sick leave":
        return "bg-leave-sick";
      case "floater leave":
        return "bg-leave-floater";
      case "lop leave":
        return "bg-leave-lop";
      default:
        return "bg-gray-500";
    }
  };

  const navigateToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Get leave counts by type for the current month
  const getLeaveCountsByType = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Filter leaves for the current month
    const currentMonthLeaves = leaveData.filter((leave) => {
      const leaveDate = new Date(leave.start_date);
      return leaveDate >= firstDay && leaveDate <= lastDay;
    });

    // Count leaves by type
    const counts = {
      1: 0, // Casual Leave
      2: 0, // Sick Leave
      3: 0, // Floater Leave
      4: 0, // LOP Leave
    };

    currentMonthLeaves.forEach((leave) => {
      if (counts[leave.leave_id] !== undefined) {
        counts[leave.leave_id]++;
      }
    });

    return counts;
  };

  if (isLoading) {
    <Loading page={"Calendar"} />;
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          {/* Month/Year Display and Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateToPreviousPeriod}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                ...(viewMode === "week" && {
                  day: "numeric",
                }),
              })}
              {viewMode === "week" && (
                <span>
                  {" "}
                  -{" "}
                  {new Date(
                    new Date(currentDate).setDate(currentDate.getDate() + 6)
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              )}
            </h2>
            <button
              onClick={navigateToNextPeriod}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "month" ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "week" ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Search employees..."
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
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(() => {
            const leaveCounts = getLeaveCountsByType();
            return (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-leave-casual rounded-full mr-2"></div>
                  <span className="text-sm">Casual Leave</span>
                  <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {leaveCounts[1]}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-leave-sick rounded-full mr-2"></div>
                  <span className="text-sm">Sick Leave</span>
                  <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {leaveCounts[2]}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-leave-floater rounded-full mr-2"></div>
                  <span className="text-sm">Floater Leave</span>
                  <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {leaveCounts[3]}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-leave-lop rounded-full mr-2"></div>
                  <span className="text-sm">LOP Leave</span>
                  <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {leaveCounts[4]}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {getDaysOfWeek().map((day) => (
            <div
              key={day}
              className="bg-gray-100 p-2 text-center font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Dates */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {(viewMode === "month" ? getMonthData() : getWeekData()).map(
            (dayData, index) => {
              const date = dayData.date;
              const isToday = date.toDateString() === new Date().toDateString();
              const leaves = filterLeaves(getLeavesForDate(date));

              return (
                <div
                  key={index}
                  className={`bg-white min-h-[100px] p-1 ${
                    !dayData.isCurrentMonth ? "text-gray-400" : ""
                  }`}
                >
                  {/* Date Number */}
                  <div
                    className={`text-right mb-1 ${
                      isToday
                        ? "bg-primary rounded-full w-7 h-7 flex items-center justify-center ml-auto text-white"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Leave Events */}
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {leaves.map((leave, idx) => {
                      const employee = employeeData[leave.emp_id] || {};
                      const employeeName =
                        employee.name || `Employee ${leave.emp_id}`;
                      const leaveTypeName = getLeaveTypes(leave.leave_id);

                      return (
                        <div
                          key={`${leave.req_id}-${idx}`}
                          className={`${getLeaveTypeColor(
                            leave.leave_id
                          )} text-white text-xs p-1 rounded truncate flex items-center justify-between`}
                          title={`${employeeName}: ${
                            leaveTypeName || "Leave"
                          } - ${leave.reason}`}
                        >
                          <span className="truncate">{employeeName}</span>
                          <span className="text-xs opacity-80 ml-1 whitespace-nowrap">
                            {leaveTypeName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
