
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import "./EmployeeEdit.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const initialFormData = {
  emp_name: "",
  email: "",
  contact_number: "",
  emp_dob: "",
  emp_qualification: "",
  emp_department: "",
  emp_course: "",
  emp_role: "employee",
  emp_joining_date: "",
  emp_status: "Active",
  emp_attendance: "100%",
  emp_aadharnumber: "",
  pan_number: "",
  address: "",
  accountnumber: "",
  ifsc_code: "",
  password: "",
};

const formatDateForInput = (value) => {
  if (!value) return "";

  const dateString = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    const fetchEmployee = async () => {
      if (!id) {
        setError("Employee ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/get/employee/${encodeURIComponent(id)}`
        );

        if (!active) return;

        const employee =
          response.data?.data || response.data?.employee;

        if (!employee) {
          throw new Error(
            "Employee data was not returned by the API."
          );
        }

        setFormData({
          ...initialFormData,
          ...employee,
          emp_dob: formatDateForInput(employee.emp_dob),
          emp_joining_date: formatDateForInput(
            employee.emp_joining_date
          ),
          password: "",
        });

        setEmployeeId(employee.emp_id || employee._id || id);
      } catch (err) {
        if (!active) return;

        console.error(
          "Fetch employee error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            (err.response?.status === 404
              ? "Employee or GET API route was not found. Check the backend route and employee ID."
              : !err.response
                ? "Cannot connect to the backend. Start it from the backend folder with `npm start` and verify it is listening on port 5000."
                : err.message || "Unable to load employee details.")
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEmployee();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "pan_number" || name === "ifsc_code"
          ? value.toUpperCase()
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_name.trim()) {
      newErrors.emp_name = "Employee name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required.";
    } else if (
      !/^\d{10}$/.test(
        formData.contact_number.replace(/\D/g, "")
      )
    ) {
      newErrors.contact_number =
        "Enter a valid 10-digit contact number.";
    }

    if (!formData.emp_dob) {
      newErrors.emp_dob = "Date of birth is required.";
    }

    if (!formData.emp_qualification.trim()) {
      newErrors.emp_qualification = "Qualification is required.";
    }

    if (!formData.emp_department) {
      newErrors.emp_department = "Select a department.";
    }

    if (!formData.emp_course.trim()) {
      newErrors.emp_course = "Course is required.";
    }

    if (!formData.emp_role) {
      newErrors.emp_role = "Select a role.";
    }

    if (!formData.emp_joining_date) {
      newErrors.emp_joining_date = "Joining date is required.";
    }

    const aadhaar = formData.emp_aadharnumber.replace(/\s/g, "");

    if (aadhaar && !/^\d{12}$/.test(aadhaar)) {
      newErrors.emp_aadharnumber =
        "Aadhaar number must contain 12 digits.";
    }

    if (
      formData.pan_number &&
      !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_number)
    ) {
      newErrors.pan_number = "Enter a valid PAN number.";
    }

    if (
      formData.accountnumber &&
      !/^\d{9,18}$/.test(formData.accountnumber)
    ) {
      newErrors.accountnumber =
        "Account number must contain 9-18 digits.";
    }

    if (
      formData.ifsc_code &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)
    ) {
      newErrors.ifsc_code = "Enter a valid IFSC code.";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password =
        "Password must contain at least 6 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const payload = { ...formData };
      payload.contact_number = payload.contact_number.replace(/\D/g, "");
      payload.emp_aadharnumber = payload.emp_aadharnumber.replace(/\s/g, "");

      // Do not change the existing password when the field is blank.
      if (!payload.password.trim()) {
        delete payload.password;
      }

      // Do not send MongoDB's internal identifier as an editable field.
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;

      // Keep the same identifier used to open the edit page.
      const response = await axios.put(
        `${API_URL}/update/employee/${encodeURIComponent(id)}`,
        payload
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Employee update failed."
        );
      }

      window.alert("Employee updated successfully!");
      navigate("/employees");
    } catch (err) {
      console.error(
        "Update employee error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          (!err.response
            ? "Cannot connect to the backend. Start it from the backend folder with `npm start` and verify it is listening on port 5000."
            : err.message) ||
          "Failed to update employee."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    name,
    label,
    type = "text",
    placeholder = ""
  ) => (
    <div className="edit-field" key={name}>
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={errors[name] ? "input-error" : ""}
      />

      {errors[name] && (
        <small className="field-error">{errors[name]}</small>
      )}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="edit-field" key={name}>
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        className={errors[name] ? "input-error" : ""}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {errors[name] && (
        <small className="field-error">{errors[name]}</small>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="edit-message">
        <h2>Loading employee details...</h2>
        <p>Please wait.</p>
      </div>
    );
  }

  if (error && !formData.emp_name) {
    return (
      <div className="edit-message">
        <h2>Unable to load employee</h2>
        <p>{error}</p>

        <div className="edit-actions">
          <button
            type="button"
            className="edit-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

          <button
            type="button"
            className="edit-secondary"
            onClick={() => navigate("/employees")}
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-edit-page">
      <div className="edit-header">
        <div>
          <h1>Edit Employee</h1>
          <p>
            Update employee information for ID:{" "}
            <strong>{employeeId}</strong>
          </p>
        </div>

        <Link to="/employees" className="edit-cancel">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="edit-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="edit-card">
          <h2>Personal Details</h2>

          <div className="edit-grid">
            {renderInput("emp_name", "Employee Name")}
            {renderInput("email", "Email", "email")}
            {renderInput("contact_number", "Contact Number", "tel")}
            {renderInput("emp_dob", "Date of Birth", "date")}
            {renderInput("emp_qualification", "Qualification")}
          </div>
        </section>

        <section className="edit-card">
          <h2>Department and Employment</h2>

          <div className="edit-grid">
            {renderSelect("emp_department", "Department", [
              "Web Development",
              "Data Science & AI",
              "UI/UX Design",
              "Mobile Development",
              "Administration",
            ])}

            {renderInput("emp_course", "Assigned Course")}

            {renderSelect("emp_role", "Role", [
              "employee",
              "admin",
            ])}

            {renderInput(
              "emp_joining_date",
              "Joining Date",
              "date"
            )}

            {renderSelect("emp_status", "Status", [
              "Active",
              "On Leave",
              "Probation",
              "Inactive",
            ])}

            {renderInput(
              "emp_attendance",
              "Attendance",
              "text",
              "e.g. 95%"
            )}
          </div>
        </section>

        <section className="edit-card">
          <h2>Identification and Address</h2>

          <div className="edit-grid">
            {renderInput(
              "emp_aadharnumber",
              "Aadhaar Number",
              "text",
              "12 digits"
            )}

            {renderInput(
              "pan_number",
              "PAN Number",
              "text",
              "ABCDE1234F"
            )}

            {renderInput(
              "accountnumber",
              "Bank Account Number"
            )}

            {renderInput("ifsc_code", "IFSC Code")}

            <div className="edit-field edit-full-width">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address ?? ""}
                onChange={handleChange}
                placeholder="Enter residential address"
              />
            </div>
          </div>
        </section>

        <section className="edit-card">
          <h2>Security</h2>

          <div className="edit-grid">
            {renderInput(
              "password",
              "New Password (optional)",
              "password",
              "Leave blank to keep current password"
            )}
          </div>
        </section>

        <div className="edit-actions">
          <button
            type="button"
            className="edit-secondary"
            onClick={() => navigate("/employees")}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
