import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Course Admission',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const inquiryTypes = [
        'Course Admission',
        'Curriculum & Syllabus',
        'Corporate Training',
        'Career Counseling'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInquirySelect = (type) => {
        setFormData((prev) => ({ ...prev, subject: type }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call / form submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                subject: 'Course Admission',
                message: ''
            });
        }, 4500);
    };

    return (
        <section className="contact-section" id="contact">
            <div className="contact-container">

                {/* Section Header */}
                <div className="contact-header">
                    <div className="contact-badge">
                        <span className="contact-dot"></span>
                        <span>Get In Touch</span>
                    </div>

                    <h2 className="contact-title">
                        Have Questions? Let's Talk <br />
                        <span className="highlight-text">About Your Career Goals</span>
                    </h2>
                    <p className="contact-subtitle">
                        Whether you want guidance choosing a track, need enterprise batch training,
                        or want to know more about placement records—our team responds within 2 business hours.
                    </p>
                </div>

                {/* Main Grid: Left Details & Right Form */}
                <div className="contact-grid">

                    {/* Left Column: Direct Contacts & Info */}
                    <div className="contact-info-col">
                        <div className="info-intro">
                            <h3>Connect with Our Mentors</h3>
                            <p>
                                Reach out directly via phone, email, or schedule a physical visit
                                to our tech learning campus.
                            </p>
                        </div>

                        <div className="contact-cards">
                            <div className="contact-card">
                                <div className="card-icon">📧</div>
                                <div>
                                    <h4>Email Us</h4>
                                    <p>admissions@codexcourse.com</p>
                                    <span>support@codexcourse.com</span>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="card-icon">📞</div>
                                <div>
                                    <h4>Call Our Advisors</h4>
                                    <p>+91 (800) 123-4567</p>
                                    <span>Mon-Sat from 9am to 7pm IST</span>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="card-icon">📍</div>
                                <div>
                                    <h4>Campus Location</h4>
                                    <p>CodeX Learning Hub, 4th Floor</p>
                                    <span>Koramangala, Bengaluru, Karnataka</span>
                                </div>
                            </div>

                            <div className="contact-card">
                                <div className="card-icon">💬</div>
                                <div>
                                    <h4>Live WhatsApp Support</h4>
                                    <p>Instant doubt assistance & brochures</p>
                                    <a href="#chat" className="chat-link">Chat on WhatsApp →</a>
                                </div>
                            </div>
                        </div>

                        {/* Quick trust reassurance badge */}
                        <div className="trust-card">
                            <span className="shield-icon">🛡️</span>
                            <div>
                                <strong>Zero Spam Guarantee</strong>
                                <p>We respect your privacy. Your information is never shared with third parties.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact & Inquiry Form */}
                    <div className="contact-form-card">
                        {submitted ? (
                            <div className="form-success">
                                <div className="success-icon">✓</div>
                                <h3>Message Sent Successfully!</h3>
                                <p>
                                    Thank you, <strong>{formData.fullName || 'Student'}</strong>. One of our senior academic
                                    counselors will get in touch with you shortly.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-head">
                                    <h3>Send a Message</h3>
                                    <p>Fill out the details below and we will get back to you promptly.</p>
                                </div>

                                {/* Inquiry Type Filter Pills */}
                                <div className="inquiry-group">
                                    <label>I want to ask about:</label>
                                    <div className="inquiry-pills">
                                        {inquiryTypes.map((type) => (
                                            <button
                                                type="button"
                                                key={type}
                                                className={`pill-btn ${formData.subject === type ? 'active' : ''}`}
                                                onClick={() => handleInquirySelect(type)}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Input Fields */}
                                <div className="input-row">
                                    <div className="input-group">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            required
                                            placeholder="e.g. Rahul Sharma"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            placeholder="e.g. rahul@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="phone">Phone / WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="message">Your Message or Query *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows="4"
                                        placeholder="Tell us about your background or specific questions regarding the course..."
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <button type="submit" className="submit-btn">
                                    Submit Inquiry
                                    <span className="arrow">→</span>
                                </button>
                            </form>
                        )}
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Contact;