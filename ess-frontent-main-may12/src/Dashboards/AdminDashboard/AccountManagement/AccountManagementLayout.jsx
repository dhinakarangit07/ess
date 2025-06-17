import React, { createContext, useState, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, UserCheck, ChartArea, Target, Send, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Mock data (simplified from dashboards)
const mockClients = [
  { id: "client-1", name: "Acme Inc", totalAmount: 25000, collected: 15000, outstanding: 8000, overdue: 2000, billingDate: new Date("2025-05-01"), contactEmail: "contact@acme.com" },
  { id: "client-2", name: "Global Corp", totalAmount: 32000, collected: 20000, outstanding: 7000, overdue: 5000, billingDate: new Date("2025-05-04"), contactEmail: "info@global.com" },
  { id: "client-3", name: "Tech Ltd", totalAmount: 15000, collected: 10000, outstanding: 3000, overdue: 2000, billingDate: new Date("2025-06-01"), contactEmail: "support@tech.com" },
  { id: "client-4", name: "Beta Group", totalAmount: 40000, collected: 30000, outstanding: 5000, overdue: 5000, billingDate: new Date("2025-04-20"), contactEmail: "admin@beta.com" },
];

const mockEmployees = [
  { id: "emp-1", name: "John Doe" },
  { id: "emp-2", name: "Jane Smith" },
  { id: "emp-3", name: "Alice Johnson" },
];

// Context for shared state
export const ARManagementContext = createContext();

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// Shared styling
const commonModalInputClass = (hasError) => `block w-full px-3 py-2 border ${hasError ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`;
const commonModalLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const commonModalErrorClass = "text-xs text-red-500 mt-1";

// Set Target Modal
function SetTargetModal({ isOpen, onClose, onAddTarget, clients, employees }) {
  const initialTargetState = {
    clientId: "",
    employeeId: "",
    targetAmount: "",
    startDate: null,
    endDate: null,
  };
  const [newTarget, setNewTarget] = useState(initialTargetState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTarget((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date, field) => {
    setNewTarget((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateTargetForm = (targetData) => {
    const newErrors = {};
    if (!targetData.clientId && !targetData.employeeId) {
      newErrors.clientId = "Either client or employee must be selected.";
      newErrors.employeeId = "Either client or employee must be selected.";
    }
    if (!targetData.targetAmount) newErrors.targetAmount = "Target amount is required.";
    else if (isNaN(parseFloat(targetData.targetAmount))) newErrors.targetAmount = "Invalid target amount format.";
    else if (parseFloat(targetData.targetAmount) <= 0) newErrors.targetAmount = "Target amount must be positive.";
    else if (parseFloat(targetData.targetAmount) > 9999999999) newErrors.targetAmount = "Target amount is too large.";
    if (!targetData.startDate) newErrors.startDate = "Start date is required.";
    if (!targetData.endDate) newErrors.endDate = "End date is required.";
    else if (targetData.startDate && targetData.endDate && new Date(targetData.endDate) < new Date(targetData.startDate)) {
      newErrors.endDate = "End date must be after start date.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateTargetForm(newTarget);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const targetToAdd = {
      id: `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId: newTarget.clientId,
      employeeId: newTarget.employeeId,
      targetAmount: parseFloat(newTarget.targetAmount),
      startDate: newTarget.startDate,
      endDate: newTarget.endDate,
    };
    onAddTarget(targetToAdd);
    handleClose();
  };

  const handleClose = () => {
    setNewTarget(initialTargetState);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Set New Target</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientId" className={commonModalLabelClass}>Client (Optional)</label>
            <select
              name="clientId"
              id="clientId"
              value={newTarget.clientId}
              onChange={handleChange}
              className={commonModalInputClass(errors.clientId)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {errors.clientId && <p className={commonModalErrorClass}>{errors.clientId}</p>}
          </div>
          <div>
            <label htmlFor="employeeId" className={commonModalLabelClass}>Employee (Optional)</label>
            <select
              name="employeeId"
              id="employeeId"
              value={newTarget.employeeId}
              onChange={handleChange}
              className={commonModalInputClass(errors.employeeId)}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
            {errors.employeeId && <p className={commonModalErrorClass}>{errors.employeeId}</p>}
          </div>
          <div>
            <label htmlFor="targetAmount" className={commonModalLabelClass}>Target Amount ($)</label>
            <input
              type="number"
              name="targetAmount"
              id="targetAmount"
              value={newTarget.targetAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={commonModalInputClass(errors.targetAmount)}
            />
            {errors.targetAmount && <p className={commonModalErrorClass}>{errors.targetAmount}</p>}
          </div>
          <div>
            <label htmlFor="startDate" className={commonModalLabelClass}>Start Date</label>
            <div className="relative">
              <DatePicker
                selected={newTarget.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select start date"
                className={commonModalInputClass(errors.startDate) + " pl-10"}
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.startDate && <p className={commonModalErrorClass}>{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className={commonModalLabelClass}>End Date</label>
            <div className="relative">
              <DatePicker
                selected={newTarget.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select end date"
                className={commonModalInputClass(errors.endDate) + " pl-10"}
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.endDate && <p className={commonModalErrorClass}>{errors.endDate}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Set Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Send Reminder Modal (from AccountClientDashboard.jsx)
function SendReminderModal({ isOpen, onClose, clients, onSendReminders }) {
  const currentDate = new Date(2025, 4, 13); // May 13, 2025
  const [hasSent, setHasSent] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [minAmount, setMinAmount] = useState('');
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (minAmount && (isNaN(parseFloat(minAmount)) || parseFloat(minAmount) < 0)) {
      newErrors.minAmount = 'Minimum amount must be a non-negative number.';
    }
    if (startDate && endDate && endDate < startDate) {
      newErrors.dateRange = 'End date must be after start date.';
    }
    return newErrors;
  };

  // Filter clients based on custom date range and minimum amount
  const overdueClients = clients.filter(client => {
    const billingDate = new Date(client.billingDate);
    const filterDate = endDate ? new Date(endDate) : currentDate;
    const minAmountValue = minAmount ? parseFloat(minAmount) : 0;
    return (
      client.outstanding > minAmountValue &&
      billingDate < filterDate &&
      (!startDate || billingDate >= new Date(startDate))
    );
  });

  const handleSend = () => {
    const formErrors = validateInputs();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    onSendReminders(overdueClients);
    setHasSent(true);
  };

  const handleClose = () => {
    setHasSent(false);
    setDateRange([null, null]);
    setMinAmount('');
    setErrors({});
    onClose();
  };

  const handleMinAmountChange = (e) => {
    setMinAmount(e.target.value);
    if (errors.minAmount) setErrors((prev) => ({ ...prev, minAmount: null }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[60] flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Send Payment Reminders</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {hasSent ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Reminders have been sent to {overdueClients.length} client(s).</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="dateRange" className={commonModalLabelClass}>Date Range</label>
                <div className="relative">
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      if (errors.dateRange) setErrors((prev) => ({ ...prev, dateRange: null }));
                    }}
                    placeholderText="Select date range (optional)"
                    className={commonModalInputClass(errors.dateRange) + ' pl-10'}
                    wrapperClassName="w-full"
                    popperClassName="z-[70]"
                    showPopperArrow={false}
                    dateFormat="MMM d, yyyy"
                    isClearable={true}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.dateRange && <p className={commonModalErrorClass}>{errors.dateRange}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to include all dates up to {endDate ? formatDate(endDate) : 'May 13, 2025'}.
                </p>
              </div>
              <div>
                <label htmlFor="minAmount" className={commonModalLabelClass}>Minimum Outstanding Amount ($)</label>
                <input
                  type="number"
                  id="minAmount"
                  value={minAmount}
                  onChange={handleMinAmountChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1000"
                  className={commonModalInputClass(errors.minAmount)}
                />
                {errors.minAmount && <p className={commonModalErrorClass}>{errors.minAmount}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter 0 or leave blank to include all outstanding amounts.
                </p>
              </div>
            </div>
            {overdueClients.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  The following clients have outstanding payments {minAmount ? `≥ $${parseFloat(minAmount).toLocaleString()}` : ''} due before {endDate ? formatDate(endDate) : 'May 13, 2025'}:
                </p>
                <ul className="list-disc pl-5 mb-6 text-sm text-gray-800 space-y-2 max-h-48 overflow-y-auto">
                  {overdueClients.map(client => (
                    <li key={client.id}>
                      {client.name} - ${client.outstanding.toLocaleString()} outstanding (Due: {formatDate(client.billingDate)})
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Send Reminders
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  No clients have outstanding payments {minAmount ? `≥ $${parseFloat(minAmount).toLocaleString()}` : ''} due before {endDate ? formatDate(endDate) : 'May 13, 2025'}.
                </p>
                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const TopNav = () => {
  const navItems = [
    { to: ".", label: "Client Dashboard", icon: <Users className="w-5 h-5" />, end: true },
    { to: "employee-dash", label: "Employee Dashboard", icon: <UserCheck className="w-5 h-5" /> },
    { to: "reports", label: "Reports", icon: <ChartArea className="w-5 h-5" /> },
  ];

  return (
    <ARManagementContext.Consumer>
      {({ filterPeriod, setFilterPeriod, dateRange, setDateRange, openSetTargetModal, openSendReminderModal }) => {
        const [startDate, endDate] = dateRange;

        const handleFilterPeriodChange = (e) => {
          setFilterPeriod(e.target.value);
          if (e.target.value !== "custom") {
            setDateRange([null, null]);
          }
        };

        return (
          <nav className="bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b gap-4">
              {/* Left Navigation */}
              <div className="flex items-center gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                    aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
              {/* Right Controls: Date Filter, Set Target, Send Reminder */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterPeriod}
                  onChange={handleFilterPeriodChange}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 text-sm"
                >
                  <option value="" disabled hidden>
                    Filter by period
                  </option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                {filterPeriod === "custom" && (
                  <div className="relative w-full sm:w-72">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={setDateRange}
                      placeholderText={
                        startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : "Select date range"
                      }
                      className="pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                      popperClassName="z-50 react-datepicker-popper"
                      wrapperClassName="w-full"
                      calendarClassName="text-sm p-2 border rounded-md shadow-lg bg-white"
                      showPopperArrow={false}
                      minDate={new Date(2000, 0, 1)}
                      maxDate={new Date(2030, 11, 31)}
                      isClearable={true}
                      dateFormat="MMM d, yyyy"
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                )}
                <button
                  onClick={openSetTargetModal}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors shadow-sm text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Target size={18} />
                  <span>Set Target</span>
                </button>
                <button
                  onClick={openSendReminderModal}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors shadow-sm text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </nav>
        );
      }}
    </ARManagementContext.Consumer>
  );
};

const ARManagementLayout = () => {
  const [filterPeriod, setFilterPeriod] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [targets, setTargets] = useState([]);
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [isSendReminderModalOpen, setIsSendReminderModalOpen] = useState(false);

  const handleAddTarget = useCallback((newTarget) => {
    setTargets((prev) => [...prev, newTarget].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
  }, []);

  const handleSendReminders = useCallback((overdueClients) => {
    overdueClients.forEach(client => {
      console.log(`Sending reminder email to ${client.name} at ${client.contactEmail} for $${client.outstanding.toLocaleString()} outstanding, due on ${formatDate(client.billingDate)}`);
    });
    alert(`Reminders sent to ${overdueClients.length} client(s). Check the console for details.`);
  }, []);

  const openSetTargetModal = () => setIsSetTargetModalOpen(true);
  const closeSetTargetModal = () => setIsSetTargetModalOpen(false);
  const openSendReminderModal = () => setIsSendReminderModalOpen(true);
  const closeSendReminderModal = () => setIsSendReminderModalOpen(false);

  const contextValue = {
    filterPeriod,
    setFilterPeriod,
    dateRange,
    setDateRange,
    targets,
    clients: mockClients,
    employees: mockEmployees,
    addTarget: handleAddTarget,
    openSetTargetModal,
    openSendReminderModal,
  };

  return (
    <ARManagementContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Top Navigation */}
        <TopNav />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[calc(100vh-10rem)]">
            <Outlet />
          </div>
        </main>

        {/* Modals */}
        <SetTargetModal
          isOpen={isSetTargetModalOpen}
          onClose={closeSetTargetModal}
          onAddTarget={handleAddTarget}
          clients={mockClients}
          employees={mockEmployees}
        />
        <SendReminderModal
          isOpen={isSendReminderModalOpen}
          onClose={closeSendReminderModal}
          clients={mockClients}
          onSendReminders={handleSendReminders}
        />
      </div>
    </ARManagementContext.Provider>
  );
};

export default ARManagementLayout;