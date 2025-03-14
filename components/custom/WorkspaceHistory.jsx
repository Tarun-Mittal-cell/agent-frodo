"use client";
import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import React, { useContext, useEffect, useState } from "react";
import { useSidebar } from "../ui/sidebar";
import Link from "next/link";

function WorkspaceHistory() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const convex = useConvex();
  const [workspaceList, setWorkspaceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (userDetail?._id) {
      GetAllWorkspace();
    }
  }, [userDetail]);

  const GetAllWorkspace = async () => {
    try {
      setIsLoading(true);
      const result = await convex.query(api.workspace.GetAllWorkspace, {
        userId: userDetail?._id,
      });

      // Handle the correct structure from the updated API response
      // The API now returns { workspaces: [...], continueCursor: string }
      if (result && result.workspaces) {
        setWorkspaceList(result.workspaces);
      } else {
        // Fallback in case the structure is different
        setWorkspaceList(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaceList([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-medium text-lg">Your Chats</h2>
      {isLoading ? (
        <div className="py-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div>
          {Array.isArray(workspaceList) && workspaceList.length > 0 ? (
            workspaceList.map((workspace, index) => (
              <Link
                href={"/workspace/" + workspace?._id}
                key={workspace?._id || index}
              >
                <h2
                  onClick={toggleSidebar}
                  className="text-sm text-gray-400 my-4 font-light cursor-pointer hover:text-white truncate max-w-[200px]"
                  title={workspace?.messages?.[0]?.content || "New chat"}
                >
                  {workspace?.messages?.[0]?.content || "New chat"}
                </h2>
              </Link>
            ))
          ) : (
            <div className="py-4 text-sm text-gray-400">No chats yet</div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkspaceHistory;
