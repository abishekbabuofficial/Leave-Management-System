const AppDataSource = require("../config/dataSource");
const holiday = require("../entities/holiday");

const calculateTotaldays = async (startDate, endDate) => {
  let count = 0;
  let end_date = new Date(endDate);
  let currentDate = new Date(startDate);

  // Fetch holidays from database
  const holidays = await getHolidays();
  const holidayDates = holidays.map((h) => h.date);

  while (currentDate <= end_date) {
    const dayOfWeek = currentDate.getDay();
    const splitDate = currentDate.toISOString().split("T")[0];

    // Check if it's not weekend (Saturday=6, Sunday=0) and not a holiday
    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6 &&
      !isHoliday(splitDate, holidayDates)
    ) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

const getHolidays = async () => {
  try {
    return await AppDataSource.getRepository(holiday).find();
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

const isHoliday = (date, holidayDates) => {
  // Convert date to YYYY-MM-DD format if it's not already
  const dateStr =
    typeof date === "string" ? date : date.toISOString().split("T")[0];
  return holidayDates.includes(dateStr);
};

// Calculate remaining days to restore when cancelling during leave period
const calculateDaysToRestore = async (startDate, endDate, cancellationDate) => {
  const today = new Date();
  const leaveStart = new Date(startDate);
  const leaveEnd = new Date(endDate);

  if (today < leaveStart) {
    return await calculateTotaldays(startDate, endDate);
  }

  if (today > leaveEnd) {
    return 0;
  }

  const nextDay = new Date(today);
  nextDay.setDate(nextDay.getDate() + 1);

  if (nextDay > leaveEnd) {
    return 0;
  }

  return await calculateTotaldays(nextDay, leaveEnd);
};

module.exports = {
  calculateTotaldays,
  getHolidays,
  isHoliday,
  calculateDaysToRestore,
};
