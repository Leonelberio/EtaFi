/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, Loader2, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import StepIndicator from "@/components/StepIndicator";
import { useSession } from "next-auth/react" // Importing session hook


export default function SelectDataSource({ params, sheets, setSheets, selectedDataSource, onFinish }) {
  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(false); 
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string | null>(selectedDataSource?.sheetId || null);
  const [selectedTab, setSelectedTab] = useState<string | null>(selectedDataSource?.selectedColumns?.[0]?.tabName || null);
  const [tabs, setTabs] = useState<string[]>([]);
  const [rows, setRows] = useState<string[]>([]); 
  const [columns, setColumns] = useState<string[]>([]);
  const [filteredTabs, setFilteredTabs] = useState<string[]>([]);
  const [filteredRows, setFilteredRows] = useState<string[]>([]); 
  const [filteredColumns, setFilteredColumns] = useState<string[]>([]); 
  const [selectedRows, setSelectedRows] = useState<string[]>(selectedDataSource?.selectedRows?.map(row => row.rowName) || []); 
  const [selectedColumns, setSelectedColumns] = useState<string[]>(selectedDataSource?.selectedColumns?.map(col => col.columnName) || []); 
  const [tabSearchQuery, setTabSearchQuery] = useState<string>(""); 
  const [rowSearchQuery, setRowSearchQuery] = useState<string>(""); 
  const [columnSearchQuery, setColumnSearchQuery] = useState<string>(""); 
  const [currentStep, setCurrentStep] = useState(1); 
  const [isDataSourceVisible, setIsDataSourceVisible] = useState(true); 
  const [createdDataSource, setCreatedDataSource] = useState(null); // Track the created data source
  const router = useRouter();
  const { comparatorId } = useParams(); 
  const searchParams = useSearchParams();
  const session = useSession() // Getting session data

  const userId = session?.data?.user?.id;


  useEffect(() => {
    if (!selectedDataSource) {
      handleSelectGoogleSheets();
    }
  }, [] )

  const handleSelectGoogleSheets = async () => {
    try {
      setIsLoading(true); 
      const response = await fetch("/api/google/sheets");
      if (!response.ok) {
        throw new Error("Failed to fetch Google Sheets data");
      }
      const data = await response.json();
      setSheets(data.sheets || []);
    } catch (error) {
      console.error("Error fetching Google Sheets data:", error);
      setSheets([]);
    } finally {
      setIsLoading(false); 
    }
  };

  const onSheetClick = async (spreadsheetId: string) => {
    setSelectedSpreadsheet(spreadsheetId);
    try {
      setIsLoading(true); 
      const response = await fetch(`/api/google/sheets/${spreadsheetId}/tabs`);
      if (!response.ok) {
        throw new Error("Failed to fetch tabs");
      }
      const data = await response.json();
      setTabs(data.tabs || []);
      setFilteredTabs(data.tabs || []); 
      setCurrentStep(2); 
    } catch (error) {
      console.error("Error fetching tabs:", error);
      setTabs([]);
      setFilteredTabs([]);
    } finally {
      setIsLoading(false); 
    }
  };

  const onTabClick = async (tabName: string) => {
    setSelectedTab(tabName);
    try {
      setIsLoading(true);
      if (!selectedSpreadsheet) return;
  
      const rowsResponse = await fetch(`/api/google/sheets/${selectedSpreadsheet}/rows?tab=${tabName}`);
      if (!rowsResponse.ok) {
        throw new Error("Failed to fetch rows");
      }
      const rowsData = await rowsResponse.json();
  
      const filteredNonNullRows = rowsData.rows
        .slice(1) 
        .filter((row: any) => row[0] && row[0].trim() !== "")
        .map((row: any) => row[0]); 
  
      setRows(filteredNonNullRows || []);
      setFilteredRows(filteredNonNullRows || []); 
  
      const columnsResponse = await fetch(`/api/google/sheets/${selectedSpreadsheet}/columns?tab=${tabName}`);
      if (!columnsResponse.ok) {
        throw new Error("Failed to fetch columns");
      }
      const columnsData = await columnsResponse.json();
      const validColumns = columnsData.columns.filter((column: string) => column && column.trim() !== "");
      setColumns(validColumns || []);
      setFilteredColumns(validColumns || []); 
      setCurrentStep(3); 
    } catch (error) {
      console.error("Error fetching rows and columns:", error);
      setRows([]);
      setFilteredRows([]);
      setColumns([]);
      setFilteredColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSearch = (query: string) => {
    setTabSearchQuery(query);
    setFilteredTabs(
      tabs.filter((tab) => tab.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleRowSearch = (query: string) => {
    setRowSearchQuery(query);
    setFilteredRows(
      rows.filter((rowValue) => rowValue.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleColumnSearch = (query: string) => {
    setColumnSearchQuery(query);
    setFilteredColumns(
      columns.filter((column) => column.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleRowToggle = (row: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(row)
        ? prevSelected.filter((r) => r !== row)
        : [...prevSelected, row]
    );
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prevSelected) =>
      prevSelected.includes(column)
        ? prevSelected.filter((c) => c !== column)
        : [...prevSelected, column]
    );
  };

  const handleNextClick = async () => {
    if (currentStep === 1 && selectedSpreadsheet) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedTab) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedColumns.length > 0 && selectedRows.length > 0) {
      setCurrentStep(4);
    } else {
      alert("Please complete the necessary selections before proceeding.");
    }
  };

  const handleSaveDataSource = async () => {
    try {
      const response_token = await fetch("/api/google/sheets/token", {
        method: "GET",
      });
  
      const { accessToken } = await response_token.json();
      const authKey = accessToken;
  
      if (selectedColumns.length === 0 || selectedRows.length === 0) {
        throw new Error("No columns or rows selected");
      }
  
      const dataToSave = {
        userId: userId,
        comparatorId: parseInt(params.comparatorId, 10),  // Ensure comparatorId is an integer
        authKey,
        type: "GoogleSheets",
        sheetId: selectedSpreadsheet,
        tabName: selectedTab,
        selectedColumns: selectedColumns.map(column => ({
          columnName: column,
          tabName: selectedTab,  // Ensure the tabName is correctly set
        })),
        selectedRows: selectedRows.map(row => ({
          rowName: row,
          tabName: selectedTab,  // Ensure the tabName is correctly set
        })),
      };
      
      console.log(dataToSave);  // Debugging: Log the data to be saved
  
      const createResponse = await fetch(`/api/comparators/${params.comparatorId}/data-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
  
      if (!createResponse.ok) throw new Error("Failed to save data source to the database");
  
      const newDataSource = await createResponse.json();
      setCreatedDataSource(newDataSource);  // Store the created data source for editing
      
      setCurrentStep(4); 
    } catch (error) {
      console.error("Error saving data source:", error);
    }
  };

  const handleFinish = () => {
    handleSaveDataSource(); // Save data when finishing
  };

  const handleEditDataSource = () => {
    if (createdDataSource?.id) {
      const updatedSearchParams = new URLSearchParams(searchParams);
      updatedSearchParams.set("datasourceId", createdDataSource.id);
      router.push(`${router.asPath.split('?')[0]}?${updatedSearchParams.toString()}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true); 
      const response = await fetch("/api/google/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect from Google Sheets");
      }

      setSheets([]);
      setTabs([]);
      setColumns([]);
      setRows([]);
      setSelectedSpreadsheet(null);
      setSelectedTab(null);

      router.refresh(); 
    } catch (error) {
      console.error("Error disconnecting from Google Sheets:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  const filteredSheets = sheets.filter((sheet) =>
    sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isDataSourceVisible && (
        <>
          <StepIndicator 
            currentStep={currentStep} 
            steps={['Select Sheet', 'Select Tab', 'Select Rows & Columns', 'Preview & Confirm']} 
            primaryColor="#007bff" 
          />

          <Card>
            <CardHeader>
              <CardTitle>{currentStep === 1 ? 'Choisir une feuille' : currentStep === 2 ? 'Choisissez un onglet' : 'Sélectionner les champs'}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    placeholder="Rechercher des feuilles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
                    </div>
                  ) : (
                    filteredSheets.length > 0 && (
                      <div className="h-40 overflow-y-auto grid gap-8">
                        {filteredSheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => onSheetClick(sheet.id)}
                          >
                            <Sheet />
                            <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">{sheet.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  }

                  <div className="flex justify-between gap-4">
                    <Button onClick={handleSelectGoogleSheets}>
                      Rafraîchir les feuilles Google Sheets
                    </Button>

                    <Button variant="destructive" onClick={handleDisconnect}>
                      Déconnecter
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    placeholder="Rechercher des onglets..."
                    value={tabSearchQuery}
                    onChange={(e) => handleTabSearch(e.target.value)}
                  />
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
                    </div>
                  ) : (
                    <div className="h-40 overflow-y-auto space-y-2">
                      {filteredTabs.map((tab, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-3 cursor-pointer text-primary underline"
                          onClick={() => onTabClick(tab)}
                        >
                          <span>{tab}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

{currentStep === 3 && (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden">
      <div className="flex flex-col gap-4 flex-1 overflow-y-scroll">
        <div className="flex items-center justify-between">
          <Input
            type="text"
            placeholder="Rechercher des lignes..."
            value={rowSearchQuery}
            onChange={(e) => handleRowSearch(e.target.value)}
          />
          <Checkbox
            id="select-all-rows"
            checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedRows(filteredRows);
              } else {
                setSelectedRows([]);
              }
            }}
          />
          <label htmlFor="select-all-rows" className="text-sm font-medium leading-none">
            Sélectionner tout
          </label>
        </div>
        <div className="overflow-y-auto space-y-2 flex-1">
          {filteredRows.length > 0 ? (
            <div className="h-40 overflow-y-auto space-y-2">
              {filteredRows.map((rowValue, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`row-${index}`}
                    checked={selectedRows.includes(rowValue)}
                    onCheckedChange={() => handleRowToggle(rowValue)}
                  />
                  <label
                    htmlFor={`row-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rowValue}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p>No non-null values found in the first column.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-scroll">
        <div className="flex items-center justify-between">
          <Input
            type="text"
            placeholder="Rechercher des colonnes..."
            value={columnSearchQuery}
            onChange={(e) => handleColumnSearch(e.target.value)}
          />
          <Checkbox
            id="select-all-columns"
            checked={selectedColumns.length === filteredColumns.length && filteredColumns.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedColumns(filteredColumns);
              } else {
                setSelectedColumns([]);
              }
            }}
          />
          <label htmlFor="select-all-columns" className="text-sm font-medium leading-none">
            Sélectionner tout
          </label>
        </div>
        <div className="overflow-y-auto space-y-2 flex-1">
          {filteredColumns.map((column, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`column-${index}`}
                checked={selectedColumns.includes(column)}
                onCheckedChange={() => handleColumnToggle(column)}
              />
              <label
                htmlFor={`column-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {column}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Button onClick={handleNextClick}>Suivant</Button>
  </div>
)}


              {currentStep === 4 && (
                <>
                  <Card key={createdDataSource?.id || "new"}>
                    <CardHeader>
                      <CardTitle>{selectedDataSource ? "Modifier" : "Nouvelle"} Source de données</CardTitle>
                      <CardDescription>
                        Feuille: {selectedSpreadsheet || "N/A"} <br />
                        Onglet: {selectedTab || "N/A"} <br />
                        Filtres: {selectedColumns.join(", ")} <br />
                        Critères: {selectedRows.join(", ")}
                      </CardDescription>
                      <Button variant="ghost" size="icon" onClick={handleEditDataSource}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                  </Card>
                  <Button onClick={handleFinish}>Terminé</Button>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
