import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from '../pages/Home.jsx';
import MainHome from '../pages/MainHome.jsx';
import NoteList from '../pages/NoteList.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import UploadNote from '../pages/UploadNote.jsx';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import UserProfile from '../pages/UserProfile.jsx';
import SavedListings from '../pages/SavedListings.jsx';
import Messages from '../pages/Messages.jsx';
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx';
import TermsOfService from '../pages/TermsOfService.jsx';
import CommunityGuidelines from '../pages/CommunityGuidelines.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main-home" element={<MainHome />} />
        <Route path="/notes" element={<NoteList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route 
          path="/upload-note" 
          element={
            <ProtectedRoute>
              <UploadNote />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/community-guidelines" element={<CommunityGuidelines />} />
        <Route 
          path="/profile/:id" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saved" 
          element={
            <ProtectedRoute>
              <SavedListings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} />
    </BrowserRouter>
  );
};

export default App;
