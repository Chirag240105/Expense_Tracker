import React from 'react'
import { BrowserRouter as Router , Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Dashboard/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Expense from './pages/Dashboard/Expense'
import Income from './pages/Dashboard/Income'
import { UserProvider } from './context/userContext.jsx'
import {Toaster} from 'react-hot-toast';
import Forgot from './pages/ForgetPass.jsx/Forgot.jsx'
const App = () => {
  return (
    <UserProvider>
    <div>
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' exact element={<Login/>}/>
        <Route path='/signup' exact element={<Signup/>}/>
        <Route path='/expense' exact element={<Expense/>}/>
        <Route path='/income' exact element={<Income/>}/>
        <Route path='/dashboard' exact element={<Home/>}/>
        <Route path='/forgot-password' exact element={<Forgot/>}/>
      </Routes>
    </Router>
    </div>
    <Toaster
    toastOptions={{
      className: "",
      style:{
        fontSize: '13px'
      },
    }}
    />
    </UserProvider>
  )
}

export default App

const Root = () =>{
  const isAuthenticated = !!localStorage.getItem("token")

  return isAuthenticated? <Navigate to="/dashboard"/> : <Navigate to="/login"/>
}