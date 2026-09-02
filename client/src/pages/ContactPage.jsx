import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";
import {
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoSend,
  IoPersonOutline,
  IoChatboxOutline,
  IoBookmarkOutline,
} from "react-icons/io5";
import heroFoodBowl from "../assets/hero/hero_food_bowl.jpg";
import heroTomatoSlice from "../assets/hero/hero_tomato_slice.jpg";
import heroCherryTomato from "../assets/hero/hero_cherry_tomato.jpg";
import heroBasilLeaves from "../assets/hero/hero_basil_leaves.jpg";

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
    <div className="min-h-screen bg-[#092723] text-white py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start relative z-10">
        
        {/* ── Left Column: Contact Details & Culinary Visual ───────── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div>
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#ea580c] text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
              <span>WE ARE HERE TO HELP</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              Get in <span className="text-[#ea580c]">Touch</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-[#a5c7be] leading-relaxed max-w-md mb-8 font-normal">
              Have a question, feedback, or need help with an order? Our support team is here for you.
            </p>

            {/* 3 Contact Info Cards */}
            <div className="space-y-4">
              {/* Email Us */}
              <div className="bg-[#07221e]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-teal-800/40 shadow-xl flex items-center gap-4 hover:border-orange-500/40 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#fff4ed] border-2 border-orange-200/80 text-[#ea580c] flex items-center justify-center text-xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <IoMailOutline />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ea580c] transition-colors">
                    Email Us
                  </h3>
                  <p className="text-xs text-[#8faea7] mt-0.5">support@cravings.com</p>
                  <p className="text-xs text-[#8faea7]">24/7 dedicated support</p>
                </div>
              </div>

              {/* Call Us */}
              <div className="bg-[#07221e]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-teal-800/40 shadow-xl flex items-center gap-4 hover:border-orange-500/40 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#fff4ed] border-2 border-orange-200/80 text-[#ea580c] flex items-center justify-center text-xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <IoCallOutline />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ea580c] transition-colors">
                    Call Us
                  </h3>
                  <p className="text-xs text-[#8faea7] mt-0.5">+91 98765 43210</p>
                  <p className="text-xs text-[#8faea7]">Mon-Sun: 9am - 11pm</p>
                </div>
              </div>

              {/* Headquarters */}
              <div className="bg-[#07221e]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-teal-800/40 shadow-xl flex items-center gap-4 hover:border-orange-500/40 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#fff4ed] border-2 border-orange-200/80 text-[#ea580c] flex items-center justify-center text-xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <IoLocationOutline />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ea580c] transition-colors">
                    Headquarters
                  </h3>
                  <p className="text-xs text-[#8faea7] mt-0.5">Cravings Tech Pvt. Ltd.</p>
                  <p className="text-xs text-[#8faea7]">Bhopal, Madhya Pradesh, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left Culinary Visual */}
          <div className="relative pt-6 hidden sm:block">
            {/* Floating garnishes */}
            <div className="absolute top-2 left-6 z-20 w-8 aspect-square rounded-full overflow-hidden shadow-md rotate-[-20deg] pointer-events-none select-none">
              <img src={heroTomatoSlice} alt="garnish" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 right-12 z-20 w-9 aspect-square rounded-full overflow-hidden shadow-md rotate-[30deg] pointer-events-none select-none">
              <img src={heroCherryTomato} alt="garnish" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 left-1/3 z-20 w-7 aspect-square rounded-full overflow-hidden shadow-md rotate-[45deg] pointer-events-none select-none">
              <img src={heroBasilLeaves} alt="garnish" className="w-full h-full object-cover" />
            </div>

            <div className="w-44 sm:w-52 aspect-square rounded-full bg-gradient-to-tr from-[#ea580c] to-amber-500 p-2 shadow-2xl overflow-hidden">
              <img
                src={heroFoodBowl}
                alt="Gourmet Food"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Send us a Message Card ─────────────────── */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#ea580c] via-[#f26522] to-[#ea580c] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/50 text-white border border-orange-400/30">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                Send us a Message
              </h2>
              <p className="text-xs sm:text-sm text-white/95 font-medium mb-6 sm:mb-8">
                Fill in the form below and our team will get back to you shortly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="w-full pl-9 pr-3.5 py-3 text-xs sm:text-sm bg-[#fff8f2] text-stone-900 border border-orange-200/80 rounded-xl sm:rounded-2xl shadow-inner placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/30 focus:bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.fullName && (
                      <span className="text-red-200 bg-red-900/40 px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-1.5 inline-block">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3.5 py-3 text-xs sm:text-sm bg-[#fff8f2] text-stone-900 border border-orange-200/80 rounded-xl sm:rounded-2xl shadow-inner placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/30 focus:bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-200 bg-red-900/40 px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-1.5 inline-block">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <IoCallOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-3.5 py-3 text-xs sm:text-sm bg-[#fff8f2] text-stone-900 border border-orange-200/80 rounded-xl sm:rounded-2xl shadow-inner placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/30 focus:bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <span className="text-red-200 bg-red-900/40 px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-1.5 inline-block">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Subject *
                    </label>
                    <div className="relative">
                      <IoBookmarkOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none" />
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="e.g. Order Inquiry / Partnership"
                        className="w-full pl-9 pr-3.5 py-3 text-xs sm:text-sm bg-[#fff8f2] text-stone-900 border border-orange-200/80 rounded-xl sm:rounded-2xl shadow-inner placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/30 focus:bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.subject && (
                      <span className="text-red-200 bg-red-900/40 px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-1.5 inline-block">
                        {errors.subject}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    How can we help you? *
                  </label>
                  <div className="relative">
                    <IoChatboxOutline className="absolute left-3.5 top-3.5 text-stone-400 text-sm pointer-events-none" />
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type your message here..."
                      className="w-full pl-9 pr-3.5 py-3 text-xs sm:text-sm bg-[#fff8f2] text-stone-900 border border-orange-200/80 rounded-xl sm:rounded-2xl shadow-inner placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/30 focus:bg-white font-medium resize-none transition-all"
                    />
                  </div>
                  {errors.message && (
                    <span className="text-red-200 bg-red-900/40 px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-1.5 inline-block">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-[#07221e] hover:bg-[#051815] active:scale-95 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-teal-800/60 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LuLoaderCircle className="animate-spin text-base" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <IoSend className="text-sm text-[#ea580c]" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
