import React from 'react'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';
import Home from './Dashboard/Home';
import Income from './Dashboard/Income';
import Expense from './Dashboard/Expense';
import UserProvider from './context/userContext';

function App() {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Root />}/>
          <Route path='/login' exact element={<Login />}/>
          <Route path='/signUp' exact element={<Signup />}/>
          <Route path='/dashboard' exact element={<Home />}/>
          <Route path='/income' exact element={<Income />}/>
          <Route path='/expense' exact element={<Expense />}/>
        </Routes>
      </Router>
    </div>
    </UserProvider>
  )
}

export default App


const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ?(
    <Navigate to={"/dashboard"}/>
  ) : (
    <Navigate to={"/login"}/>
  )
}