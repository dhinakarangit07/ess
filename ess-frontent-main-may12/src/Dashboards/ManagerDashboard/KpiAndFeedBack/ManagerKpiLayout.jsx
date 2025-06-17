import React from "react";
import ManagerFeedbackSidebar from "./_FeedbackSidebar";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Home } from "lucide-react";

const FeedbackLink = [
  {
    label: "Manager Review",
    icon: <Home />,
    path: "/manager/manager-kpi/manager-review",
  },
  {
    label: "Manager Goals",
    icon: <Home />,
    path: "/manager/manager-kpi/manager-goals",
  },
  {
    label: "Manager Feedback",
    icon: <Home />,
    path: "/manager/manager-kpi/manager-feedback",
  },
  {
    label: "Manager Chart",
    icon: <Home />,
    path: "/manager/manager-kpi/manager-performance-chart",
  },
  {
    label: "Training Certificate",
    icon: <Home />,
    path: "/manager/manager-kpi/manager-training-certificate",
  },
  {
    label: "Employee Review",
    icon: <Home />,
    path: "/manager/manager-kpi/employee-review",
  },
  {
    label: "Employee Goals",
    icon: <Home />,
    path: "/manager/manager-kpi/employee-goals",
  },
  {
    label: "Employee Feedback",
    icon: <Home />,
    path: "/manager/manager-kpi/employee-feedback",
  },
];

const ManagerKpiLayout = () => {
  return (
    <div className="flex w-full min-h-dvh flex-col">
      {/* <ManagerFeedbackSidebar /> */}
      <Sidebar NavPaths={FeedbackLink} />
      <div className="w-full h-full flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerKpiLayout;
