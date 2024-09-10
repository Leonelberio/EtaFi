"use client"


import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Data for the charts
const financialData = [
  { month: "Jan", revenue: 12000, expenses: 8000, profit: 4000 },
  { month: "Feb", revenue: 15000, expenses: 9500, profit: 5500 },
  { month: "Mar", revenue: 13000, expenses: 7000, profit: 6000 },
];

const employeeData = [
  { month: "Jan", totalEmployees: 50, newHires: 5, turnover: 2 },
  { month: "Feb", totalEmployees: 53, newHires: 4, turnover: 1 },
  { month: "Mar", totalEmployees: 55, newHires: 6, turnover: 3 },
];

// Dashboard component
export default function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Financial Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Financials</CardTitle>
          <CardDescription>Revenue, Expenses, and Net Profit</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={financialData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
              <Line type="monotone" dataKey="profit" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter>
          <CardDescription>Total Profit in Q1: $15,500</CardDescription>
        </CardFooter>
      </Card>

      {/* Employee Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Metrics</CardTitle>
          <CardDescription>Total Employees, New Hires, and Turnover</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={employeeData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Bar dataKey="totalEmployees" fill="#8884d8" />
              <Bar dataKey="newHires" fill="#82ca9d" />
              <Bar dataKey="turnover" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter>
          <CardDescription>Current Employees: 55</CardDescription>
        </CardFooter>
      </Card>

      {/* Performance Metrics Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Monthly Growth and Session Duration</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={financialData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="profit" stroke="#ff7300" fill="#ff7300" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}