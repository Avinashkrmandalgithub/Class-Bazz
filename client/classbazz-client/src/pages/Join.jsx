import React, { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { UserContext } from "../context/UserContext.jsx"; // Make sure this path matches your project

const API_URL = "https://class-bazz.onrender.com/"; // backend URL is different

const classmates = [
  "HARBHAJAN SINGH", "UTTAM KUMAR PANDIT", "PRIYA NASKAR", "JAYPRAKASH YADAB", "KHUSHI SHAW",
  "SWASTIKA BARAI", "ADITYA SAHA", "SUBHRA JYOTI JANA", "KOUSTAB KUNDU", "MOHIT KUMAR PANDIT",
  "SAURABH HARIJAN", "MD ALFAYEN MONDAL", "NISHANT KUMAR", "ARYAN SHAW", "PRIYASMITA KARMAKAR",
  "NABAJIT BHOWMICK", "RISHAV MANDAL", "SHAKSHI SINGH", "SALIM AYMAN", "AVINASH KUMAR MANDAL",
  "ADITYA PAUL", "ANISH DEY", "ANIRBAN SADHUKHAN", "RAJ ARIYAN SHAW", "KRISHANU SINGHA",
  "MD SHAHIL ALAM THAKURIA", "SANTANU BAG", "SAYANTAN JANA", "MD DANISH ALI", "INDIRA BISWAS",
  "ARMAN KUMAR", "KHUSHI KUMARI", "REETI PAKIRA", "ANUSHKA VARMA", "KEYA MONDAL", "SOURAJIT SANTRA",
  "SUBHAM BISWAS", "FAJLE ALAM", "ABHIRUP BASU", "SOURAV KUMAR SINGH", "PIYUSH KUMAR",
  "SATYAM KUMAR RAI", "SHANWI ANSARI", "MUSKAN SINGH", "NIKITA BHAKAT", "ARITRA MONDAL",
  "PREM KUMAR", "SALONI KUMARI", "MAHARGHA PANDEY", "KUMARESH GHOSH", "MUNMUN KHATUN",
];

const LoadingDots = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -5, transition: { yoyo: Infinity, duration: 0.4, ease: "easeInOut" } },
  };
  return (
    <div className="flex justify-center items-center space-x-1">
      <motion.span variants={dotVariants} initial="initial" animate="animate" className="w-2 h-2 bg-white rounded-full" />
      <motion.span variants={dotVariants} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="w-2 h-2 bg-white rounded-full" />
      <motion.span variants={dotVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="w-2 h-2 bg-white rounded-full" />
    </div>
  );
};

