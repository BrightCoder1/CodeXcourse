import React, { useState } from 'react';

const coursesData = [
    {
        id: 1,
        category: 'web',
        tag: 'Bestseller',
        title: 'Full-Stack Web Development Bootcamp',
        description: 'Master React 19, Next.js, Node.js, Express, MongoDB, and Tailwind CSS by shipping 8 production-grade apps.',
        rating: 4.9,
        reviews: '3.4k',
        duration: '16 Weeks',
        level: 'Beginner to Advanced',
        price: '$79',
        originalPrice: '$199',
        badgeColor: 'blue',
        skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL']
    },
    {
        id: 2,
        category: 'dsa',
        tag: 'Placement Ready',
        title: 'Data Structures & Algorithms in Java / C++',
        description: 'Crack coding rounds at top tech companies. Covers 350+ LeetCode problems with optimal time & space complexity.',
        rating: 4.8,
        reviews: '2.1k',
        duration: '12 Weeks',
        level: 'Intermediate',
        price: '$69',
        originalPrice: '$149',
        badgeColor: 'purple',
        skills: ['Arrays & Graphs', 'Dynamic Prog', 'Recursion', 'System Design']
    },
    {
        id: 3,
        category: 'ai',
        tag: 'Trending',
        title: 'AI Engineering & LLM Application Building',
        description: 'Build real-world AI applications using LangChain, RAG pipelines, OpenAI APIs, and vector databases.',
        rating: 4.9,
        reviews: '1.2k',
        duration: '10 Weeks',
        level: 'Intermediate to Advanced',
        price: '$89',
        originalPrice: '$219',
        badgeColor: 'emerald',
        skills: ['Python', 'LangChain', 'Vector DB', 'RAG']
    },
    {
        id: 4,
        category: 'web',
        tag: 'Hot',
        title: 'Frontend Mastery with React & TypeScript',
        description: 'Deep dive into modern frontend architecture, state management with Zustand & Redux, and micro-frontends.',
        rating: 4.7,
        reviews: '1.8k',
        duration: '8 Weeks',
        level: 'Beginner Friendly',
        price: '$49',
        originalPrice: '$119',
        badgeColor: 'blue',
        skills: ['React', 'TypeScript', 'Tailwind', 'Testing']
    },
    {
        id: 5,
        category: 'dsa',
        tag: 'High Demand',
        title: 'Backend Engineering & System Design',
        description: 'Learn scalable microservices, Docker, Redis caching, message queues (Kafka), and distributed systems.',
        rating: 4.9,
        reviews: '980',
        duration: '14 Weeks',
        level: 'Advanced',
        price: '$99',
        originalPrice: '$249',
        badgeColor: 'purple',
        skills: ['Docker', 'Kafka', 'Redis', 'Microservices']
    },
    {
        id: 6,
        category: 'ai',
        tag: 'Popular',
        title: 'Python for Data Science & Machine Learning',
        description: 'From NumPy & Pandas data wrangling to Scikit-learn algorithms and end-to-end model deployments.',
        rating: 4.8,
        reviews: '1.5k',
        duration: '12 Weeks',
        level: 'All Levels',
        price: '$59',
        originalPrice: '$139',
        badgeColor: 'emerald',
        skills: ['Python', 'Pandas', 'Scikit-Learn', 'Maths for ML']
    }
];

const Course = () => {
    const [activeTab, setActiveTab] = useState('all');

    const filteredCourses = activeTab === 'all'
        ? coursesData
        : coursesData.filter((course) => course.category === activeTab);

    return (
        <section className="course-section" id="course">
            <div className="course-container">

                {/* Section Header */}
                <div className="course-header">
                    <div className="course-badge">
                        <span className="course-dot"></span>
                        <span>Explore Programs</span>
                    </div>

                    <h2 className="course-title">
                        Industry-Curated <span className="highlight-text">Certification Courses</span>
                    </h2>
                    <p className="course-subtitle">
                        Curated by senior software engineers. Gain hands-on project experience, code reviews,
                        and job readiness with lifetime access.
                    </p>

                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Courses
                        </button>
                        <button
                            className={`filter-btn ${activeTab === 'web' ? 'active' : ''}`}
                            onClick={() => setActiveTab('web')}
                        >
                            🌐 Web Development
                        </button>
                        <button
                            className={`filter-btn ${activeTab === 'dsa' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dsa')}
                        >
                            ⚡ DSA & Backend
                        </button>
                        <button
                            className={`filter-btn ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            🤖 AI & Data Science
                        </button>
                    </div>
                </div>

                {/* Course Cards Grid */}
                <div className="course-grid">
                    {filteredCourses.map((course) => (
                        <div className="course-card" key={course.id}>

                            {/* Card Header & Badge */}
                            <div className="card-top">
                                <span className={`course-tag tag-${course.badgeColor}`}>
                                    {course.tag}
                                </span>
                                <span className="course-level">{course.level}</span>
                            </div>

                            {/* Title & Description */}
                            <h3 className="card-title">{course.title}</h3>
                            <p className="card-desc">{course.description}</p>

                            {/* Skill Tags */}
                            <div className="skill-tags">
                                {course.skills.map((skill, index) => (
                                    <span key={index} className="skill-pill">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Meta Info: Rating & Duration */}
                            <div className="card-meta">
                                <div className="rating-box">
                                    <span className="star">⭐</span>
                                    <strong>{course.rating}</strong>
                                    <span className="reviews">({course.reviews})</span>
                                </div>
                                <div className="duration-box">
                                    <span className="clock">⏱️</span>
                                    <span>{course.duration}</span>
                                </div>
                            </div>

                            {/* Card Footer: Pricing & Action Button */}
                            <div className="card-footer">
                                <div className="price-box">
                                    <span className="current-price">{course.price}</span>
                                    <span className="old-price">{course.originalPrice}</span>
                                </div>
                                <button className="enroll-btn">
                                    Enroll Now
                                    <span className="arrow">→</span>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Bottom Banner */}
                <div className="course-cta-banner">
                    <div>
                        <h3>Need help choosing the right path?</h3>
                        <p>Book a free 1-on-1 career counselling call with our senior instructors.</p>
                    </div>
                    <button className="counseling-btn">Book Free Call</button>
                </div>

            </div>
        </section>
    );
};

export default Course;