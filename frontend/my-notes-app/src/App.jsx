import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./component/Navbar";
// import DaftarCatatan from "./component/DaftarCatatan";
// import Hooks from "./component/ExampleComponent";
// import BookList from "./component/bookList";
import Home from "./page/Home";
import Login from "./page/Login";
import Rating from "./page/Rating";
import DetailPage from './page/DetailPage';
import TambahBuku from "./page/TambahBuku";
// import PeminjamForm from "./component/PeminjamanForm";
import Board from "./component/board";
import Update from "./page/UpdateBuku";
import Register from "./page/Register";
import { UserProvider } from "./component/UserContext";
import PeminjamanDetail from "./page/PeminjamanDetail";


const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppWithNavbar />
      </UserProvider>
    </BrowserRouter>
  );
};

const AppWithNavbar = () => {
  const location = useLocation();
  const hideNavbarOnLogin = location.pathname === "/login";

  return (
    <>
      {!hideNavbarOnLogin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:idBuku" element={<DetailPage />} />
        <Route path="/TambahBuku" element={<TambahBuku />} />
        <Route path="/Rating" element={<Rating />} />
        <Route path="/peminjaman" element={<PeminjamanDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update/:idBuku" element={<Update />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
