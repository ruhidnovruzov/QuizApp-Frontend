import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { // HTMLSelectAttributes əlavə etdik
  options: Option[];
  placeholder?: string;
  // onChange: (value: string) => void; // Bu əvəzinə standart event istifadə edirik
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  className = "",
  // value və onChange prop-larını rest operatoru ilə qəbul edirik
  ...props 
}) => {
  // `value` prop-u state-dən gəlməlidir, biz onu props-dan alırıq (controlled component)
  const selectedValue = props.value as string || ""; 

  return (
    <select
      // Bütün standart Select atributlarını (id, name, value, onChange) buraya ötürürük
      {...props} 
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {Array.isArray(options) &&
        options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
    </select>
  );
};

export default Select;