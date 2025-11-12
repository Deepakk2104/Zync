import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";

export default function Sidebar({ setSelectedChat, setIsGroup }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs
          .filter((doc) => doc.id !== auth.currentUser.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    const unsubGroups = onSnapshot(collection(db, "groups"), (snap) => {
      setGroups(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubGroups();
    };
  }, []);

  const toggleMemberSelection = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const members = [auth.currentUser.uid, ...selectedMembers];
    await addDoc(collection(db, "groups"), {
      name: newGroupName,
      members,
      createdAt: new Date(),
    });
    setNewGroupName("");
    setSelectedMembers([]);
    setShowInput(false);
  };

  return (
    <div
      className="w-1/4 flex flex-col overflow-y-auto shadow-lg"
      style={{
        background:
          "linear-gradient(180deg, #7c3aed 0%, #6d28d9 40%, #5b21b6 100%)",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo / Header */}
      <div className="flex items-center mb-6 px-5 pt-5">
        <div className="w-10 h-10 bg-white rounded-full mr-3 flex items-center justify-center text-purple-700 font-bold text-lg shadow-sm">
          Z
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Zyncc</h1>
      </div>

      {/* Users Section */}
      <div className="px-5">
        <h2 className="text-lg font-semibold mb-2 border-b border-purple-500 pb-1">
          Chats
        </h2>

        {users.length === 0 ? (
          <p className="text-purple-200 text-sm mb-4">No users yet</p>
        ) : (
          <div className="space-y-1 mb-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-2 rounded-lg hover:bg-purple-700/50 cursor-pointer flex items-center justify-between transition-all"
                onClick={() => {
                  setSelectedChat(user.id);
                  setIsGroup(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      user.photoURL ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-purple-300"
                  />
                  <div>
                    <p className="truncate text-sm font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-purple-200">
                      {user.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                {user.online ? (
                  <span className="text-green-400 text-xs">●</span>
                ) : (
                  <span className="text-purple-300 text-xs">○</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Groups Section */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-2 border-b border-purple-500 pb-1">
          <h2 className="text-lg font-semibold">Groups</h2>
          <button
            onClick={() => setShowInput(!showInput)}
            className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-xs font-semibold transition-all"
          >
            + Create
          </button>
        </div>

        {/* Create Group Box */}
        {showInput && (
          <div className="flex flex-col gap-2 mb-4 bg-purple-800/60 p-3 rounded-lg animate-fade-in backdrop-blur-md">
            <input
              type="text"
              className="p-2 rounded text-gray-900 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Enter group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <div className="flex flex-col max-h-32 overflow-y-auto border border-purple-600 p-2 rounded bg-purple-900/50">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 mb-1 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMemberSelection(user.id)}
                  />
                  <span>{user.name || user.email}</span>
                </label>
              ))}
            </div>
            <button
              onClick={createGroup}
              className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded text-sm font-medium hover:opacity-90 transition-all"
            >
              Create Group
            </button>
          </div>
        )}

        {/* Groups List */}
        {groups.length === 0 ? (
          <p className="text-purple-200 text-sm">No groups yet</p>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-2 rounded-lg hover:bg-purple-700/50 cursor-pointer flex justify-between items-center transition-all"
                onClick={() => {
                  setSelectedChat(group.id);
                  setIsGroup(true);
                }}
              >
                <span className="truncate text-sm font-medium">
                  {group.name}
                </span>
                <span className="text-purple-300 text-xs">
                  {group.members?.length || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto text-center text-xs text-purple-200 py-4 border-t border-purple-700/60">
        <p>Zyncc © 2025</p>
      </div>
    </div>
  );
}
