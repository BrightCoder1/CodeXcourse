import React, { useState, useEffect } from 'react';

const useCountUp = (targetNumber, duration = 1800) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        let animationFrameId;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * targetNumber));

            if (progress < 1) {
                animationFrameId = window.requestAnimationFrame(step);
            }
        };

        animationFrameId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [targetNumber, duration]);

    return count;
};

const About = () => {
    const yearsExp = useCountUp(5, 1200);
    const mentorsCount = useCountUp(80, 1500);
    const hiringPartners = useCountUp(350, 1800);
    const communityMembers = useCountUp(25000, 2000);

    const pillars = [
        {
            icon: '🎯',
            title: 'Project-First Methodology',
            desc: 'No endless theoretical tutorials. Every concept is solidified by creating production-ready applications with modern tech stacks.'
        },
        {
            icon: '👨‍💻',
            title: 'Industry Veteran Mentors',
            desc: 'Learn directly from engineers working at top product-based tech companies who conduct code reviews and 1:1 guidance.'
        },
        {
            icon: '🤝',
            title: 'Career & Placement Support',
            desc: 'From resume teardowns and mock technical interviews to referrals across 350+ partner companies hiring our graduates.'
        }
    ];

    return (
        <section className="about-section" id="about">
            <div className="about-container">

                {/* Top Header Tag & Title */}
                <div className="about-header">
                    <div className="about-badge">
                        <span className="about-dot"></span>
                        <span>About CodeXCourse</span>
                    </div>
                    <h2 className="about-title">
                        Empowering the Next Generation of <br />
                        <span className="highlight-text">World-Class Developers</span>
                    </h2>
                    <p className="about-subtitle">
                        We bridge the gap between academic theory and real-world tech demands.
                        Our mission is to help aspiring coders build confidence, tackle real engineering
                        problems, and launch rewarding careers.
                    </p>
                </div>

                {/* Content Grid: Left Story Card & Right Pillars */}
                <div className="about-grid">

                    {/* Left Narrative Card */}
                    <div className="story-card">
                        <div className="story-header">
                            <span className="story-tag">Our Mission</span>
                            <h3>Why We Started CodeXCourse</h3>
                        </div>
                        <p>
                            Traditional tech education often focuses heavily on rote memorization while
                            ignoring clean architecture, git workflows, and system design.
                        </p>
                        <p>
                            We established <strong>CodeXCourse</strong> with a single objective: empower learners
                            through deep project-based immersion, live pair-programming sessions, and an active community
                            ready to debug together.
                        </p>

                        {/* Quick checklist */}
                        <div className="story-points">
                            <div className="point-item">
                                <span className="check-icon">✓</span>
                                <span>Curriculum updated quarterly for 2026+ tech trends</span>
                            </div>
                            <div className="point-item">
                                <span className="check-icon">✓</span>
                                <span>Real pull-request code reviews by senior developers</span>
                            </div>
                            <div className="point-item">
                                <span className="check-icon">✓</span>
                                <span>Lifetime access to community & course resources</span>
                            </div>
                        </div>

                        <div className="story-author">
                            <div className="author-avatar">💻</div>
                            <div>
                                <h4>Founded by Developers, for Developers</h4>
                                <p>Guided by active industry tech leads</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pillars & Highlights */}
                    <div className="pillars-wrapper">
                        {pillars.map((pillar, idx) => (
                            <div className="pillar-card" key={idx}>
                                <div className="pillar-icon-box">{pillar.icon}</div>
                                <div className="pillar-text">
                                    <h4>{pillar.title}</h4>
                                    <p>{pillar.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Animated Statistics */}
                <div className="about-metrics">
                    <div className="metric-box">
                        <h3>{yearsExp}+</h3>
                        <p>Years of Excellence</p>
                    </div>
                    <div className="metric-sep"></div>

                    <div className="metric-box">
                        <h3>{mentorsCount}+</h3>
                        <p>Expert Instructors</p>
                    </div>
                    <div className="metric-sep"></div>

                    <div className="metric-box">
                        <h3>{hiringPartners}+</h3>
                        <p>Hiring Partners</p>
                    </div>
                    <div className="metric-sep"></div>

                    <div className="metric-box">
                        <h3>{communityMembers.toLocaleString()}+</h3>
                        <p>Global Learners</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default About;