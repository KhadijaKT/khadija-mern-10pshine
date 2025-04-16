import React from 'react';
import './InputField.css'; // Create this file

const InputField = ({ label, type, name, value, onChange, required }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      <input
        className="input-field"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default InputField;