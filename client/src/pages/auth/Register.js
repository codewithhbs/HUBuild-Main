import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        PhoneNumber: '',
        Password: '',
        cPassword: '',
        agree: false,
    })
    const [isPasswordShow, setIsPasswordShow] = useState(false)
    const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false)
    const location = new URLSearchParams(window.location.search)
    const redirectPath = location.get('redirect') || {}
    const [loading, setloading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))

    }


    const handlSubmit = async (e) => {
        e.preventDefault()
        setloading(true)
        if (formData.agree === false) {
            setloading(false)
            Swal.fire({
                title: 'Error!',
                text: "Please accept terms and conditions",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
        if (formData.Password !== formData.cPassword) {
            setloading(false)
            // return toast.error("Password does not match")
            return Swal.fire({
                title: 'Error!',
                text: "Password does not match",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }

        try {
            const res = await axios.post('https://api.dessobuild.com/api/v1/register', formData)

            toast.success(res.data.message)
            console.log("res.data", res.data.data)
            if (redirectPath && typeof redirectPath === "string") {
                window.location.href = `/otp-verification/user?email=${formData.PhoneNumber}&expires=${res.data?.data}&redirect=${encodeURIComponent(redirectPath)}`;
            } else {
                window.location.href = `/otp-verification/user?email=${formData.PhoneNumber}&expires=${res.data?.data}`;
            }

            setloading(false)
        } catch (error) {
            console.log(error);
            setloading(false)
            // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Invalid Error")
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Invalid Error",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
    }

    return (
        <>
            <section className="py-5">
                <div className="container">
                    <div style={{ display: 'flex' }} className="row justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: 25 }}>
                                <div className="card-body register-bg p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-lg-12 col-xl-12 col-md-10order-2 order-lg-1">
                                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4 text-white">
                                                User Registration Form
                                            </p>
                                            <form onSubmit={handlSubmit} className="mx-1 mx-md-4">
                                                <div className='row'>
                                                    <div className='col-lg-6'>
                                                        <div style={{ display: 'flex' }} className="flex-row mb-4">
                                                            <i className="fas fa-user fa-lg me-3 fa-fw lable-icon" />
                                                            <div
                                                                data-mdb-input-init=""
                                                                className="form-outline flex-fill mb-0"
                                                            >
                                                                <label className="form-label text-white" htmlFor="form3Example1c">
                                                                    Your Name
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name='name' value={formData.name}
                                                                    type="text"
                                                                    id="form3Example1c"
                                                                    className="form-control input-shape px-5"
                                                                />

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-lg-6'>
                                                        <div style={{ display: 'flex' }} className="flex-row mb-4">
                                                            <i className="fas fa-envelope fa-lg me-3 fa-fw lable-icon" />
                                                            <div
                                                                data-mdb-input-init=""
                                                                className="form-outline flex-fill mb-0"
                                                            >
                                                                <label className="form-label text-white" htmlFor="form3Example3c">
                                                                    Your Email
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name='email' value={formData.email}
                                                                    type="email"
                                                                    id="form3Example3c"
                                                                    className="form-control input-shape px-5"
                                                                />

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-lg-6'>
                                                        <div style={{ display: 'flex' }} className="flex-row mb-4">
                                                            <i className="fas fa-phone fa-lg me-3 fa-fw lable-icon" />
                                                            <div
                                                                data-mdb-input-init=""
                                                                className="form-outline flex-fill mb-0"
                                                            >
                                                                <label className="form-label text-white" htmlFor="form3Example3c">
                                                                    Your Phone
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name='PhoneNumber' value={formData.PhoneNumber}
                                                                    type="tel"
                                                                    id="form3Example3c"
                                                                    className="form-control input-shape px-5"
                                                                />

                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className='col-lg-6 position-relative'>
                                                        <div style={{ display: 'flex' }} className="flex-row mb-4">
                                                            <i className="fas fa-lock fa-lg me-3 fa-fw lable-icon" />
                                                            <div
                                                                data-mdb-input-init=""
                                                                className="form-outline flex-fill mb-0"
                                                            >
                                                                <label className="form-label text-white" htmlFor="form3Example4c">
                                                                    Password
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name='Password'
                                                                    value={formData.Password}
                                                                    type={isPasswordShow ? 'text' : 'password'}
                                                                    id="form3Example4c"
                                                                    className="form-control input-shape px-5"
                                                                />

                                                            </div>
                                                        </div>
                                                        <span type='button' onClick={() => setIsPasswordShow(!isPasswordShow)}><i class="far fa-eye user-registration-eye"></i></span>
                                                    </div>

                                                    <div className='col-lg-6 position-relative'>
                                                        <div style={{ display: 'flex' }} className="flex-row mb-4">
                                                            <i className="fas fa-key fa-lg me-3 fa-fw lable-icon" />
                                                            <div data-mdb-input-init=""
                                                                className="form-outline flex-fill mb-0" >
                                                                <label className="form-label text-white" htmlFor="form3Example4cd">
                                                                    Re-enter password
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    id="form3Example4cd"
                                                                    name='cPassword'
                                                                    value={formData.cPassword}
                                                                    type={isConfirmPasswordShow ? 'text' : 'password'}
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                        <span type='button' onClick={() => setIsConfirmPasswordShow(!isConfirmPasswordShow)}><i class="far fa-eye user-registration-eye"></i></span>
                                                    </div>

                                                </div>
                                                <div className="col-lg-12">
                                                    <div style={{ display: 'flex' }} className="form-check justify-content-start">
                                                        <input
                                                            className="form-check-input me-2"
                                                            type="checkbox"
                                                            id="termsCheck"
                                                            checked={formData.agree}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, agree: e.target.checked })
                                                            }
                                                            required
                                                        />
                                                        <label className="form-check-label text-white" htmlFor="termsCheck">
                                                            I agree to the
                                                            <a href="/Pages?type=term" target="_blank" rel="noopener noreferrer" className="text-warning ms-1">
                                                                Terms & Conditions
                                                            </a>
                                                        </label>
                                                    </div>
                                                </div>


                                                <div style={{ display: 'flex' }} className="justify-content-center mx-5 mb-3 mb-lg-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg mt-4 yellow-bg-color"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <span>
                                                                Please wait
                                                                <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                                            </span>
                                                        ) : (
                                                            "Register"
                                                        )}
                                                    </button>

                                                </div>

                                                <div className='col-lg-12'>
                                                    <div style={{ display: 'flex' }} class="form-check justify-content-center mb-5">

                                                        <label class="form-check-label text-white" for="form2Example3">
                                                            Already have an Account? <a href="/login" class="text-warning">Login here</a>
                                                        </label>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </section >
        </>
    )
}

export default Register