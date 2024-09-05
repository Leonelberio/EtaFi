// PreviewSection.tsx
import React from 'react';

interface PreviewSectionProps {
  selectedColumns: string[];
  selectedRows: string[];
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ selectedColumns, selectedRows }) => {
  return (
    <div className="bg-white shadow-md p-4 rounded-md mt-6">
      <h3 className="text-lg font-semibold mb-4">Preview Your Selection</h3>
      <div className="mb-4">
        <h4 className="text-md font-semibold">Selected Columns:</h4>
        {selectedColumns.length > 0 ? (
          <ul>
            {selectedColumns.map((col, index) => (
              <li key={index} className="text-gray-700">{col}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No columns selected.</p>
        )}
      </div>
      <div>
        <h4 className="text-md font-semibold">Selected Rows:</h4>
        {selectedRows.length > 0 ? (
          <ul>
            {selectedRows.map((row, index) => (
              <li key={index} className="text-gray-700">{row}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No rows selected.</p>
        )}
      </div>
    </div>
  );
};

export default PreviewSection;
