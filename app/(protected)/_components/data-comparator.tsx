// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataCombobox } from "./data-combobox";
import { CriteriaCombobox } from "./criteria-combobox";

interface DataComparatorProps {
  selectedColumns: string[]; // Received from the previous step (criteria)
  selectedRows: string[]; // Received from the previous step (options/rows)
  cellData: { [key: string]: string[] }; // New prop for storing cell values (column -> array of values)
  title: string;
  placeholder: string;
}

export function DataComparator({
  selectedColumns,
  selectedRows,
  cellData,
  title,
  placeholder,
}: DataComparatorProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("selectedOptions") || "[]");
  });
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("selectedCriteria") || "[]");
  });
  const [showComparison, setShowComparison] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem("showComparison") || "false");
  });
  const [storedCellData, setStoredCellData] = useState<{ [key: string]: string[] }>(() => {
    return JSON.parse(localStorage.getItem("cellData") || "{}");
  });

  // Save selected options (rows) to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
  }, [selectedOptions]);

  // Save selected criteria (columns) to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedCriteria", JSON.stringify(selectedCriteria));
  }, [selectedCriteria]);

  // Save the showComparison flag to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("showComparison", JSON.stringify(showComparison));
  }, [showComparison]);

  // Save the cell data to localStorage whenever it changes
  useEffect(() => {
    if (showComparison) {
      localStorage.setItem("cellData", JSON.stringify(cellData));
    }
  }, [cellData, showComparison]);

  // Function to enable or disable the Compare button
  const isCompareDisabled = () => {
    return selectedOptions.length === 0 || selectedCriteria.length === 0;
  };

  const handleCompare = () => {
    if (selectedOptions.length > 0 && selectedCriteria.length > 0) {
      setShowComparison(true);
    }
  };

  const handleCriteriaChange = (newCriteria: string[]) => {
    setSelectedCriteria(newCriteria);
  };

  const renderComparisonTable = () => {
    const dataToShow = showComparison ? cellData : storedCellData;
    return (
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableCaption>A comparison between the selected options.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] md:w-[200px] text-center"></TableHead>
              {selectedOptions.map((option, index) => (
                <TableHead key={index} className="w-[300px] md:w-[400px] text-center">
                  {option}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedCriteria.map((criterion, index) => (
              <TableRow key={index}>
                <TableCell>{criterion}</TableCell>
                {selectedOptions.map((option, optIndex) => (
                  <TableCell key={optIndex}>
                    {dataToShow[criterion] && dataToShow[criterion][optIndex]
                      ? dataToShow[criterion][optIndex]
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={selectedOptions.length + 1} className="text-center">
                Comparison completed.
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-start md:items-center mb-4">
        {/* DataCombobox for Rows */}
        <div className="flex-1 w-full md:w-3/5">
          <DataCombobox
            options={selectedRows} // Pass selected rows here
            onSelect={setSelectedOptions}
            placeholder={placeholder}
          />
        </div>

        {/* CriteriaCombobox for Columns */}
        <div className="w-full md:w-1/5">
          <CriteriaCombobox
            criteria={selectedColumns} // Pass selected columns here
            onCriteriaChange={handleCriteriaChange}
            placeholder="Criteria"
          />
        </div>

        {/* Compare button */}
        <div className="w-full md:w-1/5">
          <Button
            onClick={handleCompare}
            className="w-full"
            disabled={isCompareDisabled()} // Disable if no rows/columns selected
          >
            Compare
          </Button>
        </div>
      </div>
      {showComparison && renderComparisonTable()}
    </div>
  );
}
