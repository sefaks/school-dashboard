import React, { useState } from 'react';
import { toast } from 'react-toastify';

const TimeInput = ({
  value,
  onChange,
  label,
  name
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  name: string;
}) => {
  const [inputValue, setInputValue] = useState(value);

  const formatTimeString = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2);
      return `${hours}:${minutes}`;
    } else {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      return `${hours}:${minutes}`;
    }
  };

  const validateTime = (timeStr: string): boolean => {
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeString(e.target.value);
    setInputValue(formatted);

    if (formatted.length === 5 && validateTime(formatted)) {
      onChange(formatted);
    }
  };

  const handleBlur = () => {
    if (inputValue.length > 0 && !validateTime(inputValue)) {
      toast.error("Geçerli bir saat giriniz (ÖR: 09:00)");
      setInputValue(value); // Reset to last valid value
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="00:00"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={5}
      />
    </div>
  );
};

export default TimeInput;