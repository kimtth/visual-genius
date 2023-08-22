import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'YOUR_BACKEND_URL_HERE'; // Replace with your actual backend URL

function CategoryComponent() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // GET request to fetch all categories
    axios.get(`${API_BASE_URL}/api/Categoryhandler`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleCategoryClick = (categoryId) => {
    // GET request to fetch a specific category by ID
    axios.get(`${API_BASE_URL}/api/Categoryhandler?id=${categoryId}`)
      .then((response) => {
        setSelectedCategory(response.data);
      })
      .catch((error) => {
        console.error('Error fetching category by ID:', error);
      });
  };

  // Render category list and selected category
  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <button onClick={() => handleCategoryClick(category.id)}>
              {category.name}
            </button>
          </li>
        ))}
      </ul>
      {selectedCategory && (
        <div>
          <h2>Selected Category</h2>
          <p>ID: {selectedCategory.id}</p>
          <p>Name: {selectedCategory.name}</p>
        </div>
      )}
    </div>
  );
}

export default CategoryComponent;
