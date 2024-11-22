import { logout } from "@/redux/slices/authSlice";
import { useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LogoutButton = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };

  return (
    <>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="px-6 py-2 rounded-full font-semibold transition duration-300 bg-white text-green-600 border border-green-600 hover:bg-green-50"
        >
          <LogOut className="inline-block mr-2" size={20} />
          {loading ? "Loading..." : "Log-Out"}
        </button>
      )}
    </>
  );
};

export default LogoutButton;
