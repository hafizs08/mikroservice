import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../component/UserContext";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Rating as MuiRating,
  CircularProgress,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const API_URL = import.meta.env.VITE_API_URL;

const RatingPage = () => {
  const { user } = useUser();
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const peminjamanInfo = location.state && location.state.peminjamanInfo;

  if (!peminjamanInfo) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 5 }}>
        Data peminjaman tidak tersedia.
      </Typography>
    );
  }

  const handleCommentChange = (event) => {
    setComment(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, comment: "" }));
  };

  const validate = () => {
    let newErrors = {};

    if (rating < 1) {
      newErrors.rating = "Rating wajib diisi (minimal 1 bintang)!";
    }

    if (!comment.trim()) {
      newErrors.comment = "Komentar wajib diisi!";
    } else if (comment.length > 500) {
      newErrors.comment = "Komentar maksimal 500 karakter!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRating = async () => {
    if (!validate()) return;

    if (!user || !user.token || !user.idPengguna) {
      alert("Anda harus login untuk memberikan rating.");
      return;
    }

    const requestData = {
      buku: peminjamanInfo.id_buku.toString(),
      pengguna: user.idPengguna.toString(),
      rating: rating,
      komentar: comment,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal mengirim rating.");
      }

      const data = await response.json();
      console.log("Rating berhasil disubmit:", data);
      navigate("/");
    } catch (error) {
      console.error("Rating gagal disubmit:", error.message);
      alert("Gagal mengirim rating: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2a5298 30%, #1e3c72 90%)",
        padding: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 2, sm: 4 },
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: 6,
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.01)",
            },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <LibraryBooksIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Berikan Rating
            </Typography>
          </Box>

          {Object.keys(errors).length > 0 && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              Mohon perbaiki kesalahan di bawah.
            </Typography>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Typography variant="body1" gutterBottom>
                Rating Anda:
              </Typography>
              <MuiRating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue || 0);
                  setErrors((prevErrors) => ({ ...prevErrors, rating: "" }));
                }}
                precision={1}
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                icon={<StarIcon fontSize="inherit" />}
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              />
              {errors.rating && (
                <Typography color="error" variant="caption">
                  {errors.rating}
                </Typography>
              )}
            </Box>

            <TextField
              label="Komentar"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={handleCommentChange}
              error={!!errors.comment}
              helperText={errors.comment}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmitRating}
              disabled={loading}
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
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Kirim Rating"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RatingPage;