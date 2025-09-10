import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./Chatwindow";
import GroupChat from "./Groupchat";
import { auth, setUserOnlineStatus } from "../firebase";

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Mark user online on mount
    setUserOnlineStatus(auth.currentUser.uid, true);

    // Mark user offline on unmount
    return () => setUserOnlineStatus(auth.currentUser.uid, false);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSelectedChat={setSelectedChat} setIsGroup={setIsGroup} />
      {selectedChat ? (
        isGroup ? (
          <GroupChat groupId={selectedChat} />
        ) : (
          <ChatWindow chatId={selectedChat} />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          Select a user or group to start chatting 💬
        </div>
      )}
    </div>
  );
}
