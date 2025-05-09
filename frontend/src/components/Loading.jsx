import React from 'react'

const Loading = (page) => {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading {page}...</p>
            </div>
          </div>
        );
      }

export default Loading