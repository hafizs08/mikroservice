import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../component/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Container,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Bintang from "../component/Bintang";

const API_URL = import.meta.env.VITE_API_URL;

const PeminjamanDetail = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookTitles, setBookTitles] = useState({});

  useEffect(() => {
    if (!user || !user.idPengguna || !user.token) {
      console.error("User tidak ditemukan atau belum login.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/peminjaman/pengguna/${user.idPengguna}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data peminjaman.");
        return res.json();
      })
      .then((data) => {
        setPeminjaman(data);
        setLoading(false);
        data.forEach((item) => {
          fetch(`${API_URL}/buku/${item.buku}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
            .then((res) => {
              if (!res.ok) throw new Error("Gagal mengambil data buku.");
              return res.json();
            })
            .then((bookData) => {
              setBookTitles((prev) => ({ ...prev, [item.buku]: bookData.judul }));
            })
            .catch((error) => {
              console.error("Error mengambil judul buku:", error);
              setBookTitles((prev) => ({ ...prev, [item.buku]: "Judul tidak ditemukan" }));
            });
        });
      })
      .catch((error) => {
        console.error("Error mengambil data peminjaman:", error);
        setLoading(false);
      });
  }, [user]);

  const handleReturnBook = async (idPeminjaman, idBuku) => {
    const payload = {
      buku: idBuku,
      pengguna: user.idPengguna,
      tanggalPinjam: peminjaman.find((p) => p.idPeminjaman === idPeminjaman).tanggalPinjam,
      tanggalKembali: peminjaman.find((p) => p.idPeminjaman === idPeminjaman).tanggalKembali,
      status: "Dikembalikan",
    };

    try {
      const response = await fetch(`${API_URL}/peminjaman/${idPeminjaman}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal mengembalikan buku.");
      }

      const updatedData = await response.json();
      console.log("Buku berhasil dikembalikan:", updatedData);

      setPeminjaman((prev) =>
        prev.map((p) =>
          p.idPeminjaman === idPeminjaman ? { ...p, status: "Dikembalikan" } : p
        )
      );

      navigate("/rating", {
        state: {
          peminjamanInfo: {
            id_peminjaman: idPeminjaman,
            id_buku: idBuku,
            id_pengguna: user.idPengguna,
            tanggalPinjam: payload.tanggalPinjam,
            tanggalKembali: payload.tanggalKembali,
          },
        },
      });
    } catch (error) {
      console.error("Error mengembalikan buku:", error);
      alert("Gagal mengembalikan buku: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2a5298 30%, #1e3c72 90%)",
        padding: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Container>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2} mt={2}>
          <LibraryBooksIcon sx={{ fontSize: 40, color: "#ffffff", mr: 1 }} />
          <Typography variant="h5" fontWeight={600} color="#ffffff">
            Riwayat Peminjaman
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            maxWidth: "100%",
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: 6,
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.01)",
            },
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : peminjaman.length === 0 ? (
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 3 }}
            >
              Tidak ada peminjaman saat ini.
            </Typography>
          ) : (
            <Table
              sx={{
                minWidth: { xs: 300, sm: 650 },
                "& td, & th": {
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  padding: { xs: "8px", sm: "16px" },
                },
              }}
              aria-label="tabel peminjaman"
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <b>Judul Buku</b>
                  </TableCell>
                  <TableCell>
                    <b>Pengguna</b>
                  </TableCell>
                  <TableCell>
                    <b>Tanggal Pinjam</b>
                  </TableCell>
                  <TableCell>
                    <b>Tanggal Kembali</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                  <TableCell>
                    <b>Aksi</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peminjaman.map((item) => (
                  <TableRow key={item.idPeminjaman}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1">
                          {bookTitles[item.buku] || "Memuat judul..."}
                        </Typography>
                        <Bintang idBuku={item.buku} />
                      </Box>
                    </TableCell>
                    <TableCell>{user.idPengguna}</TableCell>
                    <TableCell>{item.tanggalPinjam}</TableCell>
                    <TableCell>{item.tanggalKembali}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleReturnBook(item.idPeminjaman, item.buku)}
                        disabled={item.status === "Dikembalikan"}
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          padding: { xs: "4px 8px", sm: "6px 16px" },
                        }}
                      >
                        Kembalikan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Container>
    </Box>
  );
};

export default PeminjamanDetail;