"use client";

import { MongoDBProvider } from "./MongoDBProvider";
import { UserDetailProvider } from "../context/UserDetailContext";
import { MessagesProvider } from "../context/MessagesContext";

export default function ClientProviders({ children }) {
  return (
    <MongoDBProvider>
      <UserDetailProvider>
        <MessagesProvider>{children}</MessagesProvider>
      </UserDetailProvider>
    </MongoDBProvider>
  );
}
