import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../component/UserContext";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Bintang from "../component/Bintang";
import PeminjamanForm from "../component/PeminjamanForm";

const API_URL = import.meta.env.VITE_API_URL;

const DetailPage = () => {
  const { idBuku } = useParams();
  const { user } = useUser();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.token) {
      console.error("Token tidak tersedia, pengguna harus login.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/buku/${idBuku}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Gagal mengambil data buku.");
        return response.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error mengambil data buku:", error);
        setLoading(false);
      });
  }, [idBuku, user]);

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        padding: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Tetap gunakan untuk memastikan konten penuh layar
        paddingTop: "64px", // Mengakomodasi tinggi navbar (sesuai AppBar default)
      }}
    >
      <Container>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : book ? (
          <>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    maxWidth: 345,
                    mx: "auto",
                    boxShadow: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={book.gambar || "/placeholder.jpg"}
                    alt={book.judul}
                    sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h5"
                      component="div"
                      gutterBottom
                      sx={{ fontWeight: 700, color: "#1e3c72" }}
                    >
                      {book.judul}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Penulis: {book.penulis}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Tahun Terbit: {book.tahunTerbit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      ISBN: {book.isbn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Jumlah Buku: {book.jumlahBuku}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <PeminjamanForm book={book} />
              </Grid>
            </Grid>

            <Paper
              elevation={4}
              sx={{
                mt: 4,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                boxShadow: 4,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={2}
                sx={{ backgroundColor: "#f8f9fa", borderRadius: "8px", p: 1 }}
              >
                <LibraryBooksIcon sx={{ fontSize: 40, color: "#2a5298", mr: 1 }} />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="#1e3c72"
                  sx={{ textAlign: "center" }}
                >
                  Ulasan Buku
                </Typography>
              </Box>
              <Bintang idBuku={idBuku} showReviews={true} />
            </Paper>
          </>
        ) : (
          <Typography variant="h6" color="error" align="center" mt={2}>
            Gagal memuat data buku.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default DetailPage;