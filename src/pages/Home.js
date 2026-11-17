import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Generated new Room ID');
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error('Both Room ID and Username are required');
      return;
    }

    navigate(`/editor/${roomId.trim()}`, {
      state: {
        username: username.trim()
      }
    });
  };

  const handleInputEnter = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="homeContainer">
        <div className="brandHero">
          <div className="heroLogo">
            <h1>CodeCollab</h1>
          </div>
          <p className="heroSubtitle">
            Real-Time Collaborative Code Editor
          </p>
        </div>

        <div className="formWrapper">
          <h3 className="formTitle">Join Workspace</h3>
          <p className="formDesc">Paste an invitation Room ID or generate a new one.</p>

          <div className="inputGroup">
            <label className="inputLabel">ROOM ID</label>
            <input
              type="text"
              className="inputBox"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
            />

            <label className="inputLabel">USERNAME</label>
            <input
              type="text"
              className="inputBox"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleInputEnter}
            />

            <button className="btn joinBtn" onClick={joinRoom}>
              Join Room
            </button>

            <div className="createPrompt">
              <span>Don't have an ID? </span>
              <button type="button" onClick={createNewRoom} className="createLinkBtn">
                Generate Room ID
              </button>
            </div>
          </div>
        </div>

        <footer className="homeFooter">
          <p>
            CodeCollab &bull; Real-Time Multiplayer Code Workspace
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
