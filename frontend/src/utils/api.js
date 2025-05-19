const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  getLeaveBalance: async () => {
    try {
      const response = await fetch(`${API_URL}/users/leave-balance`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leave balance");
      }

      return data;
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      throw error;
    }
  },

  getLeaveHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/requests`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leave history");
      }

      return data;
    } catch (error) {
      console.error("Error fetching leave history:", error);
      throw error;
    }
  },

  applyLeave: async (leaveData) => {
    try {
      const response = await fetch(`${API_URL}/leaves/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(leaveData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply for leave");
      }

      return data;
    } catch (error) {
      console.error("Error applying for leave:", error);
      throw error;
    }
  },

  cancelLeave: async (req_id) => {
    try {
      const response = await fetch(`${API_URL}/leaves/cancel/${req_id}`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel leave request");
      }

      return data;
    } catch (error) {
      console.error("Error cancelling leave request:", error);
      throw error;
    }
  },

  getTeamMembers: async () => {
    try {
      const response = await fetch(`${API_URL}/users/reportees`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch team members");
      }

      return data;
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  },

  getPendingRequests: async () => {
    try {
      const response = await fetch(`${API_URL}/approvals/pending`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pending requests");
      }

      return data;
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }
  },

  getLeaveRequests: async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/leave-history`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch approval history");
      }

      return data;
    } catch (error) {
      console.error("Error fetching approval history:", error);
      throw error;
    }
  },

  approveLeave: async (requestId, approverId, action, remarks = "") => {
    try {
      const response = await fetch(`${API_URL}/approvals/${requestId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ approverId, action, remarks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} leave request`);
      }

      return data;
    } catch (error) {
      console.error(`Error ${action} leave:`, error);
      throw error;
    }
  },

  getLeaveTypes: async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/types`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leave types");
      }

      return data;
    } catch (error) {
      console.error("Error fetching leave types:", error);
      throw error;
    }
  },
  getUserProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user profile");
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user profile");
      }

      return data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  getAllLeaves: async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/all-approved-leaves`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await response.json();

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getUserApprovedLeaves: async () => {
    try {
      const response = await fetch(`${API_URL}/leaves/user-approved-leaves`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      return response.json();
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/users/all-users`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      return response.json();
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  // Add a new employee
  addEmployee: async (employeeData) => {
    try {
      const response = await fetch(`${API_URL}/users/add-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee");
      }

      return data;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  },

  // Update an existing employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await fetch(
        `${API_URL}/users/update-employee/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify(employeeData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee");
      }

      return data;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },

  // Delete an employee
  deleteEmployee: async (employeeId) => {
    try {
      const response = await fetch(
        `${API_URL}/users/delete-employee/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      return data;
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },

  // Search for managers by name
  searchManagers: async (query) => {
    try {
      const response = await fetch(
        `${API_URL}/users/search-managers?query=${encodeURIComponent(query)}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search managers");
      }

      return data;
    } catch (error) {
      console.error("Error searching managers:", error);
      throw error;
    }
  },
};

export default api;
