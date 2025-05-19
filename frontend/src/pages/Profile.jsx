import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "sonner";
import { User, Briefcase, Calendar, UserCheck } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [manager, setManager] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserProfile();
        
        // Set profile data
        setProfile(response.user);
        setManager(response.manager);
        setLeaveBalances(response.leave_balances || []);
      } catch (error) {
        toast.error("Failed to load profile data");
        console.error("Profile data error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading && !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="h-24 w-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold">
              {profile?.Emp_name?.charAt(0).toUpperCase() || user?.Emp_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{profile?.Emp_name}</h1>
              <p className="text-primary-foreground">{profile?.Role}</p>
              <p className="text-primary-foreground mt-1">Employee ID: {profile?.Emp_ID}</p>
              {manager && (
                <p className="text-primary-foreground mt-1">Manager: {manager?.Emp_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{profile?.Emp_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{profile?.Role}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Employee ID</p>
                      <p className="font-medium">{profile?.Emp_ID}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {manager && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Manager Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Manager Name</p>
                        <p className="font-medium">{manager?.Emp_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Manager Role</p>
                        <p className="font-medium">{manager?.Role}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Manager ID</p>
                        <p className="font-medium">{manager?.Emp_ID}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {leaveBalances && leaveBalances.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Balances</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {leaveBalances.map(balance => (
                        <div key={balance.balance_id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{balance.leaveType.leave_name}</p>
                            <p className="text-xs text-gray-500">
                              {balance.leaveType.is_auto_approve === 1 ? "Auto-approved" : "Requires approval"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{balance.remaining} / {balance.total_allocated}</p>
                            <p className="text-xs text-gray-500">
                              Used: {balance.used}
                              {balance.leaveType.is_rollover === 1 && ", Rollover enabled"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${profile?.is_active === true ? "bg-green-500" : "bg-red-500"}`}></div>
                    <p className="font-medium">
                      {profile?.is_active === true ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;