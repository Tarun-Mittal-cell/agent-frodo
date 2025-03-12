"use client";

import { MongoDBProvider } from "./MongoDBProvider";
import { UserDetailProvider } from "../context/UserDetailContext";
import { MessagesProvider } from "../context/MessagesContext";
import { ActionProvider } from "../context/ActionContext";

export default function ClientProviders({ children }) {
  return (
    <MongoDBProvider>
      <UserDetailProvider>
        <MessagesProvider>
          <ActionProvider>{children}</ActionProvider>
        </MessagesProvider>
      </UserDetailProvider>
    </MongoDBProvider>
  );
}
