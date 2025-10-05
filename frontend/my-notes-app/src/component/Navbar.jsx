import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useUser } from "./UserContext";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"; // Ikon untuk logo

const Navbar = () => {
  const { user, logout } = useUser();

  return (
    <AppBar
      position="sticky"
      color="primary"
      sx={{
        zIndex: 1200,
        height: "64px",
        width: "100%",
        margin: 0,
        padding: 0,
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Shadow untuk efek elevasi
      }}
    >
      <Toolbar sx={{ minHeight: "64px", padding: "0 24px", width: "100%", margin: 0 }}>
        {/* Logo dan Nama Aplikasi */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
          <LibraryBooksIcon sx={{ fontSize: "2rem", color: "white" }} /> {/* Ikon buku */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              ml: 1,
              color: "white",
              fontFamily: "'Poppins', sans-serif", // Font yang lebih santai
              fontWeight: 500, // Tidak terlalu tebal
              fontSize: "1.2rem",
            }}
          >
            Perpustakaan
          </Typography>
        </Box>

        {/* Menu Navigasi */}
        <Box sx={{ flexGrow: 1, display: "flex", gap: 3, margin: 0, padding: 0 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400, // Lebih ringan
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Efek hover
              },
            }}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/TambahBuku"
            color="inherit"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Tambah Buku
          </Button>
          <Button
            component={Link}
            to="/Peminjaman"
            color="inherit"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Peminjaman
          </Button>
        </Box>

        {/* Bagian User */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", ml: 3, margin: 0, padding: 0 }}>
            <Typography
              sx={{
                mr: 2,
                margin: 0,
                padding: 0,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: "1rem",
                color: "white",
              }}
            >
              {user.username}
            </Typography>
            <Button
              color="inherit"
              onClick={logout}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button
            component={Link}
            to="/login"
            color="inherit"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;