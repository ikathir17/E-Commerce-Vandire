import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '$';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className='min-h-screen bg-gray-100'>
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} setSidebarOpen={setIsMenuOpen} />
          
          {/* Main content */}
          <div className='flex-1 flex flex-col overflow-hidden'>

            {/* Main content body */}
            <main className='flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6'>
              <div className='max-w-full mx-auto'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <Routes>
                    <Route path='/' element={<Navigate to='/orders' replace />} />
                    <Route path='/add' element={<Add token={token} />} />
                    <Route path='/list' element={<List token={token} />} />
                    <Route path='/orders' element={<Orders token={token} />} />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  )
}

export default App