import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "sonner";
import api from "../utils/api";
import { getLeaveTypes, getLeaveTypeColor } from "../utils/helper";
import { useAuth } from "../context/AuthContext";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const { user, isHR, isManager, isDirector, isEmployee } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        let response;
        if (isEmployee) {
          response = await api.getUserApprovedLeaves();
        }
        if (isManager || isDirector) {
          response = await api.getLeaveRequests();
        } else if (isHR) {
          response = await api.getAllLeaves();
        }
        const formatted = response.map((leave) => {
          const leaveType = getLeaveTypes(leave.leave_id);
          return {
            title: `${leaveType}: ${leave.empDetails.Emp_name}`,
            start: new Date(leave.start_date),
            end: new Date(leave.end_date),
            allDay: true,
            className: getLeaveTypeColor(leaveType),
            tooltip: `Name: ${leave.empDetails.Emp_name} \n Leave Type: ${leaveType} \n Reason: ${leave.reason}`, // Tooltip content
          };
        });
        setEvents(formatted);
      } catch (error) {
        toast.error("Failed to load calendar data");
        console.error("Calendar data error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const eventStyleGetter = (event) => {
    return {
      className: event.className,
      style: {
        backgroundColor: event.className,
        border: 'none', 
        cursor: 'default',
      },
    };
  };

  return (
    <div className="p-4 h-screen">
      <h2 className="text-xl font-bold mb-4">Leave Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day"]}
        tooltipAccessor="tooltip" 
        // onSelectEvent={(e) => {
          
        // }}
        // selectable={false}
      />
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-leave-casual rounded-full mr-2"></div>
          <span className="text-sm">Casual Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-leave-sick rounded-full mr-2"></div>
          <span className="text-sm">Sick Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-leave-floater rounded-full mr-2"></div>
          <span className="text-sm">Floater Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-leave-lop rounded-full mr-2"></div>
          <span className="text-sm">LOP Leave</span>
        </div>
      </div>
    </div>
  );
}
