import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Dashboard/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Expense from './pages/Dashboard/Expense'
import Income from './pages/Dashboard/Income'
import Profile from './pages/Dashboard/Profile'
import { UserProvider } from './context/userContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'  // ADD THIS
import { Toaster } from 'react-hot-toast';

import AIInsights from './pages/Dashboard/AIInsights.jsx'
import Auth from './pages/Auth/Auth.jsx'

const App = () => {
  return (
    <UserProvider>
      <CurrencyProvider>  
        <div>
          <Router>
            <Routes>
              <Route path='/' element={<Root />} />
               <Route path='/auth' exact element={<Auth/>}/>
              {/* <Route path='/login' exact element={<Login />} />
              <Route path='/signup' exact element={<Signup />} /> */}
              <Route path='/expense' exact element={<Expense />} />
              <Route path='/income' exact element={<Income />} />
              <Route path='/dashboard' exact element={<Home />} />
              <Route path='/profile' exact element={<Profile />} />
              {/* <Route path='/ai-insights' exact element={<AIInsights />} /> */}
              
            </Routes>
          </Router>
        </div>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: '13px'
            },
          }}
        />
      </CurrencyProvider>
    </UserProvider>
  )
}

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token")
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
}

export default App
