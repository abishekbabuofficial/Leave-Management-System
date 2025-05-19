import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "sonner";
import { Search, Filter,Plus, Edit, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ManagerSearch from "../components/ManagerSearch";

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
   const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    Emp_ID: "",
    Emp_name: "",
    Role: "EMPLOYEE",
    is_active: true,
    Manager_ID: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isHR, isManager, isDirector, isEmployee } = useAuth();

  const roles = ["EMPLOYEE", "MANAGER", "HR"];

  useEffect(() => {
    fetchTeamMembers();
  }, [isHR]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      let data = await api.getTeamMembers();
      if (isHR) {
        data = await api.getAllUsers();
      }
      setTeamMembers(data || []);
    } catch (error) {
      toast.error("Failed to load team members");
      console.error("Team members error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const openAddModal = () => {
    setFormData({
      Emp_ID: "",
      Emp_name: "",
      Role: "EMPLOYEE",
      Manager_ID: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      Emp_ID: employee.Emp_ID || "",
      Emp_name: employee.Emp_name || "",
      Role: employee.Role || "EMPLOYEE",
      Manager_ID: employee.Manager_ID || "",
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
    setFormData({
      Emp_ID: "",
      Emp_name: "",
      Role: "EMPLOYEE",
      Manager_ID: "",
      password: "",
    });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.Emp_ID || !formData.Emp_name || !formData.Manager_ID) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.addEmployee(formData);
      toast.success("Employee added successfully");
      closeModals();
      fetchTeamMembers(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.Emp_name || !formData.Manager_ID) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.updateEmployee(selectedEmployee.Emp_ID, formData);
      toast.success("Employee updated successfully");
      closeModals();
      fetchTeamMembers(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/api/upload-excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      toast.success("Upload successful!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
      `Upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`);
    } finally {
      setIsUploading(false);
    }
  };


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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Team Members</h2>
          {isHR && (
            <button
              onClick={openAddModal}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          )}
        </div>

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
          {/* Uncomment Upload button while hosting worker*/}
          {/* {isHR && (
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload Excel
            </button>
          )}
          <input
            type="file"
            id="fileInput"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          /> */}
          
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
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {member.Emp_name}
                      </h3>
                      {isHR && (
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-gray-500 hover:text-primary transition-colors"
                          title="Edit employee"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
                  {member.Manager_ID && member.manager && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Reporting Manager:</span>{" "}
                      {member.manager.Emp_name}
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Employee
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="Emp_name"
                  value={formData.Emp_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="Emp_ID"
                  value={formData.Emp_ID}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="Role"
                  value={formData.Role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager *
                </label>
                <ManagerSearch 
                  onManagerSelect={(managerId) => 
                    setFormData({
                      ...formData,
                      Manager_ID: managerId
                    })
                  }
                  initialManagerId={formData.Manager_ID}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Employee
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={selectedEmployee.Emp_ID}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="Emp_name"
                  value={formData.Emp_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="Role"
                  value={formData.Role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager *
                </label>
                <ManagerSearch 
                  onManagerSelect={(managerId) => 
                    setFormData({
                      ...formData,
                      Manager_ID: managerId
                    })
                  }
                  initialManagerId={formData.Manager_ID}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;