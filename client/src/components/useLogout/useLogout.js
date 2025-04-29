import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useLogout = (id) => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            // Call backend to clear the cookie
            await axios.get(`https://api.helpubuild.co.in/api/v1/universal_logout/${id}`);

            // Clear localStorage
            localStorage.clear();

            // Redirect to login or home page
            // navigate('/login'); 
            window.location.href = '/';
        } catch (error) {
            console.log('Logout failed:', error);
        }
    };

    return logout;
};

export default useLogout;
