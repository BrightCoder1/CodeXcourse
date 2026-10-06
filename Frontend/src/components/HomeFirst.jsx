import React, { useState, useEffect } from 'react';
import studentImg from '/student.png';

const useCountUp = (targetNumber, duration = 1800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease-out cubic curve: fast at start, smooth landing at the end
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

const HomeFirst = () => {
  // Counters animate automatically when the component mounts on page reload
  const studentCount = useCountUp(15000, 2000);
  const projectCount = useCountUp(50, 1600);
  const placementRate = useCountUp(94, 1800);

  return (
    <div className="home-container">
      <main className="hero-section">
        {/* Left Side: Student Image & Badges */}
        <div className="hero-left">
          <div className="image-wrapper">
            <div className="glow-circle"></div>
            <img 
              src={studentImg} 
              alt="CodeXCourse Student Learning" 
              className="student-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80";
              }}
            />

            <div className="floating-badge badge-top">
              <span className="badge-icon">🚀</span>
              <div>
                <h4>Grow Your Future</h4>
                <p>100% Practical Learning</p>
              </div>
            </div>

            <div className="floating-badge badge-bottom">
              <span className="badge-icon">⭐</span>
              <div>
                <h4>4.9 / 5 Rating</h4>
                <p>Over {studentCount.toLocaleString()}+ Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Welcome Details */}
        <div className="hero-right">
          <div className="tagline-badge">
            <span className="dot"></span>
            <span>Welcome to CodeXCourse</span>
          </div>

          <h1 className="hero-title">
            Learn Code, Build Real Projects, <br />
            <span className="highlight-text">Grow Your Future.</span>
          </h1>

          <p className="hero-description">
            Master high-demand tech skills from industry experts. From Web Development 
            and DSA to Full-Stack Engineering, level up your career with interactive 
            practice and dedicated mentorship.
          </p>

          {/* Quick Track Chips */}
          <div className="course-tracks">
            <span className="track-chip">🌐 Web Development</span>
            <span className="track-chip">⚡ Data Structures &amp; Algorithms</span>
            <span className="track-chip">💻 Full Stack Development</span>
          </div>

          {/* Action Buttons */}
          <div className="cta-group">
            <button className="btn-primary btn-large">
              Start Learning Now
              <span className="arrow">→</span>
            </button>
            <button className="btn-outline btn-large">
              Explore Curriculum
            </button>
          </div>

          {/* Stats Bar with Animated Increasing Numbers */}
          <div className="hero-stats">
            <div className="stat-item">
              <h3>{projectCount}+</h3>
              <p>Hands-on Projects</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>1:1</h3>
              <p>Doubt Assistance</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>{placementRate}%</h3>
              <p>Placement Rate</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeFirst;