import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import datepicker styles
import { useNavigate } from 'react-router-dom';
const BoatList = ({ ownerId: propOwnerId }) => {
  const [localOwnerId, setOwnerId] = useState(propOwnerId); // Manage local state for ownerId
  const [boats, setBoats] = useState([]);
  const [editBoat, setEditBoat] = useState(null);
  const [selectedBoat, setSelectedBoat] = useState(null); // Add selectedBoat state
  const [unavailableDates, setUnavailableDates] = useState([]);
  const navigate = useNavigate(); // Store unavailable dates for the boat
  const [formData, setFormData] = useState({
    boatName: '',
    boatType: '',
    description: '',
    price: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // if (!token) {
  //   navigate('/login');
  //   return;
  // }
  const handleBoatClick = (boat) => {
    navigate(`/boatowner/boatmenu/${boat._id}`); // Navigate to the new page with boat ID
  };
  useEffect(() => {
    const fetchUserData = async () => {
      if (localOwnerId) return; // Skip fetching if ownerId is already set

      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8080/api/auth/user-data', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the Authorization header
          }
        });

        const userData = response.data;
        console.log('Fetched user data:', userData);

        if (userData._id) {
          setOwnerId(userData._id); // Set ownerId from user data
        } else {
          throw new Error('User ID not found in the response');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error.message);
        setErrorMessage('Failed to fetch user data. Please check your session or try logging in again.');
      }
    };

    fetchUserData();
  }, [localOwnerId]); // Run once on mount or if localOwnerId changes

  useEffect(() => {
    const fetchBoats = async () => {
      setLoading(true);
      setErrorMessage(''); // Clear previous error messages

      console.log('Fetching boats for owner ID:', localOwnerId); // Log localOwnerId

      try {
        if (!localOwnerId) {
          throw new Error('Owner ID is not defined');
        }

        const response = await axios.get(`http://localhost:8080/api/boats/boatsdb?ownerId=${localOwnerId}`);
        console.log('Boats fetched:', response.data);

        if (Array.isArray(response.data)) {
          setBoats(response.data);
        } else {
          console.error('Expected an array of boats, received:', response.data);
        }
      } catch (error) {
        // Extracting detailed error message
        const errorMsg = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message;
        setErrorMessage(`Failed to fetch boats: ${errorMsg}`);
        console.error('Error fetching boats:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, [localOwnerId]);

  const handleDelete = async (boatId) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this boat?');
    if (!confirmDelete) return; // Exit if the user cancels

    try {
      // Make a request to set the status to Inactive
      await axios.put(`http://localhost:8080/api/boats/boatsde/${boatId}`, { status: 'Inactive' });
      
      // Update state to reflect the change
      setBoats(boats.filter(boat => boat._id !== boatId));
    } catch (error) {
      console.error('Error deleting boat:', error);
    }
  };

  const handleEditClick = (boat) => {
    setEditBoat(boat);
    setFormData({
      boatName: boat.boatName,
      boatType: boat.boatType,
      description: boat.description,
      price: boat.price,
      capacity: boat.capacity
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/boats/boatsd/${editBoat._id}`, formData);
      setBoats(boats.map(boat => (boat._id === editBoat._id ? response.data : boat)));
      setEditBoat(null);
      setFormData({
        boatName: '',
        boatType: '',
        description: '',
        price: '',
        capacity: ''
      });
    } catch (error) {
      console.error('Error updating boat:', error);
    }
  };

  // Handle unavailable dates submission
  const handleUnavailableDatesSubmit = async (boatId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/boats/${boatId}/unavailable-dates`,
        { dates: unavailableDates }
      );
      setUnavailableDates([]); // Clear the dates after submission
      alert('Unavailable dates set successfully');
    } catch (error) {
      console.error('Error setting unavailable dates:', error);
    }
  };


  return (
    <div>
        <style>{`
  .boat-list-container {
    max-width: 100%;
    padding: 20px;
    overflow-x: auto;
  }

  .boat-list-container h2 {
    text-align: center;
    color: #333;
  }

  .boat-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding: 10px;
  }

  .boat-list li {
    flex: 0 0 auto;
    width: 300px;
    padding: 15px;
    margin: 0;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    background-color: #fff;
    transition: box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .boat-list li:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .boat-list h3 {
    font-size: 1.5em;
    color: #2c3e50;
    text-align: center;
  }

  .boat-list p {
    color: #555;
    text-align: center;
  }

  .boat-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: transform 0.3s ease;
  }

  .boat-image:hover {
    transform: scale(1.05);
  }

  .button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-right: 10px;
  }

  .button:hover {
    background-color: #2980b9;
  }

  .button.delete {
    background-color: #e74c3c;
  }

  .button.delete:hover {
    background-color: #c0392b;
  }

  .button.edit {
    background-color: #f39c12;
  }

  .button.edit:hover {
    background-color: #e67e22;
  }

  .button.calendar {
    background-color: #2ecc71;
  }

  .button.calendar:hover {
    background-color: #27ae60;
  }

  .edit-form {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f1f1f1;
  }

  .edit-form input {
    margin-bottom: 10px;
    padding: 10px;
    width: calc(100% - 22px);
  }

  .dcontainer {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
  }
`}</style>


      <div className="boat-list-container">
        
        <h2>Registered Boats</h2>
        {loading && <p>Loading boats...</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {boats.length === 0 ? (
          <p>No registered boats found.</p>
        ) : (
          <ul className="boat-list">
            {boats.map(boat => (
              <li key={boat._id} onClick={() => handleBoatClick(boat)}>
                <h3>{boat.boatName} ({boat.boatType})</h3>
                <img
                  src={`http://localhost:8080/uploads/${boat.image}`}
                  alt={boat.boatName}
                  className="boat-image"
                  onClick={() => handleImageClick(`http://localhost:8080/uploads/${boat.image}`)} // Zoom on image click
                />
                 <div className="dcontainer">
                      <p>Description: {boat.description}</p>
                  </div>
                <p>Price: {boat.price}</p>
                <p>Discount: {boat.discountPercentage}%</p>
                <p>Final Price: {boat.finalPrice}   {boat.priceType}</p>
                <p>Capacity: {boat.capacity}</p>
                <p>Speed:  {boat.speed} km/h</p>
              <p>Capacity: {boat.capacity} people</p>
              <p>Engine Type: {boat.engineType}</p>
             
              <p><strong>License Number:</strong> {boat.licenseNumber}</p>
              <a
                href={`http://localhost:8080/uploads/${boat.licenseDocument}`} // Link to view license document
                target="_blank"
                rel="noopener noreferrer"
              >
                View License Document
              </a><br></br>
                <button className="button edit" onClick={() => handleEditClick(boat)}>Edit</button><br></br>
                <button className="button delete" onClick={() => handleDelete(boat._id)}>Delete</button>
                <button className="button calendar" onClick={() => setSelectedBoat(boat)}>
                  Set Unavailable Dates
                </button>
             {/* The calendar should only show for the selected boat */}
             {selectedBoat && selectedBoat._id === boat._id && (
                <div>
                  <DatePicker
                    selected={unavailableDates[0] || null} // Ensure that the date picker starts correctly
                    onChange={(date) => setUnavailableDates([...unavailableDates, date])}
                    selectsStart
                    startDate={unavailableDates[0]}
                    endDate={unavailableDates[unavailableDates.length - 1]}
                    isClearable
                    inline
                  />
                  <button
                    className="button"
                    onClick={() => handleUnavailableDatesSubmit(boat._id)}
                  >
                    Save Dates
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}


        {editBoat && (
          <div className="edit-form">
            <h3>Edit Boat</h3>
            <input
              type="text"
              name="boatName"
              placeholder="Boat Name"
              value={formData.boatName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="boatType"
              placeholder="Boat Type"
              value={formData.boatType}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleInputChange}
            />
            <button className="button" onClick={handleUpdate}>Update Boat</button>
            <button className="button" onClick={() => setEditBoat(null)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoatList;

