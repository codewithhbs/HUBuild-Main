import React, { useState } from 'react'
import loginimage from './login-img.webp'
import axios from 'axios';
import toast from 'react-hot-toast';
import { setData } from '../../utils/sessionStoreage';
import Swal from 'sweetalert2';
axios.defaults.withCredentials = true;

function Login() {
    const [logindata, setLoginData] = useState({
        any: '',
        password: '',
        loginFrom: 'user'
    });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleloginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://api.helpubuild.in/api/v1/login', logindata);
            const { token, user, message } = data;
            setData('token', token);
            setData('islogin', token ? true : false);
            setData('user', user);
            toast.success(message);
            window.location.href = '/user-profile';
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || 'An error occurred. Please try again.',
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
    };

    return (
        <section className="bg-light">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col col-xl-10">
                        <div className="card login-bg" style={{ borderRadius: "1rem" }}>
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-6 d-none d-md-block">
                                    <img
                                        src={loginimage}
                                        alt="login form"
                                        className="img-fluid"
                                        style={{ borderRadius: "1rem 0 0 1rem" }}
                                    />
                                </div>
                                <div className="col-md-6 col-lg-6 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form>
                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <span className="h1 fw-bold mb-0 text-white">Login as a User</span>
                                            </div>
                                            <h5
                                                className="fw-normal mb-3 pb-3 text-white"
                                                style={{ letterSpacing: 1 }}
                                            >
                                                Sign into your account
                                            </h5>
                                            <div className="form-outline mb-4">
                                                <label className="form-label text-white" htmlFor="form2Example17">
                                                    Email or Phone
                                                </label>
                                                <input
                                                    onChange={handleChange}
                                                    name="any"
                                                    type="text"
                                                    value={logindata.any}
                                                    id="form2Example17"
                                                    className="form-control form-control-lg input-shape"
                                                />
                                            </div>

                                            <div className="form-outline mb-4 position-relative">
                                                <label className="form-label text-white" htmlFor="form2Example27">
                                                    Password
                                                </label>
                                                <input
                                                    onChange={handleChange}
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={logindata.password}
                                                    id="form2Example27"
                                                    className="form-control form-control-lg input-shape"
                                                />
                                                <i
                                                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                                                    onClick={togglePasswordVisibility}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '70%',
                                                        right: '15px',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                        color: '#999'
                                                    }}
                                                ></i>
                                            </div>

                                            <div className="pt-1 mb-4">
                                                <button
                                                    onClick={handleloginSubmit}
                                                    className="btn text-white"
                                                    style={{ backgroundColor: '#F0AF36' }}
                                                    type="button"
                                                >
                                                    Login Now
                                                </button>
                                            </div>
                                            <a className="small text-white" href="/forget-password">Forgot password?</a>
                                            <p className="mt-3 pb-lg-2 text-white">
                                                Don't have an account?{" "}
                                                <a href={`/user-register`} className="text-warning">
                                                    Register here
                                                </a>
                                            </p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
