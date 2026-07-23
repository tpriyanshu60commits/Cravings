import React from "react";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";
import { Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <>
    <Toaster/>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
