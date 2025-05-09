import { Calendar, AlertCircle, Clock } from "lucide-react";

const getIcon = (type) => {
  switch (type.toLowerCase()) {
    case "casual leave":
      return <Calendar className="h-6 w-6 text-leave-casual" />;
    case "sick leave":
      return <AlertCircle className="h-6 w-6 text-leave-sick" />;
    case "floater leave":
      return <Clock className="h-6 w-6 text-leave-floater" />;
    case "lop leave":
      return <Calendar className="h-6 w-6 text-leave-lop" />;
    default:
      return <Calendar className="h-6 w-6 text-gray-400" />;
  }
};

const getStyles = (type) => {
  switch (type.toLowerCase()) {
    case "casual leave":
      return {
        border: "border-leave-casual",
        bg: "bg-green-100",
        bar: "bg-leave-casual",
      };
    case "sick leave":
      return {
        border: "border-leave-sick",
        bg: "bg-red-100",
        bar: "bg-leave-sick",
      };
    case "floater leave":
      return {
        border: "border-leave-floater",
        bg: "bg-purple-100",
        bar: "bg-leave-floater",
      };
    case "lop leave":
      return {
        border: "border-leave-lop",
        bg: "bg-yellow-100",
        bar: "bg-leave-lop",
      };
    default:
      return {
        border: "border-gray-300",
        bg: "bg-gray-100",
        bar: "bg-gray-400",
      };
  }
};

const LeaveCard = ({ leaveBalance }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Balances</h2>
    {leaveBalance && leaveBalance.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalance.map((balance) => {
          const name = balance.leaveType.leave_name;
          const styles = getStyles(name);
          const percentage =
            (balance.remaining / balance.total_allocated) * 100;

          if (name !== "LOP Leave") {
            return (
              <div
                key={name}
                className={`bg-white rounded-lg shadow p-5 border-t-4 ${styles.border}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{name}</p>
                    <p className="text-3xl font-bold">{balance.remaining}</p>
                    <p className="text-sm text-gray-600">
                      of {balance.total_allocated} days
                    </p>
                  </div>
                  <div className={`${styles.bg} p-3 rounded-full`}>
                    {getIcon(name)}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${styles.bar} h-2.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={name}
                className={`bg-white rounded-lg shadow p-5 border-t-4 ${styles.border}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">{name}</p>
                    <p className="text-3xl font-bold">{balance.used}</p>
                    <p className="text-sm text-gray-600">days used</p>
                  </div>
                  <div className={`${styles.bg} p-3 rounded-full`}>
                    {getIcon(name)}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${styles.bar} h-2.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          }
        })}
      </div>
    ) : (
      <p className="text-gray-500">No leave balance information available.</p>
    )}
  </div>
);

export default LeaveCard;
