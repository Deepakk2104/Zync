import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Sidebar({ setSelectedChat, setIsGroup }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffec(() => {
    if (!auth.currentUser) return;

    // Listen for all users except current user in this
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs
          .filter((doc) => doc.id !== auth.currentUser.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Listen for groups here
    const unsubGroups = onSnapshot(collection(db, "groups"), (snap) => {
      setGroups(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubGroups();
    };
  }, []);

  return (
    <div className="w-1/4 bg-gray-900 text-white p-4 overflow-y-auto">
      {/* Users Section */}
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {users.length === 0 && (
        <p className="text-gray-400 text-sm">No other users yet</p>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          className="p-2 hover:bg-gray-700 cursor-pointer rounded mb-1"
          onClick={() => {
            setSelectedChat(user.id);
            setIsGroup(false);
          }}
        >
          <div className="flex justify-between items-center">
            <span>{user.name || user.email}</span>
            {user.online ? (
              <span className="ml-2 text-green-400 text-xs">● Online</span>
            ) : (
              <span className="ml-2 text-gray-500 text-xs">
                Last seen:{" "}
                {user.lastSeen
                  ? user.lastSeen.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Groups Section */}
      <h2 className="text-xl font-bold mt-6 mb-2">Groups</h2>
      {groups.length === 0 && (
        <p className="text-gray-400 text-sm">No groups yet</p>
      )}
      {groups.map((group) => (
        <div
          key={group.id}
          className="p-2 hover:bg-gray-700 cursor-pointer rounded mb-1"
          onClick={() => {
            setSelectedChat(group.id);
            setIsGroup(true);
          }}
        >
          {group.name}
        </div>
      ))}
    </div>
  );
}
