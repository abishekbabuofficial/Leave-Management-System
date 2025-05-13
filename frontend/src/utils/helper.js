import holidayList from "./HolidayList";

export const getLeaveTypes = (id) => {
    const res = [{'id':1, 'name':'Casual Leave'}, {'id':2, 'name':'Sick Leave'}, {'id':3, 'name':'Floater Leave'}, {'id':4, 'name':'LOP Leave'}]
    const idPair = {'1': 'Casual Leave', '2': 'Sick Leave', '3': 'Floater Leave', '4': 'LOP Leave'};
    const leaveName = idPair[id]
    return leaveName;
  }

  export const getLeaveTypeColor = (leaveType) => {
    switch(leaveType.toLowerCase()) {
      case 'casual leave': return 'bg-leave-casual';
      case 'sick leave': return 'bg-leave-sick';
      case 'floater leave': return 'bg-leave-floater';
      case 'lop leave': return 'bg-leave-lop';
      default: return 'bg-gray-500';
    }
  };
  
  export const getLeaveStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'auto_approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  export const calculateTotaldays = (startDate, endDate)=>{
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