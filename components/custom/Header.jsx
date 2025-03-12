"use client";

import React, { useContext, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Colors from "@/data/Colors";
import { UserDetailContext } from "@/context/UserDetailContext";
import Link from "next/link";
import { LucideDownload, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";
import { ActionContext } from "@/context/ActionContext";
import SignInDialog from "./SignInDialog";

function Header() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  // Safe sidebar usage with optional chaining to prevent errors
  const sidebarContext = React.useContext(
    typeof window !== "undefined"
      ? window.__SIDEBAR_CONTEXT__ || {
          toggleSidebar: () => console.log("Sidebar not available"),
        }
      : { toggleSidebar: () => console.log("Sidebar not available") }
  );
  const toggleSidebar = () => {
    try {
      if (typeof sidebarContext?.toggleSidebar === "function") {
        sidebarContext.toggleSidebar();
      }
    } catch (e) {
      console.log("Sidebar toggle not available");
    }
  };

  const { action, setAction } = useContext(ActionContext);
  const path = usePathname();
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  const onActionBtn = (action) => {
    setAction({
      actionType: action,
      timeStamp: Date.now(),
    });
  };

  return (
    <div className="p-4 flex justify-between items-center border-b">
      <Link
        href={"/"}
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <div className="relative w-10 h-10">
          <Image
            src={"/logo.png"}
            alt="Home"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="ml-2 font-semibold text-lg">Frodo</span>
      </Link>

      {!userDetail?.name ? (
        <div className="flex gap-5">
          <Button variant="ghost" onClick={setOpenLoginDialog}>
            Sign In
          </Button>
          <Button
            onClick={setOpenLoginDialog}
            className="text-white"
            style={{ backgroundColor: Colors.BLUE }}
          >
            Get Started
          </Button>
        </div>
      ) : (
        path?.includes("workspace") && (
          <div className="flex gap-2 items-center">
            <Button variant="ghost" onClick={() => onActionBtn("export")}>
              <LucideDownload /> Export
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => onActionBtn("deploy")}
            >
              <Rocket /> Deploy
            </Button>
          </div>
        )
      )}

      {userDetail && (
        <Image
          src={userDetail?.picture}
          alt="user"
          width={30}
          height={30}
          className="rounded-full w-[30px] cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      <SignInDialog
        openDialog={openLoginDialog}
        closeDialog={setOpenLoginDialog}
      />
    </div>
  );
}

export default Header;
