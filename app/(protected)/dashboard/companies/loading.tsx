// components/Loader.js

import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-14 h-14 border-4 border-t-purple-600 border-t-4 border-white rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
