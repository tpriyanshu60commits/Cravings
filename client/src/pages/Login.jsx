import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
const Login = () => {
  const navigate = useNavigate();
  const { setIsLogin, setRole, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, isloading] = useState(false);
  const [showPassword, setshowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validateForm(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      isloading(false);
      return;
    }
    setErrors({});
    isloading(true);

    console.log("Form data : ", formData);
    const paylaod = {
      ...formData,
      email: formData.email.toLowerCase(),
    };
    console.log("paylaod", paylaod);

    try {
      const res = await api.post("/auth/login", paylaod);
      console.log(res);
      //   console.log(res.data);
      toast.success(res.data.message);
      sessionStorage.setItem("cravingUSer", JSON.stringify(res.data.data));
      setUser(res.data.data);
      setIsLogin(true);
      setRole(res.data.data.userType);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during Login. Please try again.",
      );
    } finally {
      isloading(false);
    }
  };

  return (
    <>
      <div className="h-screen bg-[url('/login.avif')] bg-cover flex items-center justify-start p-5">
        <div className="w-100 border rounded-xl p-5 mx-6 bg-(--color-base-100)">
          <h1 className="text-3xl font-bold text-(--color-primary) mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-(--color-secondary) text-center mb-6">
            Login to your Cravings account
          </p>
          {/* loginForm */}
          {/* email */}
          <form onSubmit={handleSubmit}>
            <div className="mt-5 mb-5">
              <label className="block text-(--color-neutral) font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm text-(--color-neutral) "
              />
              {errors.email && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>
            {/* password */}
            <div className="mt-5 mb-5">
              <div className="relative">
                <label className="block text-(--color-neutral) font-semibold mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  name="password"
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm text-(--color-neutral) "
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-2.5"
                  onClick={() => setshowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="text-(--color-error) text-xs mt-1 block">
                  {errors.password}
                </span>
              )}
            </div>
            {/* remember me and forgot password */}
            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 cursor-pointer text-(--color-secondary)">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="cursor-pointer"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <div className="text-sm text-(--color-primary) hover:underline transition-colors">
                {" "}
                Forgot Password?
              </div>
            </div>
            {/* button */}
            <button
              type="submit"
              className="w-full py-3 bg-(--color-primary)  text-white font-semibold rounded-md"
            >
              {loading ? "Login..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
