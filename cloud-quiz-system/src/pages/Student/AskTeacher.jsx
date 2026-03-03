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
import { getAllUsers } from "../../services/userService";

export default function AskTeacher() {
  const { currentUser } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      loadMessages(selectedTeacher.id);
    }
  }, [selectedTeacher]);

  const loadTeachers = async () => {
    try {
      const users = await getAllUsers();
      const teachersList = users.filter(u => u.role === 'teacher');
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const loadMessages = (teacherId) => {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(msg => 
          msg.participants.includes(teacherId) && 
          msg.participants.includes(currentUser.uid)
        );
      setMessages(messagesData);
    });

    return unsubscribe;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeacher) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        receiverId: selectedTeacher.id,
        participants: [currentUser.uid, selectedTeacher.id],
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '600px', gap: '20px' }}>
      {/* Teachers List */}
      <div style={{ width: '300px', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3>Teachers</h3>
        </div>

        <div style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
          {teachers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              No teachers available
            </div>
          ) : (
            teachers.map(teacher => (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  background: selectedTeacher?.id === teacher.id ? '#ede9fe' : 'transparent',
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {teacher.email}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Teacher
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedTeacher ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3>Chat with {selectedTeacher.email}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    style={{ 
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: msg.senderId === currentUser.uid ? '#667eea' : 'white',
                      color: msg.senderId === currentUser.uid ? 'white' : '#1e293b',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
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
                ))
              )}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Ask your question..."
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
            Select a teacher to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
