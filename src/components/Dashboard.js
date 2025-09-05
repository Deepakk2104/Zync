import React, { useState } from "react";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import GroupChat from "./GroupChat";
import { auth, setUserOnlineStatus } from "../firebase";

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    setUserOnlineStatus(auth.currentUser.uid, true);
    return () => setUserOnlineStatus(auth.currentUser.uid, false);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar setSelectedChat={setSelectedChat} setIsGroup={setIsGroup} />
      {selectedChat ? (
        isGroup ? (
          <GroupChat groupId={selectedChat} />
        ) : (
          <ChatWindow chatId={selectedChat} />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
