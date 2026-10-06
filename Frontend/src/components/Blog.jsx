import React, { useState } from 'react';
// import './Blog.css';

const blogPosts = [
    {
        id: 1,
        category: 'react',
        tag: 'Web Dev',
        title: 'Top React Patterns & Best Practices to Master',
        excerpt: 'Explore modern component composition, custom hook architectures, and state optimization strategies for high-performance React applications.',
        coverImg: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
        author: {
            name: 'Aditi Sharma',
            role: 'Staff Frontend Engineer',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Oct 02, 2026',
        readTime: '6 min read'
    },
    {
        id: 2,
        category: 'dsa',
        tag: 'Algorithms',
        title: 'Demystifying Dynamic Programming: The Memoization Blueprint',
        excerpt: 'Stop memorizing LeetCode solutions. Learn how to break down complex overlapping subproblems with intuitive state transitions.',
        coverImg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',
        author: {
            name: 'Vikram Joshi',
            role: 'SDE-2 @ Product Co.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Sep 27, 2026',
        readTime: '8 min read'
    },
    {
        id: 3,
        category: 'ai',
        tag: 'AI & Data',
        title: 'Building Production-Ready AI Agents with LangChain & Python',
        excerpt: 'Step-by-step walkthrough of building a contextual retrieval-augmented generation (RAG) assistant connected to enterprise vector databases.',
        coverImg: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
        author: {
            name: 'Pooja Iyer',
            role: 'AI Researcher',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Sep 21, 2026',
        readTime: '10 min read'
    },
    {
        id: 4,
        category: 'career',
        tag: 'Career Advice',
        title: 'How to Crack Frontend Machine Coding Rounds in 2026',
        excerpt: 'What interviewers look for when asking you to build a live nested comment widget, autocomplete search, or infinite virtual scroller under 60 minutes.',
        coverImg: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        author: {
            name: 'Rohan Mehra',
            role: 'Tech Lead & Hiring Mgr',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Sep 15, 2026',
        readTime: '5 min read'
    },
    {
        id: 5,
        category: 'react',
        tag: 'Backend',
        title: 'Designing Resilient Microservices with Node.js & Docker',
        excerpt: 'A comprehensive guide to message queues, rate limiters, circuit breakers, and zero-downtime containerized deployments.',
        coverImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        author: {
            name: 'Kabir Verma',
            role: 'DevOps Architect',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Sep 08, 2026',
        readTime: '7 min read'
    },
    {
        id: 6,
        category: 'career',
        tag: 'Open Source',
        title: 'Making Your First Meaningful Open Source Pull Request',
        excerpt: 'How to discover beginner-friendly repositories, understand codebase architecture, communicate on GitHub issues, and pass CI checks.',
        coverImg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        author: {
            name: 'Sneha Roy',
            role: 'Full Stack Dev',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
        },
        date: 'Sep 02, 2026',
        readTime: '4 min read'
    }
];

const Blog = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedPost, setSelectedPost] = useState(null);

    const filteredPosts = activeTab === 'all'
        ? blogPosts
        : blogPosts.filter((post) => post.category === activeTab);

    return (
        <section className="blog-section" id="blog">
            <div className="blog-container">

                {/* Section Header */}
                <div className="blog-header">
                    <div className="blog-badge">
                        <span className="blog-dot"></span>
                        <span>Articles &amp; Tech Insights</span>
                    </div>
                    <h2 className="blog-title">
                        Latest From Our <span className="highlight-text">Engineering Blog</span>
                    </h2>
                    <p className="blog-subtitle">
                        Deep-dives, interview cheat sheets, system design breakdowns, and actionable tips written by mentors at CodeXCourse.
                    </p>

                    {/* Filter Categories */}
                    <div className="blog-filters">
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Articles
                        </button>
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === 'react' ? 'active' : ''}`}
                            onClick={() => setActiveTab('react')}
                        >
                            🌐 Web &amp; Node.js
                        </button>
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === 'dsa' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dsa')}
                        >
                            ⚡ DSA &amp; Coding
                        </button>
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === 'ai' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            🤖 AI &amp; Python
                        </button>
                        <button
                            type="button"
                            className={`filter-btn ${activeTab === 'career' ? 'active' : ''}`}
                            onClick={() => setActiveTab('career')}
                        >
                            💼 Career &amp; Guides
                        </button>
                    </div>
                </div>

                {/* Blog Post Grid */}
                <div className="blog-grid">
                    {filteredPosts.map((post) => (
                        <article className="blog-card" key={post.id}>
                            {/* Image & Category Pill */}
                            <div className="card-thumb-wrap">
                                <img
                                    src={post.coverImg}
                                    alt={post.title}
                                    className="card-thumb"
                                    loading="lazy"
                                />
                                <span className="card-category-badge">{post.tag}</span>
                            </div>

                            {/* Card Body */}
                            <div className="card-content">
                                <div className="card-meta">
                                    <span>{post.date}</span>
                                    <span className="dot-divider">•</span>
                                    <span>{post.readTime}</span>
                                </div>

                                <h3 className="card-heading">{post.title}</h3>
                                <p className="card-excerpt">{post.excerpt}</p>

                                {/* Footer with Author Details & CTA */}
                                <div className="card-footer">
                                    <div className="author-box">
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="author-avatar"
                                        />
                                        <div>
                                            <strong>{post.author.name}</strong>
                                            <p>{post.author.role}</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="read-more-btn"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        Read
                                        <span className="arrow">→</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Newsletter Signup Strip */}
                <div className="blog-newsletter">
                    <div className="newsletter-text">
                        <h3>Subscribe to CodeX Weekly</h3>
                        <p>Get curated coding interview problems, system design digests, and tech tutorials in your inbox.</p>
                    </div>
                    <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            required
                        />
                        <button type="submit">Join 15k+ Devs</button>
                    </form>
                </div>

            </div>

            {/* Article Detail Modal Viewer */}
            {selectedPost && (
                <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close-btn"
                            onClick={() => setSelectedPost(null)}
                            aria-label="Close article"
                        >
                            ✕
                        </button>

                        <img
                            src={selectedPost.coverImg}
                            alt={selectedPost.title}
                            className="modal-banner"
                        />

                        <div className="modal-body">
                            <span className="card-category-badge modal-badge">{selectedPost.tag}</span>
                            <h2>{selectedPost.title}</h2>

                            <div className="modal-author-strip">
                                <img
                                    src={selectedPost.author.avatar}
                                    alt={selectedPost.author.name}
                                    className="author-avatar"
                                />
                                <div>
                                    <strong>{selectedPost.author.name}</strong> • <span>{selectedPost.author.role}</span>
                                    <p>{selectedPost.date} — {selectedPost.readTime}</p>
                                </div>
                            </div>

                            <div className="modal-text">
                                <p>{selectedPost.excerpt}</p>
                                <p>
                                    At <strong>CodeXCourse</strong>, our practical projects are designed to bridge theoretical understanding and production-grade delivery. Dive into the core architectural patterns, analyze common edge cases, and run benchmark tests directly in your IDE.
                                </p>
                                <blockquote>
                                    "Writing maintainable code is not about showing how smart you are; it's about making things easy for the engineer who reads your codebase next."
                                </blockquote>
                                <p>
                                    Explore the full course tracks and repository blueprints inside the student dashboard to test this implementation live.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-action-btn"
                                onClick={() => setSelectedPost(null)}
                            >
                                Close Article
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Blog;