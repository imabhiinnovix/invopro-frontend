// Core(React) Library
import { useContext, useState } from "react";

// Third-Party Library
import { Icon } from "@iconify-icon/react";
import { useLocation, useNavigate } from "react-router-dom";

// Local
import {
  GeneralContext,
  GeneralContextType,
} from "../../../context/GeneralContext";

import logo from "../../../assets/Searchivix-Logo-TRANS-V1.png";
import { AuthContext, AuthContextType } from "../../../context/AuthContext";
import { POST } from "../../../services/apiRoutes";
import usePost from "../../../hooks/usePost";
import useClickOutside from "../../../hooks/useClickOutSide";
import Divider from "../divider";
import { profileMenu } from "../../../utils/constants";
import { roleId } from "../../../utils/constants";
import {
  clearLocalStorage,
  getAuthToken,
} from "../../../utils/handleLocalStorage";
import {
  ExpandScreenContext,
  ExpandScreenContextType,
} from "../../../context/ExpandScreenContext";

interface userUpdatePayload {
  settings: {
    RPPos: string;
  };
}

interface userUpdateResponse {}

const Header = () => {
  const [open, setOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState<boolean>(false);
  const [popOverOpen, setPopOverOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const {
    isSaving,
    sidebarWidth,
    setSidebarWidth,
    setReadingPanePlace,
    readingPanePlace,
    setAdminSidebarWidth,
    adminSidebarWidth,
  } = useContext(GeneralContext) as GeneralContextType;

  const { clearAuthContext, userDetails } = useContext(
    AuthContext
  ) as AuthContextType;

  const { screen } = useContext(ExpandScreenContext) as ExpandScreenContextType;

  const userUpdate = usePost<userUpdatePayload, userUpdateResponse>([
    "userDetails",
  ]);

  const toggleMenu = () => setOpen(!open);

  const logout = () => {
    clearAuthContext();
    clearLocalStorage();
    setPopOverOpen(false);
    navigate("/login");
  };

  const layoutOpenRef = useClickOutside(() => {
    setLayoutOpen(false);
  });

  const popOverRef = useClickOutside(() => {
    setPopOverOpen(false);
  });

  const henadleReadingPaneChange = (
    position: "left" | "right" | "bottom" | "top"
  ) => {
    setReadingPanePlace(position);
    setLayoutOpen(false);
    userUpdate.mutate({
      url: POST.USER_UPDATE,
      payload: {
        settings: {
          RPPos: position,
        },
      },
    });
  };

  const handleHamurger = () => {
    if (pathname.includes("/dashboard")) {
      setSidebarWidth(sidebarWidth === "20%" ? "0%" : "20%");
    } else if (
      pathname.includes("/superadmin") ||
      pathname.includes("/admin")
    ) {
      setAdminSidebarWidth(adminSidebarWidth === "20%" ? "3%" : "20%");
    }
  };

  const handleProfileSection = (item: { routeName: string; name: string }) => {
    if (isActiveTabCSS(item)) {
      setPopOverOpen(false);
      return;
    }
    const path =
      userDetails?.data?.roleId === roleId?.SUPER_ADMIN &&
      item?.routeName !== "/superadmin"
        ? "/superadmin" + item?.routeName
        : userDetails?.data?.roleId === roleId?.ADMIN &&
          item?.routeName !== "/admin"
        ? "/admin" + item?.routeName
        : item?.routeName;
    navigate(path);
    setPopOverOpen(false);
  };

  const isActiveTabCSS = (item: { routeName: string; name: string }) => {
    return userDetails?.data?.roleId === roleId?.SUPER_ADMIN
      ? (item?.routeName === "/superadmin" &&
          (pathname === "/superadmin" ||
            pathname.startsWith("/superadmin/userlist") ||
            pathname.startsWith("/superadmin/organizationlist") ||
            pathname.startsWith("/superadmin/workspacelist"))) ||
          pathname === "/superadmin" + item?.routeName
      : userDetails?.data?.roleId === roleId?.ADMIN
      ? (item?.routeName === "/admin" &&
          (pathname === "/admin" ||
            pathname.startsWith("/admin/myorganization"))) ||
        pathname === "/admin" + item?.routeName
      : pathname === item?.routeName;
  };

  const getFilteredMenuItems = () => {
    const userRoleId = userDetails?.data?.roleId;

    return profileMenu
      ?.filter((item) => {
        if (
          item?.routeName === "/superadmin" &&
          userRoleId !== roleId?.SUPER_ADMIN
        )
          return false;
        if (item?.routeName === "/admin" && userRoleId !== roleId?.ADMIN)
          return false;
        return true;
      })
      .map((item, index) => {
        const isActive = isActiveTabCSS(item);

        return (
          <span
            key={index}
            className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-0.5 ${
              isActive ? "bg-white" : ""
            }`}
            onClick={() => handleProfileSection(item)}
          >
            {item?.name}
          </span>
        );
      });
  };

  return (
    <header
      className={`${
        screen === "normal"
          ? "pt-1.5 pb-2 mb-0 border-b h-[7%] shadow-md"
          : "h-0 overflow-hidden"
      }`}
    >
      <nav className="px-4 sm:flex sm:items-center sm:justify-between h-full">
        <div className="flex items-center gap-3 h-full w-full">
          {pathname !== "/login" ? (
            <div
              className="flex justify-center items-center h-full cursor-pointer"
              onClick={handleHamurger}
            >
              <Icon icon="charm:menu-hamburger" className="text-3xl" />
            </div>
          ) : null}
          <a
            className="focus:outline-none focus:opacity-80 h-full"
            href={
              userDetails?.data?.roleId === roleId?.SUPER_ADMIN
                ? "/superadmin/dashboard"
                : userDetails?.data?.roleId === roleId?.ADMIN
                ? "/admin/dashboard"
                : "/dashboard"
            }
          >
            <img
              src={logo}
              alt=""
              className="h-full aspect-[48/13] -rotate-1"
            />
          </a>
          <div className="sm:hidden">
            <button
              className="w-8 h-8 relative focus:outline-none bg-white rounded"
              onClick={toggleMenu}
            >
              <div className="block w-5 absolute left-1/2 top-1/2   transform  -translate-x-1/2 -translate-y-1/2">
                <span
                  className={`block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
                    open ? "rotate-45" : "-translate-y-1.5"
                  }`}
                ></span>
                <span
                  className={`block absolute  h-0.5 w-5 bg-current   transform transition duration-500 ease-in-out  ${
                    open ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block absolute  h-0.5 w-5 bg-current transform  transition duration-500 ease-in-out ${
                    open ? "-rotate-45" : "translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
          <div
            className={`flex gap-1 items-center justify-center ${
              isSaving ? "visible" : "invisible"
            }`}
          >
            <Icon icon="fluent:arrow-sync-12-filled" className="text-xl" />
            <span>Saving...</span>
          </div>
        </div>
        {getAuthToken() ? (
          <div
            className={`transition-all duration-500 sm:transition-none transform sm:translate-x-0 ${
              open ? "" : "-translate-x-full "
            } sm:block sm:static absolute bg-white w-full z-[2] left-0 border-b sm:border-none p-4 sm:p-0`}
          >
            <div className="flex flex-col gap-5 mt-5 ml-4 sm:mr-4 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
              <ul className="flex flex-col gap-5 mt-5 ml-4 sm:mr-4 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5 ">
                <li
                  className="text-xl font-medium text-black focus:outline-none  cursor-pointer"
                  onClick={() => setLayoutOpen(!layoutOpen)}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon icon="hugeicons:layout-right" />
                    <span className="text-lg font-medium text-black">
                      Layout
                    </span>
                    <Icon
                      icon="iconamoon:arrow-down-2-light"
                      className={`transform ${
                        layoutOpen && "rotate-180"
                      } duration-500 transition-all`}
                    />
                  </span>
                </li>

                <div
                  ref={layoutOpenRef}
                  className={`absolute top-[33px] right-[77px]  z-[2] w-fit shadow-md rounded-xl px-2 pb-2 pt-4 mt-2 bg-[#ececec] transition-all duration-500 transform  flex flex-col ${
                    layoutOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="absolute -top-[8px] right-[14px]  z-[10000] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#ececec]"></div>
                  <div className="flex flex-col">
                    <span
                      className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-2 ${
                        readingPanePlace === "top" && "bg-white"
                      }`}
                      onClick={() => henadleReadingPaneChange("top")}
                    >
                      <Icon icon="tabler:layout-navbar-filled" />
                      <span className="w-full">Show on the top</span>
                    </span>
                    <span
                      className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-2 ${
                        readingPanePlace === "right" && "bg-white"
                      }`}
                      onClick={() => henadleReadingPaneChange("right")}
                    >
                      <Icon
                        icon="tabler:layout-navbar-filled"
                        className="rotate-90"
                      />
                      <span className="w-full">Show on the right</span>
                    </span>
                    <span
                      className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-2 ${
                        readingPanePlace === "bottom" && "bg-white"
                      }`}
                      onClick={() => henadleReadingPaneChange("bottom")}
                    >
                      <Icon
                        icon="tabler:layout-navbar-filled"
                        className="rotate-180"
                      />
                      <span className="w-full">Show on the bottom</span>
                    </span>

                    <span
                      className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-2 ${
                        readingPanePlace === "left" && "bg-white"
                      }`}
                      onClick={() => henadleReadingPaneChange("left")}
                    >
                      <Icon
                        icon="tabler:layout-navbar-filled"
                        className="-rotate-90"
                      />
                      <span className="w-full">Show on the left</span>
                    </span>
                  </div>
                </div>

                <li
                  className="text-xl font-medium text-black focus:outline-none  cursor-pointer "
                  onClick={() => setPopOverOpen(!popOverOpen)}
                >
                  <span className="font-medium w-9 h-9 flex justify-center align-middle">
                    {/* NOTE: User Profilephoto Condition 
                    {userDetails?.data?.profilePhoto ? (
                      <img
                        className="w-full h-full rounded-full  dark:ring-gray-500 object-contain"
                        // src="/pp.jpg"
                        src={userDetails?.data?.profilePhoto}
                        alt=""
                      />
                    ) : ( */}
                    <Icon
                      icon="iconamoon:profile-circle-fill"
                      className="text-neutral-600 text-4xl"
                    />
                    {/* )} */}
                  </span>
                </li>

                <div
                  ref={popOverRef}
                  className={`absolute top-[35px] right-[28px] z-[10000] bg-[#ececec] w-fit shadow-md rounded-xl px-3 py-2 mt-2  transition-all duration-500 transform   ${
                    popOverOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="absolute -top-[8px] right-[14px]  z-[10000] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#ececec]"></div>
                  <div className="flex flex-col">
                    <span
                      className={`flex items-center justify-between gap-2 p-2  rounded-xl my-0.5 `}
                    >
                      {userDetails?.data?.firstName &&
                        userDetails?.data?.firstName +
                          " " +
                          userDetails?.data?.lastName}
                    </span>
                    <Divider width="100%" color="#9CA3AF" opacity={1} />
                    {getFilteredMenuItems()}
                    <Divider width="100%" color="#9CA3AF" opacity={1} />

                    <span
                      className={`flex items-center justify-between gap-2 p-2 hover:cursor-pointer hover:bg-white rounded-xl my-0.5 `}
                      onClick={logout}
                    >
                      Logout
                    </span>
                  </div>
                </div>
              </ul>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
};

export default Header;
