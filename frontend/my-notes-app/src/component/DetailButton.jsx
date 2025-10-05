import React from 'react';
import { Link } from 'react-router-dom';

const DetailButton = ({ id_buku }) => {
  return (
    <Link to={`/detail/${id_buku}`} className="ui button primary right">
      Pinjam Buku
    </Link>
  );
};

export default DetailButton;