const Join = () => {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // --- Parallax Effect ---
  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const handleMouseMove = ({ clientX, clientY }) => {
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  const backgroundTransformX = useTransform(mouseX, [0, typeof window !== "undefined" ? window.innerWidth : 0], ["-10px", "10px"]);
  const backgroundTransformY = useTransform(mouseY, [0, typeof window !== "undefined" ? window.innerHeight : 0], ["-10px", "10px"]);
  const cardTransformX = useTransform(mouseX, [0, typeof window !== "undefined" ? window.innerWidth : 0], ["15px", "-15px"]);
  const cardTransformY = useTransform(mouseY, [0, typeof window !== "undefined" ? window.innerHeight : 0], ["15px", "-15px"]);

  const handleJoin = async () => {
    if (!username.trim() || !avatar) {
      setError("Please enter a username and select an avatar.");
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", avatar);

      // Upload avatar to backend
      const uploadRes = await fetch(`${API_URL}/api/upload`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { secure_url } = await uploadRes.json();

      const userData = { name: username, avatarUrl: secure_url };
      setUser(userData);
      sessionStorage.setItem("classbazz", JSON.stringify(userData));

      // Request token from backend
      const tokenRes = await fetch(`${API_URL}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!tokenRes.ok) throw new Error("Failed to generate token");
      const { token } = await tokenRes.json();

      sessionStorage.setItem("classbazz-user", JSON.stringify({ ...userData, token }));
      setUser({ ...userData, token });

      navigate("/room");
    } catch (err) {
      console.error(err);
      setError("Failed to join. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundElements = useMemo(() => {
    const floatingNames = classmates.map((name, index) => ({
      key: `name-${index}`,
      type: "name",
      content: `✦ ${name}`,
      initialStyle: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` },
      animate: { x: [0, (Math.random() - 0.5) * 200, 0], y: [0, (Math.random() - 0.5) * 200, 0] },
      transition: { duration: 30 + Math.random() * 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
    }));

    const twinklingStars = Array.from({ length: 120 }).map((_, i) => ({
      key: `star-${i}`,
      type: "star",
      initialStyle: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.8 + 0.2 },
      animate: { opacity: [0.1, 1, 0.1], scale: [1, 1.4, 1] },
      transition: { duration: 3 + Math.random() * 4, repeat: Infinity, repeatType: "mirror" },
    }));

    return [...floatingNames, ...twinklingStars];
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-indigo-950 to-black" onMouseMove={handleMouseMove}>
      {/* Background Elements */}
      <motion.div className="absolute inset-0" style={{ x: backgroundTransformX, y: backgroundTransformY }}>
        {backgroundElements.map(el => {
          if (el.type === "name") return (
            <motion.span key={el.key} className="absolute z-0 text-white/10 text-xs sm:text-sm md:text-lg font-semibold select-none whitespace-nowrap tracking-wide"
              style={el.initialStyle} animate={el.animate} transition={el.transition}>{el.content}</motion.span>
          );
          if (el.type === "star") return (
            <motion.div key={el.key} className="absolute w-[2px] h-[2px] bg-white rounded-full"
              style={el.initialStyle} animate={el.animate} transition={el.transition} />
          );
          return null;
        })}
      </motion.div>

      {/* Join Card */}
      <motion.div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-[0_0_40px_rgba(99,102,241,0.5)] text-center text-white border border-indigo-400/20"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: cardTransformX, y: cardTransformY }}>

        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">🚀 ClassBazz</h1>
        <p className="mb-6 text-sm sm:text-base text-gray-300">Join the cosmic community chatroom</p>

        {/* Avatar */}
        <motion.label className="block mb-4 cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
          <div className="w-24 h-24 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-2 overflow-hidden shadow-lg border-2 border-indigo-400/50 transition-all hover:border-indigo-400">
            {avatar ? <img src={URL.createObjectURL(avatar)} alt="avatar" className="w-full h-full object-cover" /> :
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300"><path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 19v2"/></svg>}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { setAvatar(e.target.files[0]); setError(""); }} />
          <p className="text-xs sm:text-sm text-indigo-300 transition-colors hover:text-indigo-200">Click to upload image</p>
        </motion.label>

        {/* Username Input */}
        <input type="text" placeholder="Enter your username" className="w-full p-3 rounded-lg border border-indigo-500/40 bg-indigo-900/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} />

        {/* Error Message */}
        <AnimatePresence>
          {error && <motion.p className="mt-3 text-sm font-medium text-red-400" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}>{error}</motion.p>}
        </AnimatePresence>

        {/* Join Button */}
        <motion.button className="mt-6 w-full bg-indigo-600 p-3 rounded-lg font-semibold transition-all duration-300 disabled:bg-gray-600 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
          onClick={handleJoin} disabled={isLoading} whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(99, 102, 241, 0.7)" }}
          whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
          {isLoading ? <LoadingDots /> : "Join ClassBazz"}
        </motion.button>

        {/* Footer inside the card */}
        <div className="mt-4 text-center text-gray-400 text-xs sm:text-sm select-none">
          © {new Date().getFullYear()} ClassBazz. Developed by Avinash Kr Mandal.
        </div>
      </motion.div>
    </div>
  );
};

export default Join;
