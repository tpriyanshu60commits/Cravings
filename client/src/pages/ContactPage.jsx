import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoSend } from "react-icons/io5";

const ContactPage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!data.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (data.phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }

    if (!data.subject.trim()) newErrors.subject = "Subject is required";
    if (!data.message.trim()) newErrors.message = "Message is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validateForm(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    try {
      const res = await api.post("/public/contact-us", payload);
      toast.success(res.data.message || "Message sent successfully!");

      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-base-200) py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-(--color-base-content)">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-(--color-secondary) max-w-xl mx-auto">
            Have a question, feedback, or need help with your order? Our support team is here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs flex items-start gap-4">
              <div className="p-3 rounded-xl bg-(--color-primary)/10 text-(--color-primary) text-xl">
                <IoMailOutline />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Email Us</h3>
                <p className="text-xs text-(--color-secondary) mt-0.5">support@cravings.com</p>
                <p className="text-xs text-(--color-secondary)">24/7 dedicated support</p>
              </div>
            </div>

            <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs flex items-start gap-4">
              <div className="p-3 rounded-xl bg-(--color-primary)/10 text-(--color-primary) text-xl">
                <IoCallOutline />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Call Us</h3>
                <p className="text-xs text-(--color-secondary) mt-0.5">+91 98765 43210</p>
                <p className="text-xs text-(--color-secondary)">Mon-Sun, 9am - 11pm</p>
              </div>
            </div>

            <div className="bg-(--color-base-100) p-5 rounded-2xl border border-(--color-base-300) shadow-xs flex items-start gap-4">
              <div className="p-3 rounded-xl bg-(--color-primary)/10 text-(--color-primary) text-xl">
                <IoLocationOutline />
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-base-content)">Headquarters</h3>
                <p className="text-xs text-(--color-secondary) mt-0.5">Cravings Food Tech Pvt Ltd</p>
                <p className="text-xs text-(--color-secondary)">Bhopal, Madhya Pradesh, India</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-(--color-base-100) p-6 sm:p-8 rounded-2xl border border-(--color-base-300) shadow-sm">
            <h2 className="text-xl font-bold text-(--color-base-content) mb-1">
              Send us a Message
            </h2>
            <p className="text-xs text-(--color-secondary) mb-6">
              Fill in the form below and our team will get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  />
                  {errors.fullName && (
                    <span className="text-(--color-error) text-xs mt-1 block">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  />
                  {errors.email && (
                    <span className="text-(--color-error) text-xs mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  />
                  {errors.phone && (
                    <span className="text-(--color-error) text-xs mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Order Inquiry / Partnership"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                  />
                  {errors.subject && (
                    <span className="text-(--color-error) text-xs mt-1 block">
                      {errors.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-(--color-neutral) mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-(--color-neutral) focus:outline-none focus:ring-1 focus:ring-(--color-primary) resize-none"
                />
                {errors.message && (
                  <span className="text-(--color-error) text-xs mt-1 block">
                    {errors.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-(--color-primary) text-(--color-primary-content) text-sm font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LuLoaderCircle className="animate-spin text-base" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <IoSend className="text-sm" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
