import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ess_logo from "../../assets/Images/ess_logo.png";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  File,
  Folder,
  GroupIcon,
  HelpingHand,
  LayoutDashboardIcon,
  ListTodo,
  MapIcon,
  Menu,
  MessageCircle,
  Search,
  User,
  UserCheck,
  UserMinus,
  Users,
  Users2,
  UserX,
  CreditCard
} from "lucide-react";
import axios from "axios";
const baseApi = process.env.VITE_BASE_API;

const side_bar = [
  {
    link: "/employee",
    name: "Dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    link: "task",
    name: "Task",
    icon: <Folder />,
  },
  {
    link: "todo",
    name: "Todo",
    icon: <ListTodo />,
  },
  {
    link: "attendance",
    name: "Attendance",
    icon: <User />,
  },
  {
    link: "Leave",
    name: "Leave",
    icon: <UserMinus />,
  },
  {
    link: "salary",
    name: "Salary",
    icon: <DollarSign />,
  },
  {
    link: "kpi",
    name: "KPI",
    icon: <File />,
  },
  {
    link: "training-certification",
    name: "Training Certification",
    icon: <File />,
  },
  {
    link: "helpdesk",
    name: "Help Desk",
    icon: <HelpingHand />,
  },
  {
    link: "billing",
    name: "Billing",
    icon: <CreditCard/>,
  },
  {
    link: "account-management",
    name: "Account Management",
    icon: <Users />,
  },
];

const Employeeheader = () => {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const navigate = useNavigate();
  const HandleLogOut = async () => {
    const res = await axios.post(`${baseApi}/admin/logout/`);
    toast("Logout so easy !!");
    navigate("/login");
    localStorage.clear();
    window.location.reload();
  };

  const userInfo = localStorage.getItem("userdata");
  return (
    <>
      <div className="header h-[50px] bg-white z-50 sticky top-0 left-0">
        <nav className="navbar flex justify-between items-center w-full top-0 left-0 z-20 bg-white py-2 px-2 gap-6 shadow-md relative">
          {/* nav logo start */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link onClick={() => setIsOpenSidebar(!isOpenSidebar)}>
                <img src={ess_logo} alt="Ess Logo" width={25} height={25} />
              </Link>

              <div className="flex justify-between items-center sm:w-[100px] md:w-[200px] lg:w-[150px]">
                <strong className="leading-tight text-sm hidden md:block w-full">
                  Employee <br /> Self Services
                </strong>
                {/* <img
                  src="/images/icons8-hamburger-menu.svg"
                  alt="menu"
                  height={24}
                  width={24}
                  className="cursor-pointer"
                  onClick={() => setisOpenSidebar(!isOpenSidebar)}
                /> */}
                {/* <Menu
                  height={24}
                  width={24}
                  className="cursor-pointer"
                  onClick={() => setIsOpenSidebar(!isOpenSidebar)}
                /> */}
              </div>
            </div>
          </div>
          {/* nav logo end */}

          <div className="flex justify-end lg:justify-between w-full">
            <form
              action=""
              className="bg-blue-50 px-4 rounded-md flex items-center"
            >
              <input
                type="text"
                name="search"
                id="search"
                className="bg-blue-50 outline-none text-sm tracking-wider px-4"
              />
              {/* <img
                src="/images/search.svg"
                alt="search"
                height={15}
                width={15}
              /> */}
              <Search height={15} width={15} />
            </form>
            {/* profile start */}
            <div className="profile flex items-center gap-2 p-1 rounded-full">
              {/* <img
                src="/images/johnsmith.png"
                alt="Avator"
                className="avator-img"
                height={30}
                width={30}
              /> */}
              <User height={30} width={30} />
              <div className="flex justify-between gap-4 items-center">
                <div className="flex-col leading-snug hidden md:flex">
                  <p className="text-sm font-bold">{userInfo.employee_name}</p>
                  <p className="text-[10px] font-normal">{"Developer"}</p>
                </div>
                {/* <img
                  src="/images/arrow down.svg"
                  className="p-3 rounded-full"
                /> */}
                <ChevronDown />
              </div>
            </div>
            {/* profile end */}
          </div>
        </nav>

        <div
          className={`side_bar z-10 left-0 flex bg-white justify-center items-center transition-all overflow-hidden ease-in-out duration-300 h-screen ${
            isOpenSidebar ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center ">
            {side_bar.map((link) => {
              return (
                <NavLink
                  to={link.link}
                  key={link.name}
                  className={({ isActive }) =>
                    `flex flex-col justify-center items-center drop-shadow-lg
                h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white ${
                  isActive ? "bg-blue-500 text-white" : ""
                }`
                  }
                  onClick={() => setIsOpenSidebar(!isOpenSidebar)}
                >
                  {/* <img
                    src={link.icon}
                    alt={link.name}
                    height={100}
                    width={100}
                    className="drop-shadow-lg shadow-lg rounded-lg p-4"
                  /> */}
                  <div className="">{link.icon}</div>
                  <p className="text-sm text-center">{link.name}</p>
                </NavLink>
              );
            })}
            <a
              className="flex flex-col justify-center items-center drop-shadow-lg
                h-24 w-24 rounded-lg gap-5 shadow-lg font-semibold bg-blue-600 text-white cursor-pointer"
              onClick={() => HandleLogOut()}
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Employeeheader;
