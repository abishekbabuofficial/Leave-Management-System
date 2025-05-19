import React from 'react'

// template for search and filter bar
const FilterSearch = (teamMembers) => {
      const roles = ["EMPLOYEE", "MANAGER", "HR"];


      const filteredMembers = teamMembers.filter((member) => {
        const matchesSearch =
          !searchQuery ||
          member.Emp_name.toLowerCase().includes(searchQuery.toLowerCase());
    
        const matchesDepartment =
          !filterDepartment || member.department === filterDepartment;
        const matchesRole =
          !filterRole ||
          (member.Role && member.Role.toLowerCase() === filterRole.toLowerCase());
    
        return matchesSearch && matchesDepartment && matchesRole;
      });

  return (
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
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
  )
}

export default FilterSearch