import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const courseStatuses = ['Active', 'Upcoming', 'Completed', 'Inactive'];

const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
        ? 'Not specified'
        : parsedDate.toLocaleDateString();
};

const Course = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${API_URL}/display/course`, {
                    signal: controller.signal
                });

                if (!response.data?.success || !Array.isArray(response.data.data)) {
                    throw new Error('The server returned an invalid courses response.');
                }

                setCourses(response.data.data);
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setError(
                        requestError.response?.data?.message
                        || requestError.message
                        || 'Unable to load courses. Please try again later.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCourses();
        return () => controller.abort();
    }, []);

    const filteredCourses = activeTab === 'all'
        ? courses
        : courses.filter((course) => course.status === activeTab);

    return (
        <section className="course-section" id="course">
            <div className="course-container">
                <div className="course-header">
                    <div className="course-badge">
                        <span className="course-dot"></span>
                        <span>Explore Programs</span>
                    </div>

                    <h2 className="course-title">
                        Industry-Curated <span className="highlight-text">Certification Courses</span>
                    </h2>
                    <p className="course-subtitle">
                        Explore courses led by experienced instructors and find the right program for you.
                    </p>

                    <div className="filter-tabs">
                        <button
                            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Courses
                        </button>
                        {courseStatuses.map((status) => (
                            <button
                                key={status}
                                className={`filter-btn ${activeTab === status ? 'active' : ''}`}
                                onClick={() => setActiveTab(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && <p className="course-message" role="status">Loading courses...</p>}
                {!isLoading && error && <p className="course-message course-error" role="alert">{error}</p>}
                {!isLoading && !error && filteredCourses.length === 0 && (
                    <p className="course-message">
                        {courses.length === 0
                            ? 'No courses are available right now.'
                            : `No ${activeTab.toLowerCase()} courses are available right now.`}
                    </p>
                )}

                {!isLoading && !error && filteredCourses.length > 0 && (
                    <div className="course-grid">
                        {filteredCourses.map((course) => (
                            <article className="course-card" key={course._id}>
                                {course.courseImageUrl && (
                                    <img
                                        className="course-image"
                                        src={course.courseImageUrl}
                                        alt={course.courseName}
                                        loading="lazy"
                                    />
                                )}

                                <div className="card-top">
                                    <span className={`course-tag tag-${(course.status || 'inactive').toLowerCase()}`}>
                                        {course.courseCode}
                                    </span>
                                    <span className="course-level">{course.status || 'Status unavailable'}</span>
                                </div>

                                <h3 className="card-title">{course.courseName}</h3>
                                <p className="card-desc">
                                    Instructor: {course.instructorName}
                                    {course.qualification && ` · ${course.qualification}`}
                                </p>

                                <div className="card-meta">
                                    <div className="duration-box">
                                        <span>Starts: {formatDate(course.startingDate)}</span>
                                    </div>
                                    <div className="duration-box">
                                        <span>Ends: {formatDate(course.endingDate)}</span>
                                    </div>
                                </div>
                                
                                {['active', 'upcoming'].includes((course.status || '').toLowerCase()) && (
                                    <button type="button"
                                        className="enroll-btn"
                                        onClick={() => {
                                            toast.info('Please fill out this form, and our team will contact you within 72 hours.');
                                            navigate('/', { state: { targetSection: 'contact' } });
                                        }}
                                    >
                                        Enroll Now
                                    </button>
                                )}
                                {course.status?.toLowerCase() === 'completed' && (
                                    <button type="button" className="enroll-btn enroll-btn-completed" disabled>
                                        Completed
                                    </button>
                                )}
                                {course.status?.toLowerCase() === 'inactive' && (
                                    <button type="button" className="enroll-btn enroll-btn-inactive" disabled>
                                        Inactive
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}

                <div className="course-cta-banner">
                    <div>
                        <h3>Need help choosing the right path?</h3>
                        <p>Book a free 1-on-1 career counselling call with our senior instructors.</p>
                    </div>
                    <button className="counseling-btn" onClick={(e) => {
                        alert("Upcoming feature: Book Free Call functionality is not implemented yet.");
                    }}>Book Free Call</button>
                </div>
            </div>
        </section>
    );
};

export default Course;
