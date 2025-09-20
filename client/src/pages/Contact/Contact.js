import React, { useState } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import axios from 'axios';

const url = `https://api.dessobuild.com/api/v1/create-contact`;

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        subject: '',
        number: '',
        message: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "number") {
            const cleanedValue = value.replace(/\D/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: cleanedValue
            }));
            if (cleanedValue.length === 0) {
                setPhoneError("Phone number is required.");
            } else if (cleanedValue.length !== 10) {
                setPhoneError("Phone number must be exactly 10 digits.");
            } else {
                setPhoneError("");
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setPhoneError('');

        const { name, lastName, subject, number, message } = formData;
        if (!name || !lastName || !subject || !number || !message) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        if (!/^\d{10}$/.test(number)) {
            setPhoneError("Phone number must be exactly 10 digits.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(url, formData);
            setSuccessMsg("🎉 Thank you! Your message has been sent successfully. We'll get back to you soon!");
            setFormData({
                name: '',
                lastName: '',
                subject: '',
                number: '',
                message: ''
            });
        } catch (error) {
            setErrorMsg("😔 Oops! Something went wrong. Please try again or contact us directly.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BreadCrumbs path={"Contact"} title={"Contact Us"} />
            <div className="min-vh-100 bg-light">
                <section className="py-5">
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-5">
                                <div className="h-100">
                                    <h3 className="fw-bold mb-4" style={{ color: "#042F66" }}>
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        Get in Touch
                                    </h3>
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm h-100 hover-card">
                                                <div style={{display:'flex'}} className="card-body align-items-start">
                                                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3 flex-shrink-0">
                                                        <i className="fas fa-envelope fa-lg" style={{ color: "#042F66" }}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="card-title fw-bold mb-2" style={{ color: "#042F66" }}>Email Us</h6>
                                                        <p className="card-text mb-0">
                                                            <a href="mailto:info@dessobuild.com" className="text-decoration-none" style={{ color: "#6c757d" }}>
                                                                info@dessobuild.com
                                                            </a>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm h-100 hover-card">
                                                <div style={{display:'flex'}} className="card-body align-items-start">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3 flex-shrink-0">
                                                        <i className="fas fa-share-alt fa-lg" style={{ color: "#042F66" }}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="card-title fw-bold mb-2" style={{ color: "#042F66" }}>Follow Us</h6>
                                                        <div style={{display:'flex'}} className=" gap-3">
                                                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                                <i className="fab fa-facebook-f fa-lg" style={{ color: "#4267B2" }}></i>
                                                            </a>
                                                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                                <i className="fab fa-twitter fa-lg" style={{ color: "#1DA1F2" }}></i>
                                                            </a>
                                                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                                <i className="fab fa-instagram fa-lg" style={{ color: "#E1306C" }}></i>
                                                            </a>
                                                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                                <i className="fab fa-linkedin-in fa-lg" style={{ color: "#0077B5" }}></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-4" style={{ color: "#042F66" }}>Frequently Asked Questions</h3>
                                    <div className="accordion" id="contactFaqAccordion">
                                        <div className="accordion-item border-0 shadow-sm mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#contactFaq1">
                                                    How quickly will you respond to my message?
                                                </button>
                                            </h2>
                                            <div id="contactFaq1" className="accordion-collapse collapse" data-bs-parent="#contactFaqAccordion">
                                                <div className="accordion-body text-start">
                                                    We typically respond within 24 hours during business days. For urgent matters, please email us directly.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="accordion-item border-0 shadow-sm mb-2">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#contactFaq2">
                                                    What information should I include in my message?
                                                </button>
                                            </h2>
                                            <div id="contactFaq2" className="accordion-collapse collapse" data-bs-parent="#contactFaqAccordion">
                                                <div className="accordion-body text-start">
                                                    Please provide as much detail as possible about your project or inquiry, including timeline, budget range, and specific requirements.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="card border-0 shadow-lg">
                                    <div className="card-body p-4 p-md-5">
                                        <div className="text-center mb-4">
                                            <h3 className="fw-bold mb-2" style={{ color: "#042F66" }}>Send us a Message</h3>
                                            <p className="text-muted">Fill out the form below and we'll get back to you as soon as possible!</p>
                                        </div>
                                        <form onSubmit={handleSubmit}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            className="form-control"
                                                            id="firstName"
                                                            placeholder="First Name"
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <label htmlFor="firstName">
                                                            <i className="fas fa-user me-2"></i>First Name
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            className="form-control"
                                                            id="lastName"
                                                            placeholder="Last Name"
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <label htmlFor="lastName">
                                                            <i className="fas fa-user me-2"></i>Last Name
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            name="subject"
                                                            value={formData.subject}
                                                            className="form-control"
                                                            id="subject"
                                                            placeholder="Subject"
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <label htmlFor="subject">
                                                            <i className="fas fa-tag me-2"></i>Subject
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <input
                                                            type="tel"
                                                            name="number"
                                                            value={formData.number}
                                                            className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                                            id="phoneNumber"
                                                            placeholder="Phone Number"
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                        <label htmlFor="phoneNumber">
                                                            <i className="fas fa-phone me-2"></i>Phone Number
                                                        </label>
                                                    </div>
                                                    {phoneError && (
                                                        <div className="invalid-feedback d-block">
                                                            {phoneError}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-12">
                                                    <div className="form-floating">
                                                        <textarea
                                                            name="message"
                                                            value={formData.message}
                                                            className="form-control"
                                                            id="message"
                                                            placeholder="Your message"
                                                            style={{ height: '120px' }}
                                                            onChange={handleChange}
                                                            required
                                                        ></textarea>
                                                        <label htmlFor="message">
                                                            <i className="fas fa-comment me-2"></i>Your Message
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            {errorMsg && (
                                                <div style={{display:'flex'}} className="alert alert-danger align-items-center mt-3" role="alert">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    {errorMsg}
                                                </div>
                                            )}
                                            {successMsg && (
                                                <div style={{display:'flex'}} className="alert alert-success align-items-center mt-3" role="alert">
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    {successMsg}
                                                </div>
                                            )}
                                            <div className="d-grid mt-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                    disabled={loading}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        border: 'none'
                                                    }}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Sending Message...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-paper-plane me-2"></i>
                                                            Send Message
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* <section className="py-5 bg-white">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center">
                                <h3 className="fw-bold mb-4">Frequently Asked Questions</h3>
                                <div className="accordion" id="faqAccordion">
                                    <div className="accordion-item border-0 shadow-sm mb-2">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                                How quickly will you respond to my message?
                                            </button>
                                        </h2>
                                        <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body text-start">
                                                We typically respond within 24 hours during business days. For urgent matters, please call us directly.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item border-0 shadow-sm mb-2">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                                What information should I include in my message?
                                            </button>
                                        </h2>
                                        <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body text-start">
                                                Please provide as much detail as possible about your project or inquiry, including timeline, budget range, and specific requirements.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <style>{`
                .hover-card {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .hover-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                .form-floating > label {
                    color: #6c757d;
                }
                .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                }
                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
                .accordion-button:not(.collapsed) {
                    background-color: #f8f9fa;
                    color: #667eea;
                }
            `}</style>
        </>
    );
};

export default Contact;