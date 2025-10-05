import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../component/UserContext";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Link,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false, general: "" });

  const handleLogin = async () => {
    setLoading(true);
    setErrors({ username: false, password: false, general: "" });

    if (!username || !password) {
      setErrors({
        username: !username,
        password: !password,
        general: "Username dan password wajib diisi!",
      });
      setLoading(false);
      return;
    }

    try {
      await login({ username, password });
      navigate("/");
    } catch (error) {
      setErrors({
        general: error.message || "Login gagal. Periksa username dan password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2a5298 30%, #1e3c72 90%)",
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ padding: 4, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <LibraryBooksIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Perpustakaan Digital
            </Typography>
          </Box>

          <Typography variant="h6" align="center" gutterBottom>
            Selamat Datang!
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Masuk untuk menjelajahi koleksi buku terbaik kami.
          </Typography>

          {errors.general && (
            <Typography color="error" align="center" mt={2}>
              {errors.general}
            </Typography>
          )}

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              helperText={errors.username ? "Username wajib diisi" : ""}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText={errors.password ? "Password wajib diisi" : ""}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
              sx={{ textTransform: "none", fontSize: 16, fontWeight: 500 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </Box>

          <Typography align="center" mt={2}>
            Belum punya akun?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/register")}
              sx={{ cursor: "pointer", fontWeight: 500 }}
            >
              Buat akun
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
