import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { Search } from "lucide-react";

const ManagerSearch = ({ onManagerSelect, initialManagerId = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const fetchInitialManager = async () => {
      if (initialManagerId) {
        try {
          // fetch initial manager data while editing existing
          const results = await api.searchManagers(initialManagerId);
          
          const manager = results.find((m) => m.Emp_ID === initialManagerId);
          if (manager) {
            setSelectedManager(manager);
            setSearchQuery(manager.Emp_name);
          }
        } catch (error) {
          console.error("Error fetching initial manager:", error);
        }
      }
    };

    fetchInitialManager();
  }, [initialManagerId]);

  // Debounced search function
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Don't search if query is too short
    if (query.length < 2) {
      setManagers([]);
      setShowDropdown(false);
      return;
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await api.searchManagers(query);
        setManagers(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching managers:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay
  };

  const handleSelectManager = (manager) => {
    setSelectedManager(manager);
    setSearchQuery(manager.Emp_name);
    setShowDropdown(false);
    onManagerSelect(manager.Emp_ID);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div >
        <input
          type="text"
          className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          placeholder="Search for a manager..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
        />
      </div>

      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showDropdown && managers.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          <ul className="py-1">
            {managers.map((manager) => (
              <li
                key={manager.Emp_ID}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectManager(manager)}
              >
                <div className="font-medium">{manager.Emp_name}</div>
                <div className="text-sm text-gray-500">
                  ID: {manager.Emp_ID} • {manager.Role}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDropdown &&
        managers.length === 0 &&
        searchQuery.length >= 2 &&
        !isLoading && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md p-4 text-center text-gray-500">
            No managers found
          </div>
        )}
    </div>
  );
};

export default ManagerSearch;
