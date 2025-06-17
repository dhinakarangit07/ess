import React, { useState, useEffect, useContext } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ARManagementContext } from './AccountManagementLayout';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const peachFuzz = "#FFDAB9";
const lightGreen = "#90EE90";
const lightBlue = "#ADD8E6";
const lightRed = "#F08080";

const initialClientData = [
  {
    id: 'client-1', name: 'Acme Inc', totalAmount: 25000, collected: 15000, outstanding: 8000, overdue: 2000, targetBilling: 30000, assignedEmployee: 'John Doe', billingDate: new Date('2025-05-01'), contactEmail: 'contact@acme.com', contactPhone: '555-0101', address: '123 Industrial Way, Anytown, USA', notes: 'Long-term client, usually pays on time.',
  },
  {
    id: 'client-2', name: 'Global Corp', totalAmount: 32000, collected: 20000, outstanding: 7000, overdue: 5000, targetBilling: 35000, assignedEmployee: 'Jane Smith', billingDate: new Date('2025-05-04'), contactEmail: 'info@globalcorp.biz', contactPhone: '555-0102', address: '456 Business Blvd, Metropolis, USA', notes: 'Newer client, watch payment schedule.',
  },
  {
    id: 'client-3', name: 'Tech Ltd', totalAmount: 15000, collected: 10000, outstanding: 3000, overdue: 2000, targetBilling: 20000, assignedEmployee: 'Alice Johnson', billingDate: new Date('2025-06-01'), contactEmail: 'support@techltd.dev', contactPhone: '555-0103', address: '789 Innovation Dr, Tech City, USA', notes: '',
  },
  {
    id: 'client-4', name: 'Beta Group', totalAmount: 40000, collected: 30000, outstanding: 5000, overdue: 5000, targetBilling: 45000, assignedEmployee: 'Bob Williams', billingDate: new Date('2025-04-20'), contactEmail: 'accounts@betagroup.org', contactPhone: '555-0104', address: '101 Alpha St, Testville, USA', notes: 'Requires follow-up for overdue payments.',
  },
];

