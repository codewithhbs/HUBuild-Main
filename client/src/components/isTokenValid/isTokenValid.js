import { jwtDecode } from 'jwt-decode';
import { GetData } from '../../utils/sessionStoreage';
import axios from 'axios';

export const isTokenValid = async () => {
  const token = GetData('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    console.log("decoded", decoded)
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("Token expired");
      return false;
    }

    // Verify user still exists via backend
    const response = await axios.get(`https://testapi.dessobuild.com/api/v1/verify-user/${decoded.id._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.exists === true;
  } catch (error) {
    console.error("Token invalid or user not found:", error.message);
    return false;
  }
};
