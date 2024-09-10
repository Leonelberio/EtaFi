/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck


"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataComparator } from "@/app/(protected)/_components/data-comparator";
import Loader from "../dashboard/comparators/loading";

const ComparatorView = () => {
  const { comparatorId } = useParams();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [cellData, setCellData] = useState<{ [key: string]: string[] }>({});
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [tabName, setTabName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (comparatorId) {
        try {
          setIsLoading(true);

          // Fetch data from your data source endpoint
          const response = await fetch(`/api/comparators/${comparatorId}/data-source`);
          if (!response.ok) throw new Error("Failed to fetch comparator data");

          const data = await response.json();

          // Extracting selectedColumns, selectedRows, sheetId, and tabName from the data source
          const columns: string[] = [];
          const rows: string[] = [];
          const cells: { [key: string]: string[] } = {}; // Structure to hold column -> rows mapping

          data.forEach((dataSource: any) => {
            if (!sheetId && dataSource.sheetId) {
              setSheetId(dataSource.sheetId); // Set the sheetId from the data source
            }
            if (!tabName && dataSource.tabName) {
              setTabName(dataSource.tabName); // Set the tab (sheet) name
            }

            dataSource.selectedColumns.forEach((col: any) => {
              if (!columns.includes(col.columnName)) {
                columns.push(col.columnName);
                cells[col.columnName] = []; // Initialize the cell data for this column
              }
            });

            dataSource.selectedRows.forEach((row: any) => {
              if (!rows.includes(row.rowName)) {
                rows.push(row.rowName);
              }
            });
          });

          setSelectedColumns(columns);
          setSelectedRows(rows);
          setCellData(cells); // Initialize empty cells, will fill them later with fetched data

        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [comparatorId]);


  const constructRangeR1C1 = (tabName: string, selectedColumns: any[], selectedRows: any[]) => {
  // Get the first and last column index (starting from 1 instead of 0)
  const firstColumnIndex = selectedColumns.findIndex((col) => col.columnName === selectedColumns[0].columnName) + 1;
  const lastColumnIndex = selectedColumns.findIndex((col) => col.columnName === selectedColumns[selectedColumns.length - 1].columnName) + 1;

  // Get the first and last row index (starting from 1 instead of 0)
  const firstRowIndex = selectedRows.findIndex((row) => row.rowName === selectedRows[0].rowName) + 1;
  const lastRowIndex = selectedRows.findIndex((row) => row.rowName === selectedRows[selectedRows.length - 1].rowName) + 1;

  // Construct the range in R1C1 notation
  const range = `${tabName}!R${firstRowIndex+1}C${firstColumnIndex+1}:R${lastRowIndex}C${lastColumnIndex}`;
  return range;
};


  // Construct the range dynamically based on the first and last column and row selected
  const constructRange = (tabName: string, selectedColumns: string[], selectedRows: string[]) => {
    // Assuming selectedColumns holds letters and selectedRows holds numbers
    const firstColumnLetter = selectedColumns[0]; // Example: "A"
    const lastColumnLetter = selectedColumns[selectedColumns.length - 1]; // Example: "D"

    const firstRowNumber = selectedRows[0]; // Example: "1"
    const lastRowNumber = selectedRows[selectedRows.length - 1]; // Example: "10"

    // Construct a valid range like "Sheet1!A1:D10"
    const range = `${tabName}!${firstColumnLetter}${firstRowNumber}:${lastColumnLetter}${lastRowNumber}`;
    return range;
  };

  useEffect(() => {
    const fetchSheetData = async () => {
      if (sheetId && tabName && selectedColumns.length && selectedRows.length) {
        const range = constructRangeR1C1(tabName, selectedColumns, selectedRows);

        try {
          // Fetch the token for Google Sheets access
          const tokenResponse = await fetch("/api/google/sheets/token", { method: "GET" });
          const { accessToken } = await tokenResponse.json();

          // Fetch the actual sheet data using the generated range
          const sheetsResponse = await fetch(`/api/google/sheets/${sheetId}/rows?range=${range}&tab=${tabName}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!sheetsResponse.ok) {
            throw new Error("Failed to fetch Google Sheets data");
          }

          const sheetData = await sheetsResponse.json();
          const fetchedCellData: { [key: string]: string[] } = {};

          sheetData.rows.forEach((row: string[], rowIndex: number) => {
            selectedColumns.forEach((col, colIndex) => {
              if (!fetchedCellData[col]) {
                fetchedCellData[col] = [];
              }
              // Map each column to its corresponding row values
              fetchedCellData[col][rowIndex] = row[colIndex] || "N/A";
            });
          });

          setCellData(fetchedCellData); // Update state with the fetched cell data

        } catch (error) {
          console.error("Error fetching sheet data:", error);
        }
      }
    };

    fetchSheetData();
  }, [sheetId, tabName, selectedColumns, selectedRows]);

  if (isLoading || !comparatorId) {
    return <Loader />;
  }

  return (
    <div>
      <DataComparator
        selectedColumns={selectedColumns}
        selectedRows={selectedRows}
        cellData={cellData}
        title="Comparez les données"
        placeholder="Sélectionnez les champs"
      />
    </div>
  );
};

export default ComparatorView;
