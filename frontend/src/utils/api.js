const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  // Leave requests
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

  // Team management
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
  // User profile
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
  getAllLeaves: async () =>{
    try {
      const response = await fetch(`${API_URL}/leaves/all-approved-leaves`,{
        headers:{
          ...getAuthHeader()
        }
      })
      const data = await response.json();

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getUserApprovedLeaves: async() =>{
    try {
      const response = await fetch(`${API_URL}/leaves/user-approved-leaves`,{
        headers:{
          ...getAuthHeader()
        }
      })
      return response.json();
    }
    catch (err){
      console.log(err)
      throw err;
    }
  }
};


export default api;
