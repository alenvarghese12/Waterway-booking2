import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const { query } = useParams(); // Extract the search query from the URL
  const [filteredBoats, setFilteredBoats] = useState([]);
  const navigate = useNavigate(); 
  // Fetch boats when the component mounts and filter based on the query
  const fetchFilteredBoats = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/boats/boatsd"); // Fetch all boats
      const boats = response.data;

      // Filter boats based on the search query
      const filtered = boats.filter(
        (boat) =>
          (boat.boatName && boat.boatName.toLowerCase().includes(query.toLowerCase())) ||
          (boat.boatType && boat.boatType.toLowerCase().includes(query.toLowerCase())) ||
          (boat.description && boat.description.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredBoats(filtered);

      if (filtered.length === 0) {
        navigate(-1); // Navigate to the previous page
      }
    } catch (error) {
      console.error("Error fetching boats:", error);
    }
  };

  useEffect(() => {
    fetchFilteredBoats(); // Fetch boats when the component mounts
  }, [query]);


  const handleBookNow = (boat) => {
    navigate('/userint/booking', { state: { boat } });
  };


  return (
    <div>
      <h2>Search Results for "{query}"</h2>
      <div className="boat-search-results">
        {filteredBoats.length > 0 ? (
          filteredBoats.map((boat) => (
            <div key={boat._id} className="boat-card">
              <img
                src={`http://localhost:8080/uploads/${boat.image}`}
                alt={boat.boatName}
                className="boat-image"
              />
              <h3>{boat.boatName}</h3>
              <p><strong>Type:</strong> {boat.boatType}</p>
              <p><strong>Price:</strong> Rs. {boat.price}</p>
              <p><strong>Description:</strong> {boat.description}</p>
              <p><strong>Capacity:</strong> {boat.capacity} people</p>
              <p><strong>Speed:</strong> {boat.speed} km/h</p>
              <button className="book-button" onClick={() => handleBookNow(boat)}>Book Now</button>
            </div>
          ))
        ) : (
          <p>No boats found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
