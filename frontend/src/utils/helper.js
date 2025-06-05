import api from "./api";

export const getLeaveTypes = (id) => {
  const res = [
    { id: 1, name: "Casual Leave" },
    { id: 2, name: "Sick Leave" },
    { id: 3, name: "Floater Leave" },
    { id: 4, name: "LOP Leave" },
  ];
  const idPair = {
    1: "Casual Leave",
    2: "Sick Leave",
    3: "Floater Leave",
    4: "LOP Leave",
  };
  const leaveName = idPair[id];
  return leaveName;
};

export const getLeaveTypeColor = (leaveType) => {
  switch (leaveType.toLowerCase()) {
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

export const getLeaveStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "auto_approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// Cache for holidays to avoid repeated API calls
let holidaysCache = null;

const getHolidays = async () => {
  if (!holidaysCache) {
    try {
      const holidays = await api.getHolidays();
      holidaysCache = holidays.map((h) => h.date);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      holidaysCache = []; // Fallback to empty array
    }
  }
  return holidaysCache;
};

export const calculateTotaldays = async (startDate, endDate) => {
  let count = 0;
  let totalCount = 0;
  let end_date = new Date(endDate);
  let currentDate = new Date(startDate);

  // Fetch holidays from database
  const holidayDates = await getHolidays();

  while (currentDate <= end_date) {
    const dayOfWeek = currentDate.getDay();
    const splitDate = currentDate.toISOString().split("T")[0];

    // Check if it's not weekend (Saturday=6, Sunday=0) and not a holiday
    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6 &&
      !holidayDates.includes(splitDate)
    ) {
      count++;
    }
    totalCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { count, totalCount };
};

// Helper function to check if a specific date is a holiday
export const isHoliday = async (date) => {
  const holidayDates = await getHolidays();
  const dateStr =
    typeof date === "string" ? date : date.toISOString().split("T")[0];
  return holidayDates.includes(dateStr);
};
