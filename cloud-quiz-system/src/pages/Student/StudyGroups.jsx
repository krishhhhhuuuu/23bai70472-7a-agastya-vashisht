import { useState, useEffect, useContext } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AuthContext } from "../../context/AuthContext";
import { ToastContext } from "../../context/ToastContext";
import { getUserById } from "../../services/userService";

export default function StudyGroups() {
  const { currentUser } = useContext(AuthContext);
  const { error } = useContext(ToastContext);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const groupsSnapshot = await getDocs(collection(db, "studyGroups"));
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadMessages = (groupId) => {
    const messagesRef = collection(db, "studyGroups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const user = await getUserById(data.userId);
          return {
            id: doc.id,
            ...data,
            userEmail: user?.email || "Unknown"
          };
        })
      );
      setMessages(messagesData);
    });

    return unsubscribe;
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await addDoc(collection(db, "studyGroups"), {
        name: newGroupName,
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        members: [currentUser.uid]
      });

      setNewGroupName("");
      setShowCreateGroup(false);
      loadGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      error("Error creating group", 3000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await addDoc(collection(db, "studyGroups", selectedGroup.id, "messages"), {
        text: newMessage,
        userId: currentUser.uid,
        timestamp: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px', gap: '20px' }}>
      {/* Groups List */}
      <div style={{ width: '300px', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '16px' }}>Study Groups</h3>
          <button 
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            + Create Group
          </button>
        </div>

        {showCreateGroup && (
          <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <form onSubmit={createGroup}>
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1 }}>Create</button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateGroup(false)}
                  style={{ flex: 1, background: '#64748b' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ overflowY: 'auto', height: 'calc(100% - 140px)' }}>
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                background: selectedGroup?.id === group.id ? '#ede9fe' : 'transparent',
                borderBottom: '1px solid #e2e8f0',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{group.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedGroup ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3>{selectedGroup.name}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  style={{ 
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: msg.userId === currentUser.uid ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.userId === currentUser.uid ? '#667eea' : 'white',
                    color: msg.userId === currentUser.uid ? 'white' : '#1e293b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {msg.userId !== currentUser.uid && (
                      <div style={{ 
                        fontSize: '12px', 
                        marginBottom: '4px',
                        opacity: 0.8,
                        fontWeight: '600'
                      }}>
                        {msg.userEmail}
                      </div>
                    )}
                    <div>{msg.text}</div>
                    <div style={{ 
                      fontSize: '11px', 
                      marginTop: '4px',
                      opacity: 0.7
                    }}>
                      {msg.timestamp?.toDate().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#64748b'
          }}>
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
