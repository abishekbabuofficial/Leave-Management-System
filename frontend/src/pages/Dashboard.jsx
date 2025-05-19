import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import LeaveCard from '../components/LeaveCard';
import { getLeaveStatusColor, getLeaveTypeColor, getLeaveTypes } from '../utils/helper';

const Dashboard = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [balanceData, historyData] = await Promise.all([
          api.getLeaveBalance(),
          api.getLeaveHistory()
        ]);
        
        setLeaveBalance(balanceData);
        setLeaveHistory(historyData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with welcome message and quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Leave Manager</h1>
        <p className="text-gray-600">
          Manage your leave requests and track your team's availability all in one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/apply-leave')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all"
          >
            Apply for Leave
          </button>
          <button 
            onClick={() => navigate('/calendar')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all"
          >
            View Calendar
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <LeaveCard leaveBalance={leaveBalance}/>

      {/* Recent Leave History */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Recent Leave History</h2>
          <button 
            onClick={() => navigate('/my-requests')}
            className="text-primary hover:underline text-sm"
          >
            View All
          </button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {leaveHistory && leaveHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {[...leaveHistory]
                  .reverse()
                  .slice(0, 5)
                  .map((leave) => (
                    <tr key={leave.req_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`${getLeaveTypeColor(getLeaveTypes( leave.leave_id))} w-3 h-3 rounded-full mr-2`}></div>
                          <div className="text-sm font-medium text-gray-900">{getLeaveTypes( leave.leave_id)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getLeaveStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No leave history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
