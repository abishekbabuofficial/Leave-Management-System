import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import { Search, Filter, Mail, Phone } from "lucide-react";

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const roles = ["EMPLOYEE", "MANAGER", "ADMIN", "HR"];

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const data = await api.getTeamMembers();
        setTeamMembers(data || []);
      } catch (error) {
        toast.error("Failed to load team members");
        console.error("Team members error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Filter team members based on filters
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.Emp_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      !filterRole ||
      (member.Role && member.Role.toLowerCase() === filterRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Team Members
        </h2>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="Search members..."
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
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.Emp_ID}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                    {member.Emp_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {member.Emp_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Employee ID: {member.Emp_ID}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {member.Role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {member.Manager_ID && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Manager ID:</span>{" "}
                      {member.Manager_ID}
                    </div>
                  )}
                </div>
                
                  {/* leave balance display */}
                {member.leaveBalance && member.leaveBalance.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Leave Balance
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {member.leaveBalance.map((balance) => (
                        <div
                          key={balance.balance_id}
                          className="bg-gray-50 p-2 rounded"
                        >
                          <p className="text-xs text-gray-500">
                            {balance.leaveType.leave_name}
                          </p>
                          <p className="text-sm font-medium">
                            {balance.remaining}/{balance.total_allocated}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No team members found</p>
            {(filterRole || searchQuery) && (
              <p className="mt-2 text-sm">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
