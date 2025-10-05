import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const API_URL = import.meta.env.VITE_API_URL;

const TambahBuku = () => {
  const [dataBuku, setDataBuku] = useState({
    judul: "",
    penulis: "",
    tahunTerbit: "",
    isbn: "",
    jumlahBuku: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fungsi handleInputChange untuk mengupdate state saat input berubah
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDataBuku((prevData) => ({ ...prevData, [name]: value }));
    // Membersihkan error untuk field yang sedang diedit
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, coverImage: "File harus berupa gambar!" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, coverImage: "Ukuran gambar maksimal 5MB!" }));
        return;
      }
      setCoverImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, coverImage: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!dataBuku.judul.trim()) newErrors.judul = "Judul wajib diisi!";
    else if (dataBuku.judul.length < 2) newErrors.judul = "Judul minimal 2 karakter!";
    else if (dataBuku.judul.length > 100) newErrors.judul = "Judul maksimal 100 karakter!";

    if (!dataBuku.penulis.trim()) newErrors.penulis = "Penulis wajib diisi!";
    else if (dataBuku.penulis.length < 2) newErrors.penulis = "Nama penulis minimal 2 karakter!";
    else if (dataBuku.penulis.length > 50) newErrors.penulis = "Nama penulis maksimal 50 karakter!";
    else if (!/^[a-zA-Z\s.,'-]+$/.test(dataBuku.penulis))
      newErrors.penulis = "Penulis hanya boleh berisi huruf, spasi, dan tanda baca dasar!";

    if (!dataBuku.tahunTerbit) newErrors.tahunTerbit = "Tahun terbit wajib diisi!";
    else if (isNaN(dataBuku.tahunTerbit) || dataBuku.tahunTerbit < 1800 || dataBuku.tahunTerbit > new Date().getFullYear())
      newErrors.tahunTerbit = `Tahun harus antara 1800 dan ${new Date().getFullYear()}!`;

    if (dataBuku.isbn && !/^\d{7}$/.test(dataBuku.isbn)) newErrors.isbn = "ISBN harus berupa 7 digit angka!";

    if (!dataBuku.jumlahBuku && dataBuku.jumlahBuku !== "0") newErrors.jumlahBuku = "Jumlah buku wajib diisi!";
    else if (isNaN(dataBuku.jumlahBuku) || dataBuku.jumlahBuku < 0) newErrors.jumlahBuku = "Jumlah buku harus angka positif atau nol!";
    else if (dataBuku.jumlahBuku > 1000) newErrors.jumlahBuku = "Jumlah buku maksimal 1000!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("bukuRequest", JSON.stringify(dataBuku));
    if (coverImage) formData.append("coverImage", coverImage);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/buku`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal menambahkan buku");

      alert("Buku berhasil ditambahkan!");
      setDataBuku({ judul: "", penulis: "", tahunTerbit: "", isbn: "", jumlahBuku: "" });
      setCoverImage(null);
      setPreviewImage(null);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan, coba lagi!");
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
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ padding: 4, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <LibraryBooksIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Tambah Buku Baru
            </Typography>
          </Box>

          {Object.keys(errors).length > 0 && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              Mohon perbaiki kesalahan di bawah.
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Judul"
              name="judul"
              fullWidth
              margin="normal"
              variant="outlined"
              value={dataBuku.judul}
              onChange={handleInputChange}
              error={!!errors.judul}
              helperText={errors.judul}
              
            />
            <TextField
              label="Penulis"
              name="penulis"
              fullWidth
              margin="normal"
              variant="outlined"
              value={dataBuku.penulis}
              onChange={handleInputChange}
              error={!!errors.penulis}
              helperText={errors.penulis}
              
            />
            <TextField
              label="Tahun Terbit"
              name="tahunTerbit"
              type="number"
              fullWidth
              margin="normal"
              variant="outlined"
              value={dataBuku.tahunTerbit}
              onChange={handleInputChange}
              error={!!errors.tahunTerbit}
              helperText={errors.tahunTerbit}
              
            />
            <TextField
              label="ISBN (7 digit)"
              name="isbn"
              fullWidth
              margin="normal"
              variant="outlined"
              value={dataBuku.isbn}
              onChange={handleInputChange}
              error={!!errors.isbn}
              helperText={errors.isbn}
              inputProps={{ maxLength: 7 }}
            />
            <TextField
              label="Jumlah Buku"
              name="jumlahBuku"
              type="number"
              fullWidth
              margin="normal"
              variant="outlined"
              value={dataBuku.jumlahBuku}
              onChange={handleInputChange}
              error={!!errors.jumlahBuku}
              helperText={errors.jumlahBuku}
              
            />

            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ textTransform: "none" }}
              >
                Upload Gambar
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              {previewImage && (
                <Box>
                  <img src={previewImage} alt="Preview" width={100} style={{ borderRadius: "5px" }} />
                </Box>
              )}
            </Box>
            {errors.coverImage && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {errors.coverImage}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: 16, fontWeight: 500, textTransform: "none" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Tambahkan Buku"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default TambahBuku;