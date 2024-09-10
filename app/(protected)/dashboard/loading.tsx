// components/Loader.js

import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-16 h-16 border-4 border-t-purple-600 border-t-4 border-white rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
