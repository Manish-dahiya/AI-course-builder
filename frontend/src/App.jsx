import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CoursePage from '../pages/CoursePage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
            <Home />
          </ProtectedRoute>} 
          > </Route>
          <Route path="/login" element={ <LoginPage />}  ></Route>
          <Route path="course/:id" element={<ProtectedRoute> <CoursePage /></ProtectedRoute>} ></Route>

        </Routes>
      </BrowserRouter>
    </>

  );
}

export default App;

