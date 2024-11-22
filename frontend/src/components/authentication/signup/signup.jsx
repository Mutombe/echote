import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  createTheme,
  Alert,
  ThemeProvider,
} from "@mui/material";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { signup } from "@/redux/slices/authSlice";
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

const SignUpButton = () => {
  const [openModal, setOpenModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validate the fields
  const validateFields = () => {
    let valid = true;

    if (!email) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

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
      dispatch(signup({ email, username, password })).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          navigate("/");
        } else if (result.meta.requestStatus === "rejected") {
          console.log("Signup failed:", error);
        }
      });
    }
  };

  const handleSignUp = () => {
    setOpenModal(true);
  };

  return (
    <ThemeProvider theme={theme}>
      {!isAuthenticated && (
        <button
          onClick={handleSignUp}
          className="px-6 py-2 rounded-full font-semibold transition duration-300 bg-white text-green-600 border border-green-600 hover:bg-green-50"
        >
          <UserPlus className="inline-block mr-2" size={20} />
          Sign Up
        </button>
      )}
      <Dialog
        open={openModal}
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#f0fdf4",
            borderRadius: "0.5rem",
          },
        }}
      >
        <DialogTitle style={{ color: "#166534" }}>Sign Up</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="warning">
              {error}{" "}
              <Link to="/" style={{ color: "#16a34a" }}>
                Log In
              </Link>
            </Alert>
          )}
          <TextField
            type="email"
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            placeholder="Your Email"
            error={emailError}
            helperText={emailError ? "Email is required" : ""}
            InputLabelProps={{
              style: { color: "#166534" },
            }}
          />
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
            required
            placeholder="Password"
            error={passwordError}
            helperText={passwordError ? "Password is required" : ""}
            InputLabelProps={{
              style: { color: "#166534" },
            }}
          />
        </DialogContent>
        <DialogActions>
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
            style={{ backgroundColor: "#16a34a", color: "white" }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign-Up"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default SignUpButton;
