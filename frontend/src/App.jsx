import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';

function App() {
  const [user, setUser] = useState({
    username: '',
    roomId: '',
    joined: false
  });

  const handleJoin = (username, roomId) => {
    setUser({
      username,
      roomId,
      joined: true
    });
  };

  const handleLogout = () => {
    setUser({
      username: '',
      roomId: '',
      joined: false
    });
  };

  return (
    <div className="App">
      {!user.joined ? (
        <LoginScreen onJoin={handleJoin} />
      ) : (
        <ChatInterface
          username={user.username}
          roomId={user.roomId}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
