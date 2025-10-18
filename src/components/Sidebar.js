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

    // Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs
          .filter((doc) => doc.id !== auth.currentUser.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Groups
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
    <div className="w-1/4 bg-gray-900 text-white p-4 overflow-y-auto">
      {/* Users */}
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

      {/* Groups */}
      <h2 className="text-xl font-bold mt-6 mb-2 flex justify-between items-center">
        Groups
        <button
          onClick={() => setShowInput(!showInput)}
          className="px-2 py-1 bg-green-500 text-sm rounded hover:bg-green-600"
        >
          + Create
        </button>
      </h2>

      {showInput && (
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            className="p-1 rounded text-black"
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex flex-col max-h-40 overflow-y-auto border p-2 rounded bg-gray-800">
            {users.map((user) => (
              <label key={user.id} className="flex items-center gap-2 mb-1">
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
            className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
            onClick={createGroup}
          >
            Add Group
          </button>
        </div>
      )}

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
