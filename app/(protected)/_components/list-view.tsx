"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "../web/comparators/loading";

export default function ListView() {
  const { comparatorId } = useParams();

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (comparatorId) {
        try {
          setIsLoading(true);
          // Fetch data from the API
          const response = await fetch(`/api/comparators/${comparatorId}/data-source`);
          if (!response.ok) throw new Error("Failed to fetch comparator data");

          const data = await response.json();

          // Extract selectedColumns and selectedRows from the data sources
          const columns: string[] = [];
          const rows: any[] = [];

          data.forEach((dataSource: any) => {
            dataSource.selectedColumns.forEach((col: any) => {
              if (!columns.includes(col.columnName)) {
                columns.push(col.columnName);
              }
            });

            dataSource.selectedRows.forEach((row: any) => {
              rows.push(row); // Assuming row contains the data for each row
            });
          });

          setSelectedColumns(columns);
          setSelectedRows(rows);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [comparatorId]);

  if (isLoading || !comparatorId) {
    return <Loader />;
  }

  return (
    <div className="p-7">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {selectedColumns.map((column, index) => (
                <TableHead key={index}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {selectedColumns.map((column, colIndex) => (
                  <TableCell key={colIndex}>{row[column]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </div>
  );
}
