import React, { useState, useEffect } from "react";
import { useUser } from "../component/UserContext";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Bintang from "../component/Bintang";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/buku`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data");

        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user?.token]);

  const handleDelete = async (idBuku) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    try {
      const response = await fetch(`${API_URL}/buku/${idBuku}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal menghapus buku");

      setBooks(books.filter((book) => book.idBuku !== idBuku));
      alert("Buku berhasil dihapus!");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menghapus buku.");
    }
  };

  return (
    <Container sx={{ mt: 5, textAlign: "left" }}>
      <Box
        sx={{
          textAlign: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          p: 3,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Selamat Datang, {user ? user.username : "Pembaca"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Jelajahi berbagai buku menarik dan temukan favoritmu.
        </Typography>
      </Box>


      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="left">
          {books.map((book) => (
            <Grid item key={book.idBuku} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{
                position: "relative",
                boxShadow: 3,
                borderRadius: 2,
                transition: "transform 0.3s ease-in-out",
                '&:hover': { transform: "scale(1.05)" }
              }}>
                <IconButton
                  component={Link}
                  to={`/update/${book.idBuku}`}
                  color="primary"
                  sx={{ position: "absolute", top: 8, right: 8, bgcolor: "white" }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  onClick={() => handleDelete(book.idBuku)}
                  color="error"
                  sx={{ position: "absolute", top: 8, left: 8, bgcolor: "white" }}
                >
                  <DeleteIcon />
                </IconButton>

                <CardMedia
                  component="img"
                  height="250"
                  image={book.gambar}
                  alt={book.judul}
                  sx={{ objectFit: "cover" }}
                />

                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {book.judul}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Penulis: {book.penulis}
                  </Typography>
                  <Box display="flex" alignItems="left" mt={1}>
                    <Bintang idBuku={book.idBuku} showReviews={false} />
                  </Box>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={Link}
                      to={`/detail/${book.idBuku}`}
                      sx={{ fontWeight: 600 }}
                    >
                      Pinjam Buku
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
