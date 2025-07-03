import React, { useState } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import axios from 'axios';

const url = `https://api.helpubuild.in/api/v1/create-contact`;

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
            // Remove non-digits if you want to enforce numeric only
            const cleanedValue = value.replace(/\D/g, '');

            // Update form data
            setFormData((prev) => ({
                ...prev,
                [name]: cleanedValue
            }));

            // Live validation
            if (cleanedValue.length === 0) {
                setPhoneError("Phone number is required.");
            } else if (cleanedValue.length !== 10) {
                setPhoneError("Phone number must be exactly 10 digits.");
            } else {
                setPhoneError(""); // No error
            }
        } else {
            // Other fields
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
        // Clear previous error
        setPhoneError('');

        // Simple validation
        const { name, lastName, subject, number, message } = formData;
        if (!name || !lastName || !subject || !number || !message) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        // Validate phone number length
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


                {/* Main Content */}
                <section className="py-5">
                    <div className="container">
                        <div className="row g-5">
                            {/* Contact Information */}
                            <div className="col-lg-5">
                                <div className="h-100">
                                    <h3 className="fw-bold mb-4 text-primary">
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        Get in Touch
                                    </h3>

                                    {/* Contact Cards */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm h-100 hover-card">
                                                <div className="card-body d-flex align-items-start">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3 flex-shrink-0">
                                                        <i className="fas fa-map-marker-alt text-primary fa-lg"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="card-title fw-bold mb-2">Visit Our Office</h6>
                                                        <p className="card-text text-muted mb-0">
                                                            E-520A, 3rd Floor, Sector 7<br />
                                                            Dwarka, New Delhi - 110075
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm h-100 hover-card">
                                                <div className="card-body d-flex align-items-start">
                                                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3 flex-shrink-0">
                                                        <i className="fas fa-envelope text-success fa-lg"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="card-title fw-bold mb-2">Email Us</h6>
                                                        <p className="card-text mb-0">
                                                            <a href="mailto:info@helpubuild.in" className="text-decoration-none">
                                                                info@helpubuild.in
                                                            </a>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map */}
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-0">
                                            <div className="ratio ratio-16x9">
                                                <iframe
                                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.492516315673!2d77.06982277522413!3d28.584997986238168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b8edcfcd7f9%3A0x74a42210a33d0b1d!2sPandit%20Buildwell%20%7C%20Best%20Architects%20and%20Interior%20Designer%20in%20Delhi!5e0!3m2!1sen!2sin!4v1733481938019!5m2!1sen!2sin"
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    className="rounded"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="col-lg-7">
                                <div className="card border-0 shadow-lg">
                                    <div className="card-body p-4 p-md-5">
                                        <div className="text-center mb-4">
                                            <h3 className="fw-bold text-primary mb-2">Send us a Message</h3>
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

                                            {/* Alert Messages */}
                                            {errorMsg && (
                                                <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    {errorMsg}
                                                </div>
                                            )}

                                            {successMsg && (
                                                <div className="alert alert-success d-flex align-items-center mt-3" role="alert">
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

                {/* FAQ Section */}
                <section className="py-5 bg-white">
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
                </section>
            </div>

            {/* Bootstrap JS */}
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