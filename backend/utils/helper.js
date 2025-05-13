const { holidayList } = require("./HolidayList");

const calculateTotaldays = (startDate, endDate)=>{
    let count = 0;
    let end_date = new Date(endDate);
    let currentDate = new Date(startDate);
    
  
    while (currentDate <= end_date) {
      const dayOfWeek = currentDate.getDay();
      const splitDate = currentDate.toISOString().split('T')[0];
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !(holidayList.includes(splitDate))) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return count;
  }

module.exports={calculateTotaldays}