import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const API_URL = "http://localhost:8032/auth/register";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    nama: "",
    email: "",
    kataSandi: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRegister = async () => {
    setLoading(true);
    setErrors({});

    if (!formData.username || !formData.nama || !formData.email || !formData.kataSandi) {
      setErrors({ general: "Semua kolom wajib diisi!" });
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Format email tidak valid!" });
      setLoading(false);
      return;
    }

    try {
      await axios.post(API_URL, formData);
      navigate("/login");
    } catch (error) {
      if (error.response?.data) {
        const errorMsg = error.response.data.toLowerCase();

        if (errorMsg.includes("duplicate entry") && errorMsg.includes("UK_58qkm9mhgl2dp72xniogakhxf")) {
          setErrors({ username: "Username sudah digunakan!" });
        } else if (errorMsg.includes("duplicate entry") && errorMsg.includes("UK_ibj7stm8ubc1374kbho8fihpt")) {
          setErrors({ email: "Email sudah terdaftar!" });
        } else {
          setErrors({ general: "Pendaftaran gagal, coba lagi nanti." });
        }
      } else {
        setErrors({ general: "Terjadi kesalahan, coba lagi nanti." });
      }
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
            <PersonAddIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Buat Akun Baru
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Bergabunglah dengan Perpustakaan Digital kami!
          </Typography>

          {errors.general && (
            <Typography color="error" align="center" mt={2}>
              {errors.general}
            </Typography>
          )}

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
            <TextField
              label="Nama Lengkap"
              variant="outlined"
              fullWidth
              name="nama"
              value={formData.nama}
              onChange={handleChange}
            />
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Kata Sandi"
              variant="outlined"
              type="password"
              fullWidth
              name="kataSandi"
              value={formData.kataSandi}
              onChange={handleChange}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRegister}
              disabled={loading}
              sx={{ textTransform: "none", fontSize: 16, fontWeight: 500 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Daftar"}
            </Button>
          </Box>

          <Typography align="center" mt={2}>
            Sudah punya akun?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/login")}
              sx={{ cursor: "pointer", fontWeight: 500 }}
            >
              Login
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
