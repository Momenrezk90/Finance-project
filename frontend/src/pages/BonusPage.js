// src/pages/BonusPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BonusPage = () => {
  const [bonuses, setBonuses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchBonuses = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bonuses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBonuses(response.data);
    };
    fetchBonuses();
  }, []);

  const handleBonusSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/bonuses', {
        title,
        reason,
        amount,
        assignedTo,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBonuses([...bonuses, response.data]);
    } catch (err) {
      console.error('Error creating bonus:', err);
    }
  };

  return (
    <div>
      <h2>Bonus Requests</h2>
      <form onSubmit={handleBonusSubmit}>
        <input
          type="text"
          placeholder="Bonus Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Assigned To (User ID)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          required
        />
        <button type="submit">Create Bonus</button>
      </form>
      
      <h3>Bonus Requests List</h3>
      <ul>
        {bonuses.map((bonus) => (
          <li key={bonus._id}>
            {bonus.title} - {bonus.amount} - {bonus.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BonusPage;
