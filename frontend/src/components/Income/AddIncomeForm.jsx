import React, { useState } from 'react';
import Input from '../Inputs/input';
import EmojiPickerPopup from '../EmojiPickerPopup';

const AddIncomeForm = ({onAddIncome}) => {
  const [income, setIncome] = useState({
    source: "",
    amount: "",
    date: "",
    icon: ""
  });

  const handleChange = (key, value) => setIncome({...income, [key]: value});

  return (
    <div className="form-container">
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />
      <Input 
        value={income.source}
        onChange={({target}) => handleChange("source", target.value)}
        label="Income Source :"
        placeholder="Freelance, Salary, etc"
        type="text"
      />
      <Input 
        value={income.amount}
        onChange={({target}) => handleChange("amount", target.value)}
        label="Amount :"
        placeholder="Enter Amount"
        type="number"
      />
      <Input
        value={income.date}
        onChange={({target}) => handleChange("date", target.value)}
        label="Date :"
        type="date"
      />
      <div className="flex justify-end mt-4">
        <button 
          type="button"
          className="add-btn-fill"
          onClick={() => onAddIncome(income)}
        >
          Add Income
        </button>
      </div>
    </div>
  )
}

export default AddIncomeForm;
