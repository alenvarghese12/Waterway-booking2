import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Boatowner.css'; // Custom CSS file for styling
import Logoutb from '../Logoutb/Logoutb'; // Assuming this is your Logout button component
import userIcon from '../Assets/user-icon.png';

const Boatowner = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    licenseNumber: '',
    email: '',
  });
  const [error, setError] = useState(null);

  // Fetch the logged-in user's name using token-based authentication
  useEffect(() => {
    const fetchSessionData = async () => {
      const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

      if (!token) {
        console.error('No token found, user might not be logged in.');
        setError('No token found.');
        return;
      }

      try {
        console.log("Fetching session data with token:", token);
        const response = await fetch('http://localhost:8080/api/auth/sessionn', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Attach the token in the Authorization header
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched user data:", data);

        setUserDetails({
          name: data.name,
          licenseNumber: data.licenseNumber,
          email: data.email,
        });
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError(error.message);
      }
    };

    fetchSessionData();
  }, []);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="boatowner-dashboard">
      <nav className="navbar">
        <ul>
          <li><Link to="boatregister">Register Boat</Link></li>
          <li><Link to="boatlist">Boat Details</Link></li>
      
   
          <li><Logoutb /></li> {/* Assuming this component handles logging out */}
          <li className="user-info">
    <img src={userIcon} alt="User Icon" className="user-icon" />
      <h4>{userDetails.name}</h4>
    </li>
        </ul>
      </nav>

      <div className="dashboard-header">
        <h1>Welcome, {userDetails.name ? userDetails.name : 'Boatowner'}</h1>
        <p>Email: {userDetails.email}</p>
        <p>License Number: {userDetails.licenseNumber}</p>
      </div>

      <div className="boatowner-content">
        <Outlet /> {/* This will render the nested routes */}
      </div>
    </div>
  );
};

export default Boatowner;


// import React, { useEffect, useState } from 'react';
// import { decodeToken } from '../utils/tokenUtils'; // Adjust the import path based on your file structure

// const Boatowner = () => {
//     const [name, setName] = useState('');

//     useEffect(() => {
//         const token = localStorage.getItem('token'); // Get the token from local storage

//         if (token) {
//             const decodedToken = decodeToken(token);  // Manually decode the token
//             if (decodedToken && decodedToken.name) {
//                 setName(decodedToken.name);  // Set the user's name
//             } else {
//                 console.error("Token is invalid or does not contain a name field");
//             }
//         }
//     }, []);

//     return (
//         <div>
//             <h1>Welcome, {name}!</h1>
//             {/* Boat Owner specific content */}
//         </div>
//     );
// };

// export default Boatowner;
