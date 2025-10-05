import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const API_URL = import.meta.env.VITE_API_URL;

const PeminjamanForm = ({ book }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [peminjamanData, setPeminjamanData] = useState({
    tanggalPinjam: "",
    tanggalKembali: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPeminjamanData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};

    if (!peminjamanData.tanggalPinjam) {
      newErrors.tanggalPinjam = "Tanggal pinjam wajib diisi!";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (peminjamanData.tanggalPinjam < today) {
        newErrors.tanggalPinjam = "Tanggal pinjam tidak boleh sebelum hari ini!";
      }
    }

    if (!peminjamanData.tanggalKembali) {
      newErrors.tanggalKembali = "Tanggal kembali wajib diisi!";
    } else if (peminjamanData.tanggalKembali <= peminjamanData.tanggalPinjam) {
      newErrors.tanggalKembali = "Tanggal kembali harus setelah tanggal pinjam!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!user || !user.token || !user.idPengguna) {
      alert("Anda harus login untuk meminjam buku.");
      return;
    }

    const payload = {
      buku: book.idBuku,
      pengguna: user.idPengguna,
      tanggalPinjam: peminjamanData.tanggalPinjam,
      tanggalKembali: peminjamanData.tanggalKembali,
      status: "Dipinjam",
    };

    console.log("Payload:", payload); 

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/peminjaman`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        if (response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login kembali.");
          navigate("/login");
          return;
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Gagal mengirim permintaan peminjaman.");
        } catch (jsonError) {
          throw new Error(errorText || "Gagal mengirim permintaan peminjaman.");
        }
      }

      const data = await response.json();
      console.log("Peminjaman berhasil:", data);
      navigate("/Peminjaman", { state: { peminjamanInfo: data } });
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Terjadi kesalahan saat memproses peminjaman.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        padding: { xs: 2, sm: 4 },
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.01)",
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
        <LibraryBooksIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
        <Typography variant="h5" fontWeight={600} color="text.primary">
          Form Peminjaman
        </Typography>
      </Box>

      {Object.keys(errors).length > 0 && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          Mohon perbaiki kesalahan di bawah.
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Tanggal Pinjam"
          type="date"
          name="tanggalPinjam"
          fullWidth
          margin="normal"
          variant="outlined"
          value={peminjamanData.tanggalPinjam}
          onChange={handleInputChange}
          error={!!errors.tanggalPinjam}
          helperText={errors.tanggalPinjam}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tanggal Kembali"
          type="date"
          name="tanggalKembali"
          fullWidth
          margin="normal"
          variant="outlined"
          value={peminjamanData.tanggalKembali}
          onChange={handleInputChange}
          error={!!errors.tanggalKembali}
          helperText={errors.tanggalKembali}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            py: 1.5,
            fontSize: 16,
            fontWeight: 500,
            textTransform: "none",
            transition: "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#1e3c72",
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Pinjam Buku"}
        </Button>
      </form>
    </Paper>
  );
};

export default PeminjamanForm;