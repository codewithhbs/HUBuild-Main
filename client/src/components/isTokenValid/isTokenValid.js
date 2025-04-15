import { jwtDecode } from 'jwt-decode';
import { GetData } from '../../utils/sessionStoreage';

export const isTokenValid = () => {
//   const token = localStorage.getItem('token');
const token = GetData('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    console.log('decoded', decoded);

    // Check expiry
    const currentTime = Date.now() / 1000; // in seconds
    if (decoded.exp < currentTime) {
      console.warn("Token has expired");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid token:", error.message);
    return false;
  }
};
