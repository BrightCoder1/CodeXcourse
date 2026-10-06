import React from 'react';
// import './Footer.css';

const Footer = () => {
    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer-section">
            <div className="footer-container">

                {/* Top Tier: Brand Summary, Navigation & Links */}
                <div className="footer-top">

                    {/* Brand Col */}
                    <div className="footer-brand-col">
                        <div className="footer-logo" onClick={scrollToTop}>
                            <img src="./Logo.png" alt="CodeXCourse Logo" className="footer-logo-img" />
                        </div>

                        <p className="footer-tagline">
                            Empowering engineers and tech enthusiasts through project-first learning,
                            1:1 mentorship, and placement assistance.
                        </p>

                        <div className="system-status">
                            <span className="status-dot"></span>
                            <span>All Systems Operational • Admissions Open</span>
                        </div>

                        <div className="footer-socials">
                            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter / X">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="footer-links-col">
                        <h4>Quick Navigation</h4>
                        <ul>
                            <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Us</a></li>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>Explore Courses</a></li>
                            <li><a href="#blog" onClick={(e) => scrollToSection(e, 'blog')}>Engineering Blog</a></li>
                            <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact & Support</a></li>
                            <li><a href="#testimonials" onClick={(e) => scrollToSection(e, 'about')}>Success Stories</a></li>
                        </ul>
                    </div>

                    {/* Programs Column */}
                    <div className="footer-links-col">
                        <h4>Popular Tracks</h4>
                        <ul>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>Full-Stack Web Dev</a></li>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>DSA in Java & C++</a></li>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>Backend & System Design</a></li>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>AI & LLM Engineering</a></li>
                            <li><a href="#course" onClick={(e) => scrollToSection(e, 'course')}>React & TypeScript Mastery</a></li>
                        </ul>
                    </div>

                    {/* Learning Hub / Support Column */}
                    <div className="footer-links-col">
                        <h4>Support & Legal</h4>
                        <ul>
                            <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Doubt Resolution</a></li>
                            <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Hire from Us</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms & Conditions</a></li>
                            <li><a href="#refund">Refund Policy</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Tier: Copyright & Back to Top */}
                <div className="footer-bottom">
                    <p className="copyright-text">
                        © {new Date().getFullYear()} <strong>CodeXCourse</strong>. Built with ❤️ for aspiring engineers. All rights reserved.
                    </p>

                    <button
                        type="button"
                        className="back-to-top-text"
                        onClick={scrollToTop}
                    >
                        Back to Top ↑
                    </button>
                </div>

            </div>
        </footer>
    );
};

export default Footer;