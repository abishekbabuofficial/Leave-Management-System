import React, { useState, useEffect } from "react";
import { X, Calendar, Info } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";

const FloaterHolidaysModal = ({ isOpen, onClose }) => {
  const [floaterHolidays, setFloaterHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFloaterHolidays();
    }
  }, [isOpen]);

  const fetchFloaterHolidays = async () => {
    try {
      setLoading(true);
      const holidays = await api.getHolidays();
      // Filter only floater holidays
      const floaterOnly = holidays.filter((holiday) => holiday.is_floater);
      setFloaterHolidays(floaterOnly);
    } catch (error) {
      console.error("Error fetching floater holidays:", error);
      toast.error("Failed to load floater holidays");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Available Floater Holidays
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-2 mb-4 p-3 bg-purple-50 rounded-lg">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">About Floater Holidays:</p>
              <p>
                Floater holidays are optional holidays that you can choose to
                take. You can only apply for floater leave on these specific
                dates.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">
                Loading floater holidays...
              </span>
            </div>
          ) : floaterHolidays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No floater holidays available</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {floaterHolidays.map((holiday, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {holiday.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(holiday.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Floater
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloaterHolidaysModal;