const AccountReports = () => {
  const { filterPeriod, dateRange } = useContext(ARManagementContext);
  const [startDate, endDate] = dateRange;
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState(initialClientData);
  const [selectedChart, setSelectedChart] = useState(null);

  // Mock data
  const clientData = {
    name: "Acme Corp",
    totalSales: 125000,
    receivedPayments: 98000,
    outstanding: 27000,
    overdue: 8000,
    invoices: [
      {
        id: "INV-001",
        date: new Date("2025-03-10"),
        amount: 20000,
        status: "Open",
        dueDate: "2025-04-10",
        paymentReceiveDate: null,
        notifications: "Reminder sent on 2025-04-03",
        remindersSent: 2,
        feedback: "Delayed due to internal approvals.",
        assignedTo: "John Doe",
      },
      {
        id: "INV-002",
        date: new Date("2025-03-15"),
        amount: 15000,
        status: "Inpayment",
        dueDate: "2025-04-15",
        paymentReceiveDate: "2025-04-10",
        notifications: "Partial payment received on 2025-04-10",
        remindersSent: 1,
        feedback: "Partial payment made.",
        assignedTo: "Jane Smith",
      },
      {
        id: "INV-003",
        date: new Date("2025-03-20"),
        amount: 12000,
        status: "Paid",
        dueDate: "2025-04-20",
        paymentReceiveDate: "2025-04-18",
        notifications: "Payment received on 2025-04-18",
        remindersSent: 0,
        feedback: "",
        assignedTo: "John Doe",
      },
      {
        id: "INV-004",
        date: new Date("2025-02-25"),
        amount: 10000,
        status: "Overdue",
        dueDate: "2025-03-25",
        paymentReceiveDate: null,
        notifications: "Overdue payment - Reminder sent on 2025-03-28, 2025-04-05, 2025-04-12",
        remindersSent: 3,
        feedback: "Payment failed last time.",
        assignedTo: "Jane Smith",
      },
    ],
    targetBilling: 150000,
    actualBilling: 125000,
  };

  const getProgressColor = (actual, target) => {
    const percentage = (actual / target) * 100;
    if (percentage < 50) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'Inpayment':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const applyFilters = () => {
    let filterStartDate = null;
    let filterEndDate = null;
    const today = new Date(2025, 4, 15); // May 15, 2025
    today.setHours(0, 0, 0, 0);

    switch (filterPeriod) {
      case 'daily':
        filterStartDate = new Date(today);
        filterEndDate = new Date(today);
        break;
      case 'weekly':
        filterStartDate = new Date(today);
        filterStartDate.setDate(today.getDate() - today.getDay());
        filterEndDate = new Date(filterStartDate);
        filterEndDate.setDate(filterStartDate.getDate() + 6);
        break;
      case 'monthly':
        filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        filterEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        filterStartDate = new Date(today.getFullYear(), quarter * 3, 1);
        filterEndDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'half-yearly':
        const half = today.getMonth() < 6 ? 0 : 6;
        filterStartDate = new Date(today.getFullYear(), half, 1);
        filterEndDate = new Date(today.getFullYear(), half + 6, 0);
        break;
      case 'yearly':
        filterStartDate = new Date(today.getFullYear(), 0, 1);
        filterEndDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        filterStartDate = startDate;
        filterEndDate = endDate;
        break;
      default:
        break;
    }

    if (filterStartDate && filterEndDate) {
      // Filter invoices
      const newFilteredInvoices = clientData.invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        invoiceDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return invoiceDate >= rangeStart && invoiceDate <= rangeEnd;
      });
      setFilteredInvoices(newFilteredInvoices);
      setIsFiltered(true);

      // Filter client data
      const newFilteredClientData = initialClientData.filter((client) => {
        const billingDate = new Date(client.billingDate);
        billingDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
        const rangeEnd = new Date(filterEndDate.getFullYear(), filterEndDate.getMonth(), filterEndDate.getDate());
        return billingDate >= rangeStart && billingDate <= rangeEnd;
      });
      setFilteredClientData(newFilteredClientData);
    } else {
      setFilteredInvoices([]);
      setFilteredClientData(initialClientData);
      setIsFiltered(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filterPeriod, startDate, endDate]);

  const invoicesToUse = isFiltered ? filteredInvoices : clientData.invoices;

  const openInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Open")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const inPaymentInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Inpayment")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueInvoicesAmount = invoicesToUse
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Aggregated values for summary cards from filteredClientData
  const totalSales = filteredClientData.reduce((sum, client) => sum + client.totalAmount, 0);
  const receivedPayments = filteredClientData.reduce((sum, client) => sum + client.collected, 0);
  const outstandingPayments = filteredClientData.reduce((sum, client) => sum + client.outstanding, 0);
  const overduePayments = filteredClientData.reduce((sum, client) => sum + client.overdue, 0);

  // Chart Data for Pie Chart
  const pieChartData = {
    labels: ['Received Payments', 'Outstanding Payments', 'Overdue Payments'],
    datasets: [
      {
        label: 'Payment Details ($)',
        data: [
          receivedPayments,
          outstandingPayments,
          overduePayments,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
        borderColor: ['#059669', '#2563EB', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  // Client-wise Column Chart Data
  const clientChartData = {
    labels: filteredClientData.map(client => client.name),
    datasets: [
      {
        label: 'Collected ($)',
        data: filteredClientData.map(client => client.collected),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Outstanding ($)',
        data: filteredClientData.map(client => client.outstanding),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'Overdue ($)',
        data: filteredClientData.map(client => client.overdue),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  // Billing Comparison Chart Data (Target vs Actual and Target vs Raised)
  const billingComparisonChartData = {
    targetVsActual: {
      labels: ['Target', 'Actual'],
      datasets: [
        {
          label: 'Billing ($)',
          data: [clientData.targetBilling, clientData.actualBilling],
          backgroundColor: ['#8884d8', '#a05195'],
          borderColor: ['#6b7280', '#6b7280'],
          borderWidth: 1,
        },
      ],
    },
    targetVsRaised: {
      labels: ['Target', 'Raised'],
      datasets: [
        {
          label: 'Billing ($)',
          data: [clientData.targetBilling, clientData.actualBilling],
          backgroundColor: ['#8884d8', '#a05195'],
          borderColor: ['#6b7280', '#6b7280'],
          borderWidth: 1,
        },
      ],
    },
  };

  // Chart Options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Payment Details Overview',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed || context.raw;
            return `${context.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  const columnChartOptions = (title, xAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || context.raw;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    elements: {
      bar: {
        barThickness: 15,
      },
    },
  });

  const billingComparisonChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Category',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || context.raw;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    elements: {
      bar: {
        barThickness: 15,
      },
    },
  });

  // Report Generation Functions
  const exportToCSV = () => {
    const headers = Object.keys(clientData.invoices[0]).join(',');
    const rows = clientData.invoices.map(invoice => Object.values(invoice).join(',')).join('\n');
    const csvData = `${headers}\n${rows}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${clientData.name}_invoices.csv`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clientData.invoices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${clientData.name}_invoices.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    const peachFuzzRGB = [255, 218, 185];

    doc.setFillColor(...peachFuzzRGB);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(50, 50, 50);
    doc.text(`Invoice Report - ${clientData.name}`, 10, 12);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 230, 12);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 10, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Amount']],
      body: [
        ['Total Sales', `$${totalSales.toLocaleString()}`],
        ['Received Payments', `$${receivedPayments.toLocaleString()}`],
        ['Outstanding Payments', `$${outstandingPayments.toLocaleString()}`],
        ['Overdue Payments', `$${overduePayments.toLocaleString()}`],
        ['Target Billing', `$${clientData.targetBilling.toLocaleString()}`],
        ['Actual Billing', `$${clientData.actualBilling.toLocaleString()}`],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: peachFuzzRGB, textColor: [50, 50, 50] },
      margin: { left: 10, right: 10 },
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Invoices', 10, doc.lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');

    const tableBody = clientData.invoices.map(invoice => {
      const inv = { ...invoice };
      inv.date = inv.date.toLocaleDateString();
      inv.dueDate = inv.dueDate;
      inv.paymentReceiveDate = inv.paymentReceiveDate ? inv.paymentReceiveDate : '';
      inv.amount = `$${inv.amount.toLocaleString()}`;
      return [
        inv.id,
        inv.date,
        inv.amount,
        inv.status,
        inv.dueDate,
        inv.paymentReceiveDate,
        inv.remindersSent,
        inv.assignedTo,
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['ID', 'Date', 'Amount', 'Status', 'Due Date', 'Payment Date', 'Reminders', 'Assigned To']],
      body: tableBody,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: peachFuzzRGB,
        textColor: [50, 50, 50],
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 },
      },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 280, 200);
    }

    doc.save(`${clientData.name}_Invoice_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Chart Toggle */}
      <div className="mb-6 flex justify-end">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedChart('pie')}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
              selectedChart === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Show Pie Chart"
          >
            Pie Chart
          </button>
          <button
            onClick={() => setSelectedChart('column')}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
              selectedChart === 'column' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="Show Column Chart"
          >
            Column Chart
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
  {[
    { title: "Total Sales", value: totalSales, color: "orange" },
    { title: "Received Payments", value: receivedPayments, color: "green" },
    { title: "Outstanding Payments", value: outstandingPayments, color: "blue" },
    { title: "Overdue Payments", value: overduePayments, color: "red" },
  ].map(card => (
    <div
      key={card.title}
      className={`bg-white p-5 rounded-xl border-l-4 border-${card.color}-500 shadow-lg hover:shadow-xl transition-shadow duration-300`}
    >
      <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
      <div className={`text-3xl font-bold text-${card.color === 'orange' ? 'gray-800' : card.color + '-600'} mb-2`}>
        ${card.value.toLocaleString()}
      </div>
    </div>
  ))}
</div>

      {/* Unified Chart Section */}
      {selectedChart && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="w-full h-96">
            {selectedChart === 'pie' && (
              <Pie data={pieChartData} options={pieChartOptions} />
            )}
            {selectedChart === 'column' && (
              <div className="h-full">
                <Bar 
                  data={clientChartData} 
                  options={columnChartOptions('Client-wise Payment Details', 'Client')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Billing Comparison (Target vs Actual and Target vs Raised) */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <div className="h-full">
            <Bar
              data={billingComparisonChartData.targetVsActual}
              options={billingComparisonChartOptions('Target vs Actual Billing')}
            />
          </div>
          <div className="h-full">
            <Bar
              data={billingComparisonChartData.targetVsRaised}
              options={billingComparisonChartOptions('Target vs Raised Billing')}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Target Billing: ${clientData.targetBilling.toLocaleString()}</p>
          <p>Raised Billing: ${clientData.actualBilling.toLocaleString()}</p>
          <p className="font-semibold">
            Difference: ${(clientData.targetBilling - clientData.actualBilling).toLocaleString()}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full ${getProgressColor(
                clientData.actualBilling,
                clientData.targetBilling
              )}`}
              style={{
                width: `${Math.min(100, (clientData.actualBilling / clientData.targetBilling) * 100)}%`,
              }}
            ></div>
          </div>
          <p className="mt-2">
            ${clientData.actualBilling.toLocaleString()} of ${clientData.targetBilling.toLocaleString()} billed
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoicesToUse.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.paymentReceiveDate || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.remindersSent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.assignedTo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReports;