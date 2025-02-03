import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserBoatList.css';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';

const UserBoatList = () => {
  const [boats, setBoats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails } = useOutletContext();

  const handleViewDetails = (boat) => {
    if (userDetails && userDetails.id && userDetails.name && userDetails.email) {
      navigate('/userint/boatviewdetails', { 
        state: { 
          boat, 
          userDetails: {
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email
          }
        } 
      });
    } else {
      console.error('User details not available or incomplete');
      // You might want to handle this case, perhaps by redirecting to login
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/boats/boatsd');
        setBoats(response.data);
      } catch (error) {
        console.error('Failed to fetch boats', error);
      }
    };

    fetchBoats();
  }, []);

  return (
    <div className="boat-list-container">
      <div className="boat-grid">
        {boats.map((boat) => (
          <div key={boat._id} className="boat-card">
             <h3>{boat.boatName}</h3>
            <img
              src={`http://localhost:8080/uploads/${boat.image}`}
              alt={boat.boatName}
              className="boat-image"
              onClick={() => handleImageClick(`http://localhost:8080/uploads/${boat.image}`)}
            />
           
            <p><strong></strong>{boat.boatType}</p>
            <button className="book-button" onClick={() => handleViewDetails(boat)}>View Details</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-image" src={selectedImage} alt="Zoomed" />
        </div>
      )}
    </div>
  );
};

export default UserBoatList;
