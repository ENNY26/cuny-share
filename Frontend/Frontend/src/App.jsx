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
import ProductDetail from '../pages/ProductDetail';
import UserProfile from '../pages/UserProfile';

import './App.css';
import TextbookList from '../pages/TextbookList';
import Messages from '../pages/Messages';



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
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
