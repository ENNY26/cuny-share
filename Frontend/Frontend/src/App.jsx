// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import MainHome from '../pages/MainHome';
import NoteList from '../pages/NoteList';
import UploadNote from '../pages/UploadNote'; 
import TextbookUpload from '../components/TextbookUpload';
import SwipeView from '../pages/SwipeView';

import './App.css';
import TextbookList from '../pages/TextbookList';



function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/mainHome" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/mainHome" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/mainHome" />} />

        {/* Protected routes */}
        <Route path="/mainHome" element={user ? <MainHome /> : <Navigate to="/login" />} />
        <Route path="/notes" element={user ? <NoteList /> : <Navigate to="/login" />} />
        <Route path="/upload-note" element={user ? <UploadNote /> : <Navigate to="/login" />} />

        <Route path="/textbooks" element={<TextbookList />} />
        <Route path="/textbooks/upload" element={<TextbookUpload />} />
        <Route path="/swipe" element={<SwipeView />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
