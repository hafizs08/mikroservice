import React, { useState, useEffect } from "react";
import { useUser } from "../component/UserContext";
import { Box, Typography, Rating as MuiRating, Avatar, Card, CardContent } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const API_URL = import.meta.env.VITE_API_URL;

const Bintang = ({ idBuku, showReviews = false }) => {
  const { user } = useUser();
  const [averageRating, setAverageRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});


  const fetchUserDetails = async (idPengguna) => {
    try {
      const response = await fetch(`${API_URL}/pengguna/${idPengguna}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data pengguna: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching user details:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      if (!idBuku) {
        setError("ID Buku tidak valid.");
        setLoading(false);
        return;
      }

      if (!user || !user.token) {
        setError("Token tidak tersedia. Silakan login kembali.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/rating/buku/${idBuku}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data rating: ${response.statusText}`);
        }

        const data = await response.json();
        setRatings(data);

     
        const userDetailsPromises = data.map((rating) =>
          fetchUserDetails(rating.pengguna)
        );
        const userDetailsResults = await Promise.all(userDetailsPromises);

        const userDetailsMap = {};
        userDetailsResults.forEach((userDetail, index) => {
          if (userDetail) {
            userDetailsMap[data[index].pengguna] = userDetail.nama;
          }
        });
        setUserDetails(userDetailsMap);

        if (data.length > 0) {
          const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
          setAverageRating(parseFloat((totalRating / data.length).toFixed(1)));
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error("Error fetching rating:", err);
        setError("Gagal memuat rating: " + err.message);
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [idBuku, user]);

  if (loading) {
    return <Typography variant="body2">Memuat rating...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", margin: 0, padding: 0 }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ margin: 0, padding: 0 }}>
        {averageRating !== null ? (
          <>
            <MuiRating
              name="read-only-rating"
              value={averageRating}
              precision={0.1}
              readOnly
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              icon={<StarIcon fontSize="inherit" />}
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, margin: 0, padding: 0 }}
            />
            <Typography variant="body2" sx={{ margin: 0, padding: 0 }}>
              ({averageRating}/5)
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ margin: 0, padding: 0 }}>
            Tidak ada rating.
          </Typography>
        )}
      </Box>

      {showReviews && ratings.length > 0 && (
        <Box sx={{ mt: 1, margin: 0, padding: 0 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
            Ulasan ({ratings.length}):
          </Typography>
          {ratings.map((rating) => (
            <Card
              key={rating.id_ratingBuku}
              sx={{
                mb: 2,
                boxShadow: 2,
                borderRadius: 2,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {userDetails[rating.pengguna]?.charAt(0) || "U"}
                  </Avatar>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetails[rating.pengguna] || "Pengguna"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <MuiRating
                    value={rating.rating}
                    precision={0.1}
                    readOnly
                    size="small"
                    emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {rating.rating}/5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  "{rating.komentar}"
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {showReviews && ratings.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, margin: 0, padding: 0 }}>
          Belum ada ulasan untuk buku ini.
        </Typography>
      )}
    </Box>
  );
};

export default Bintang;