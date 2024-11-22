import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Alert,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { login } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16a34a",
    },
    secondary: {
      main: "#22c55e",
    },
  },
});

const LoginButton = () => {
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateFields = () => {
    let valid = true;
    if (!username) {
      setUsernameError(true);
      valid = false;
    } else {
      setUsernameError(false);
    }

    if (!password) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    return valid;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      dispatch(login({ username, password }))
        .unwrap()
        .then(() => {
          setOpenModal(false);
          navigate("/");
        })
        .catch((err) => {
          console.error("Login failed:", err);
        });
    }
  };

  const handleLogin = () => {
    setOpenModal(true);
  };

  return (
    <ThemeProvider theme={theme}>
      {!isAuthenticated && (
        <button
          onClick={handleLogin}
          className="px-6 py-2 rounded-full font-semibold transition duration-300 bg-green-700 text-white hover:bg-green-800"
        >
          <LogIn className="inline-block mr-2" size={20} />
          Log In
        </button>
      )}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#f0fdf4",
            borderRadius: "0.5rem",
          },
        }}
      >
        <DialogTitle style={{ color: "#166534" }}>Login</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="warning" style={{ marginBottom: "1rem" }}>
              {error}{" "}
              <Link to="/" style={{ color: "#16a34a" }}>
                Sign Up
              </Link>
            </Alert>
          )}
          <TextField
            type="text"
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            placeholder="Your Username"
            error={usernameError}
            helperText={usernameError ? "Username is required" : ""}
            InputLabelProps={{
              style: { color: "#166534" },
            }}
          />
          <TextField
            type="password"
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Password"
            error={passwordError}
            helperText={passwordError ? "Password is required" : ""}
            InputLabelProps={{
              style: { color: "#166534" },
            }}
            required
          />
        </DialogContent>
        <DialogActions style={{ padding: "1rem" }}>
          <Button
            onClick={() => setOpenModal(false)}
            color="secondary"
            style={{ color: "#166534" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={loading}
            variant="contained"
            style={{ backgroundColor: "#16a34a", color: "white" }}
          >
            {loading ? "Loading..." : "Log-In"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default LoginButton;
