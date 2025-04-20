import { useNavigate } from "react-router-dom";
import { colors } from "../styles/Themes";
import Header from "../components/layout/Header";
import { motion } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";
import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatar: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        backgroundColor: colors.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative", // Added for positioning the back button
      }}
    >
      {/* Back Button - Moved to top-left of parent page */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        style={{
          position: "fixed", // Changed from absolute to fixed
          top: "100px",
          left: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.2)",
          border: `2px dashed ${colors.dark}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 1000, // Very high z-index to ensure it's on top
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <IoArrowBack
          size={24}
          color={colors.dark}
          style={{ fontWeight: "bold" }}
        />
      </motion.button>

      <Header />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          arginTop: "60px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            backgroundColor: colors.primary,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: `0 2px 12px ${colors.dark}20`,
            border: `1px solid ${colors.secondary}20`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${colors.secondary}`,
              boxShadow: `0 4px 8px ${colors.dark}20`,
              marginBottom: "1.5rem",
            }}
          >
            <img
              src={user.avatar}
              alt="User Icon"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </motion.div>

          <h2
            style={{
              color: colors.dark,
              marginBottom: "1rem",
              fontSize: "2rem",
            }}
          >
            {user.name}
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ color: colors.dark, margin: "0.5rem 0" }}>
              <strong>Email:</strong> {user.email}
            </p>
            <p style={{ color: colors.dark, margin: "0.5rem 0" }}>
              <strong>Member Since:</strong> {user.joinDate}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={{
              backgroundColor: colors.secondary,
              color: colors.primary,
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
