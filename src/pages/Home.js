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
    toast.success('Generated new unique collaboration Room ID!');
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
            <span className="heroSpark">⚡</span>
            <h1>CodeCollab<span className="logoAccent">AI</span></h1>
          </div>
          <p className="heroSubtitle">
            Next-Generation Collaborative Cloud IDE with Machine Learning Code Quality & Defect Prediction
          </p>
        </div>

        <div className="formWrapper">
          <h3 className="formTitle">Join or Create Workspace</h3>
          <p className="formDesc">Connect with your team in real-time or spin up a new peer room.</p>

          <div className="inputGroup">
            <label className="inputLabel">ROOM ID</label>
            <input
              type="text"
              className="inputBox"
              placeholder="e.g. 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
            />

            <label className="inputLabel">YOUR USERNAME</label>
            <input
              type="text"
              className="inputBox"
              placeholder="e.g. Alex (Frontend Lead)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleInputEnter}
            />

            <button className="btn joinBtn" onClick={joinRoom}>
              🚀 Launch Workspace
            </button>

            <div className="createPrompt">
              <span>Need a fresh room? </span>
              <button type="button" onClick={createNewRoom} className="createLinkBtn">
                Generate Instant Room
              </button>
            </div>
          </div>
        </div>

        <div className="featureCardsGrid">
          <div className="featureCard">
            <span className="featIcon">⚡</span>
            <h4>Real-Time Concurrency</h4>
            <p>Low-latency WebSocket room synchronization with multi-client presence tracking.</p>
          </div>
          <div className="featureCard">
            <span className="featIcon">📊</span>
            <h4>ML Defect Prediction</h4>
            <p>Predicts code defect probability, Halstead volume, and McCabe Cyclomatic Complexity (M = E - N + 2P).</p>
          </div>
          <div className="featureCard">
            <span className="featIcon">🤖</span>
            <h4>AI Code Copilot</h4>
            <p>Instant algorithmic Big-O breakdown, security audits, and automated test suite generation.</p>
          </div>
          <div className="featureCard">
            <span className="featIcon">💻</span>
            <h4>In-Browser Execution</h4>
            <p>Integrated sandbox console with runtime exception tracking and execution duration telemetry.</p>
          </div>
        </div>

        <footer className="homeFooter">
          <p>
            Academic Capstone Project &bull; Built with React, Node.js, Socket.IO &amp; Machine Learning Engine
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
