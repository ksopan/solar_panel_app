'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface QuotationComparisonProps {
  quotations: any[];
}

export default function QuotationComparison({ quotations }: QuotationComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'warranty'>('price');
  
  // Sort quotations by price (lowest first)
  const sortedQuotations = [...quotations].sort((a, b) => a.price - b.price);
  
  // Prepare data for bar chart
  const barChartData = sortedQuotations.map((q) => ({
    name: q.company_name,
    price: q.price,
    warranty: parseInt(q.warranty_period.match(/\d+/)?.[0] || '0'),
  }));
  
  // Prepare data for pie chart
  const pieChartData = sortedQuotations.map((q) => ({
    name: q.company_name,
    value: selectedMetric === 'price' ? q.price : parseInt(q.warranty_period.match(/\d+/)?.[0] || '0'),
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Calculate average price
  const averagePrice = quotations.reduce((sum, q) => sum + q.price, 0) / quotations.length;
  
  // Find best value (lowest price)
  const bestValue = sortedQuotations[0];
  
  // Find best warranty
  const bestWarranty = [...quotations].sort((a, b) => {
    const aYears = parseInt(a.warranty_period.match(/\d+/)?.[0] || '0');
    const bYears = parseInt(b.warranty_period.match(/\d+/)?.[0] || '0');
    return bYears - aYears;
  })[0];
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="mb-6 text-xl font-bold">Quotation Analysis</h2>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
          <p className="mt-2 text-2xl font-bold">${averagePrice.toFixed(2)}</p>
        </div>
        
        <div className="p-4 text-center bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Best Value</h3>
          <p className="mt-2 text-2xl font-bold">${bestValue?.price.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-500">{bestValue?.company_name}</p>
        </div>
        
        <div className="p-4 text-center bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Best Warranty</h3>
          <p className="mt-2 text-2xl font-bold">{bestWarranty?.warranty_period}</p>
          <p className="mt-1 text-xs text-gray-500">{bestWarranty?.company_name}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quotation Comparison</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('price')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setSelectedMetric('warranty')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'warranty'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Warranty
            </button>
          </div>
        </div>
        
        <div className="h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'price' ? `$${value}` : `${value} years`,
                  name === 'price' ? 'Price' : 'Warranty'
                ]}
              />
              <Legend />
              {selectedMetric === 'price' ? (
                <Bar dataKey="price" fill="#0088FE" name="Price ($)" />
              ) : (
                <Bar dataKey="warranty" fill="#00C49F" name="Warranty (years)" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-center">
              {selectedMetric === 'price' ? 'Price Distribution' : 'Warranty Distribution'}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [
                      selectedMetric === 'price' ? `$${value}` : `${value} years`,
                      selectedMetric === 'price' ? 'Price' : 'Warranty'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Recommendations</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="mb-2 font-medium">Best Overall Value</h4>
              <p className="mb-4 text-sm text-gray-700">
                Based on price and warranty period, we recommend <strong>{bestValue?.company_name}</strong> with a price of <strong>${bestValue?.price.toFixed(2)}</strong> and warranty of <strong>{bestValue?.warranty_period}</strong>.
              </p>
              
              <h4 className="mb-2 font-medium">Considerations</h4>
              <ul className="pl-5 mb-2 text-sm text-gray-700 list-disc">
                <li>Lowest price: <strong>{sortedQuotations[0]?.company_name}</strong> (${sortedQuotations[0]?.price.toFixed(2)})</li>
                <li>Best warranty: <strong>{bestWarranty?.company_name}</strong> ({bestWarranty?.warranty_period})</li>
                <li>Average market price: <strong>${averagePrice.toFixed(2)}</strong></li>
              </ul>
              <p className="text-sm text-gray-700">
                Review each quotation's additional notes and detailed PDF for complete information before making your final decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
