import React from "react";
import { History } from "lucide-react";

const ApprovalHistoryModal = ({
  showHistoryModal,
  setShowHistoryModal,
  selectedHistory,
}) => {
  if (!showHistoryModal) return null;
  console.log("selectedHistory", selectedHistory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">    
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="mr-2 h-5 w-5 text-primary" />
            Approval History
          </h3>
        </div>
        <div className="p-4">
          {selectedHistory.length > 0 ? (
            <div className="space-y-4">
              {selectedHistory.map((item, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{item.approver_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.action.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800"
                          : item.action.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.action}
                    </span>
                  </div>
                  {item.remarks && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="italic">"{item.remarks}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No approval history available</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => setShowHistoryModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHistoryModal;
