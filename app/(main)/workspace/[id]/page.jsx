"use client";
import ChatView from "@/components/custom/ChatView";
import CodeView from "@/components/custom/CodeView";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

function Workspace() {
  return (
    <SidebarProvider>
      <div className="p-3 pr-5 mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ChatView />
          <div className="col-span-2">
            <CodeView />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Workspace;
