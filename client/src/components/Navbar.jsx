import React from "react";
import { useState } from "react";
import api from "../config/ApiConfig";
import {useAuth} from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const {user, setUser, isLogin, setIsLogin, role, setRole} = useAuth();
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (role === "restaurant") {
      navigate("/restaurant-dashboard");
    } else if (role === "rider") {
      navigate("/rider-dashboard");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };
  const handleLogout = async()=>{
    try {
      const res = await api.get("/auth/logout");
    toast.success(res.data.message);
    sessionStorage.removeItem("cravingUser");
    setUser(null);
    setIsLogin(false);
    setRole(null);
    navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unknown error occurred during registration. Please try again.",
      )
    }
  } 
  return (
    <>
      <div>Navbar</div>
    </>
  );
};

export default Navbar;
