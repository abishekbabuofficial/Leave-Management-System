import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  FilePlus,
  CheckSquare,
} from "lucide-react";

const Layout = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return <Outlet />;
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (isEmployee) {
    navItems.push(
      {
        name: "Apply Leave",
        path: "/apply-leave",
        icon: <FilePlus className="h-5 w-5" />,
      },
      {
        name: "My Requests",
        path: "/my-requests",
        icon: <FileText className="h-5 w-5" />,
      }
    );
  }

  if (isAdmin) {
    navItems.push(
      {
        name: "Team Members",
        path: "/team",
        icon: <Users className="h-5 w-5" />,
      },
      {
        name: "Pending Requests",
        path: "/pending-requests",
        icon: <FileText className="h-5 w-5" />,
      },
      // {
      //   name: "Approvals",
      //   path: "/approvals",
      //   icon: <CheckSquare className="h-5 w-5" />,
      // }
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-md transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-semibold text-primary">Leave Manager</h1>
          )}
          {/* Toggle button & Side Bar */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

        </div>
        <nav className="flex-1 overflow-y-auto pt-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md hover:bg-gray-100 transition-all ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center p-2 w-full rounded-md hover:bg-gray-100 text-red-500"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {navItems.find((item) => item.path === location.pathname)
                  ?.name || "Dashboard"}
              </h2>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user.Emp_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.Role}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">           
                  <button onClick={() => navigate('/profile')}>{user.Emp_name?.charAt(0).toUpperCase() || "U"}</button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
