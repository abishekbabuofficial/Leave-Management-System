import { useEffect, useState } from "react";
import {
  format,
  getDaysInMonth,
  parseISO,
  startOfMonth,
  getDay,
} from "date-fns";
import api from "../utils/api";
import { getLeaveTypes } from "../utils/helper";
import { useAuth } from "../context/AuthContext";

export default function Calendar() {
  const [teamData, setTeamData] = useState([]);
  const [filteredTeamData, setFilteredTeamData] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const { isHR, isManager, isDirector, isEmployee, user } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, peers, reportees
  const [allEmployees, setAllEmployees] = useState([]); // Store original data for HR

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // to check if a date is a holiday
  const isHolidayDate = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;

    return holidays[dateStr] !== undefined;
  };

  // to get holiday title
  const getHolidayTitle = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;
    return holidays[dateStr] || "";
  };

  // for highlight current user row
  const isCurrentUser = (employeeName) => {
    return user?.Emp_name === employeeName;
  };

  // Filter function
  const filterTeamData = (data, filter, search) => {
    let filtered = [...data];
    const self = filtered.find((emp) => emp.empId === user?.emp_ID);

    // Apply role-based filter
    if (filter !== "all") {
      if (isHR) {
        // HR filters
        // Filter to show only manager
        if (filter === "managers") {
          filtered = filtered.filter((emp) => {
            return data.some((otherEmp) => otherEmp.managerId === emp.empId);
          });
        } else if (filter === "employees") { // Filter to show only employees
          filtered = filtered.filter((emp) => {
            return !data.some((otherEmp) => otherEmp.managerId === emp.empId);
          });
        }
      } else {
        // Non-HR filters
        if (filter === "peers") {
          // Filter to show only peers
          filtered = filtered.filter(
            (emp) =>
              emp.managerId === self?.managerId && 
              emp.name !== user?.Emp_name &&
              emp.managerId !== null
          );
        } else if (filter === "reportees") {
          // Filter to show only reportees
          filtered = filtered.filter((emp) => emp.managerId === self.empId);
        }
      }
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Update filtered data when filters change
  useEffect(() => {
    const filtered = filterTeamData(teamData, selectedFilter, searchTerm);
    setFilteredTeamData(filtered);
  }, [teamData, selectedFilter, searchTerm, isHR, user]);

  useEffect(() => {
    const numDays = getDaysInMonth(new Date(year, month));
    const firstDayOfMonth = startOfMonth(new Date(year, month));
    const startingDayOfWeek = getDay(firstDayOfMonth);
    // Create array of day objects with date and day name
    const dayArray = Array.from({ length: numDays }, (_, i) => {
      const date = i + 1;
      const dayOfWeek = (startingDayOfWeek + i) % 7;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        date,
        dayName: dayNames[dayOfWeek],
        isToday:
          new Date().getDate() === date &&
          new Date().getMonth() === month &&
          new Date().getFullYear() === year,
      };
    });
    setDays(dayArray);

    const fetchTeamAndLeaves = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch holidays from database
        try {
          const holidayData = await api.getHolidays();
          const holidayMap = {};
          holidayData.forEach((holiday) => {
            holidayMap[holiday.date] = holiday.title;
          });
          setHolidays(holidayMap);
        } catch (holidayError) {
          console.error("Error fetching holidays:", holidayError);
          setHolidays({});
        }

        // Fetch calendar data
        let calendarData = [];
        if (isHR) {
          // For HR, get all employees with their leave requests
          calendarData = await api.getAllLeaves();
        } else {
          // For Manager, Director, and Employee, fetch only their own leave requests, peer employees and Reportees if available
          calendarData = await api.getLeaveCalendar();
        }

        // Process the calendar data
        const leavesByEmployee = {};
        const allMembers = new Set();
        calendarData.forEach((employee) => {
          allMembers.add(employee.Emp_name);

          if (employee.leaveRequests && employee.leaveRequests.length > 0) {
            employee.leaveRequests.forEach((leave) => {
              // Filter only approved and auto_approved leaves for calendar display
              if (
                leave.status === "approved" ||
                leave.status === "auto_approved"
              ) {
                if (!leavesByEmployee[employee.Emp_name]) {
                  leavesByEmployee[employee.Emp_name] = [];
                }

                const from = new Date(leave.start_date);
                const to = new Date(leave.end_date);
                const leaveType = getLeaveTypes(leave.leave_id);

                for (
                  let d = new Date(from);
                  d <= to;
                  d.setDate(d.getDate() + 1)
                ) {
                  if (d.getMonth() === month && d.getFullYear() === year) {
                    leavesByEmployee[employee.Emp_name].push({
                      day: d.getDate(),
                      type: leaveType,
                      reason: leave.reason,
                      status: leave.status,
                    });
                  }
                }
              }
            });
          }
        });

        // Create team data with all members, including those without leaves
        const teamDataWithAllMembers = Array.from(allMembers).map(
          (memberName) => {
            const employeeData = calendarData.find(
              (emp) => emp.Emp_name === memberName
            );
            return {
              name: memberName,
              leaves: leavesByEmployee[memberName] || [],
              managerId: employeeData?.Manager_ID,
              empId: employeeData?.Emp_ID
            };
          }
        );

        // Sort team data to put current user at the top
        const sortedTeamData = teamDataWithAllMembers.sort((a, b) => {
          if (isCurrentUser(a.name)) return -1;
          if (isCurrentUser(b.name)) return 1;
          return a.name.localeCompare(b.name);
        });
        setTeamData(sortedTeamData);

        // Store all employees for HR filtering
        if (isHR) {
          setAllEmployees(sortedTeamData);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        setError("Failed to load calendar data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndLeaves();
  }, [isHR, isManager, isDirector, isEmployee, year, month]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newYear);
      return newDate;
    });
  };

  const getCellColor = (leaveType, day) => {
    if (isHolidayDate(day.date)) {
      return "bg-blue-300 border border-blue-500";
    }

    if (day.dayName === "Sun" || day.dayName === "Sat") {
      return "bg-orange-100 border border-orange-300";
    }

    if (leaveType) {
      switch (leaveType) {
        case "Casual Leave":
          return "bg-green-500";
        case "Sick Leave":
          return "bg-red-500";
        case "Floater Leave":
          return "bg-purple-500";
        case "LOP Leave":
          return "bg-yellow-500";
        default:
          return "";
      }
    }

    return "";
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 overflow-x-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Team Leave Calendar</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 rounded bg-gray-200">
            <button
              onClick={goToPreviousMonth}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {format(currentDate, "MMMM")}
              </span>
              <select
                value={year}
                onChange={handleYearChange}
                className="px-2 py-1 border border-gray-700 rounded bg-gray-200"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const yearOption = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={goToNextMonth}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Next →
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search employee by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Members</option>
                {!isHR && <><option value="peers">Peers</option>
                {!isEmployee && <option value="reportees">Reportees</option>}</>}
                {isHR && <><option value="managers">Managers</option>
                <option value="employees">Employees</option></>}
              </select>
            </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredTeamData.length} of {teamData.length} employees
          </div>
        </div>
      </div>

      {filteredTeamData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedFilter !== "all"
            ? "No employees match the current filters."
            : "No team members found."}
        </div>
      ) : (
        <table className="table-auto border-collapse border w-full text-center text-sm">
          <thead>
            <tr>
              <th className="border p-2 w-40 text-left">Employee</th>
              {days.map((day) => (
                <th
                  key={day.date}
                  className={`border p-1 w-12 ${
                    day.dayName === "Sun" || day.dayName === "Sat"
                      ? "bg-orange-50"
                      : ""
                  }`}
                >
                  <div
                    className={`text-xs ${
                      day.dayName === "Sun" || day.dayName === "Sat"
                        ? "text-orange-600 font-medium"
                        : "text-gray-600"
                    } ${day.isToday ? "text-blue-400" : "text-gray-600"}`}
                  >
                    {day.dayName}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeamData.map((emp) => (
              <tr
                key={emp.name}
                className={
                  isCurrentUser(emp.name)
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }
              >
                <td
                  className={`border p-2 text-left ${
                    isCurrentUser(emp.name) ? "font-semibold text-blue-700" : ""
                  }`}
                >
                  {emp.name}
                </td>
                {days.map((day) => {
                  const leave = emp.leaves.find((l) => l.day === day.date);
                  return (
                    <td
                      key={day.date}
                      className={`border h-12 w-12 relative ${getCellColor(
                        leave?.type,
                        day
                      )}`}
                      title={
                        isHolidayDate(day.date)
                          ? leave
                            ? `Holiday: ${getHolidayTitle(
                                day.date
                              )}\n\nLeave: ${leave.type}\nStatus: ${
                                leave.status
                              }\nReason: ${leave.reason}`
                            : `Holiday: ${getHolidayTitle(day.date)}`
                          : day.dayName === "Sun" || day.dayName === "Sat"
                          ? leave
                            ? `Weekend\n\nLeave: ${leave.type}\nStatus: ${leave.status}\nReason: ${leave.reason}`
                            : "Weekend"
                          : leave
                          ? `Type: ${leave.type}\nStatus: ${leave.status}\nReason: ${leave.reason}`
                          : ""
                      }
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-xs ${
                            isHolidayDate(day.date)
                              ? "text-white font-bold"
                              : day.dayName === "Sun" || day.dayName === "Sat"
                              ? "text-orange-700 font-medium"
                              : leave
                              ? "text-white font-bold"
                              : "text-gray-600"
                          }`}
                        >
                          {day.date}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {teamData.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Legend color="bg-green-500" label="Casual Leave" />
          <Legend color="bg-red-500" label="Sick Leave" />
          <Legend color="bg-purple-500" label="Floater Leave" />
          <Legend color="bg-yellow-500" label="LOP Leave" />
          <Legend color="bg-blue-300 border border-blue-500" label="Holiday" />
          <Legend
            color="bg-orange-100 border border-orange-300"
            label="Weekend"
          />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-l-4 border-l-blue-500 rounded"></div>
            <span>Your Row</span>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm bg-blue-100 rounded-md p-2 w-fit text-blue-700 border border-blue-400">
        Note: Hover over dates for further details.
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center">
      <div className={`w-4 h-4 ${color} rounded mr-2`}></div>
      {label}
    </div>
  );
}
