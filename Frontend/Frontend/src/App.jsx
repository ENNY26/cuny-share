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
import UserProfile from '../pages/UserProfile.jsx';
import SavedListings from '../pages/SavedListings.jsx';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="main-home" element={<MainHome />} />
        <Route path="/notes" element={<NoteList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/upload-note" element={<UploadNote />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/saved" element={<SavedListings />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} />
    </BrowserRouter>
  );
};

export default App;
