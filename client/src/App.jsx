import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PasswordChangeModal from "./components/commonModals/PasswordChangeModal";
const App = () => {
  return (
    <>
    <Toaster/>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/passwordChangeModal" element={<PasswordChangeModal/>}/>
      </Routes>
    </>
  );
};

export default App;
