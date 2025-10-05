import React from 'react';
import { useUser } from './UserContext';

const Board = () => {
  const { user, logout } = useUser();

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.username}! (ID Pengguna: {user.id_pengguna})</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Login to access more Akses</p>
      )}
    </div>
  );
};

export default Board;
