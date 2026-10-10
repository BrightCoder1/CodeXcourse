import React, { useState } from 'react';

const initialEnrollments = Array.from({ length: 100 }, (_, index) => {
  const isEven = index % 2 === 0;
  return {
    id: index + 1,
    name: isEven ? 'Aria Chen' : 'Leo Novak',
    avatar: isEven
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    course: isEven ? 'Intro to Python' : 'React basics',
    date: isEven ? 'Apr 25, 2023' : 'Sep 18, 2023',
    status: isEven ? 'Active' : 'Pending',
  };
});

const RecentStudent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Search aur Dropdown Filter logic
  const filteredList = initialEnrollments.filter((item) => {
    // Dropdown Status filter
    const matchesStatus =
      filter === 'All' || item.status.toLowerCase() === filter.toLowerCase();

    // Search query matches any detail: Name, Course, Date, or Status
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.course.toLowerCase().includes(query) ||
      item.date.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const getCurrentPageSize = (page) => (page === 1 ? 10 : 40);

  const startIndex = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 40;
  const currentLimit = getCurrentPageSize(currentPage);
  const endIndex = startIndex + currentLimit;

  const displayedStudents = filteredList.slice(startIndex, endIndex);

  const remainingCount = Math.max(0, filteredList.length - 10);
  const totalPages =
    filteredList.length === 0 ? 1 : 1 + Math.ceil(remainingCount / 40);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Search karte waqt wapas 1st page par le aayega
  };

  return (
    <div className="recent-students-card">
      {/* Header Section: Title, Search Bar & Status Filter */}
      <div className="recent-header">
        <h3 className="recent-title">Recent Student Enrollments</h3>

        <div className="header-actions">
          {/* Search Input Box */}
          <div className="search-box">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by student, course, date..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="filter-dropdown">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All frequent</option>
              <option value="Active">Active only</option>
              <option value="Pending">Pending only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.length > 0 ? (
              displayedStudents.map((item) => (
                <tr key={item.id}>
                  <td className="student-info-cell">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="student-avatar"
                    />
                    <span className="student-name">{item.name}</span>
                  </td>
                  <td className="course-cell">{item.course}</td>
                  <td className="date-cell">{item.date}</td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-cell">
                  No records found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pagination Controls */}
      <div className="pagination-wrapper">
        <span className="pagination-info">
          Showing <strong>{filteredList.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
          <strong>{Math.min(endIndex, filteredList.length)}</strong> of{' '}
          <strong>{filteredList.length}</strong>
        </span>

        <div className="pagination-buttons">
          <button
            className="pag-btn"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="pag-btn"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            Next ({currentPage === 1 ? '40 items' : '40 items'})
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentStudent;