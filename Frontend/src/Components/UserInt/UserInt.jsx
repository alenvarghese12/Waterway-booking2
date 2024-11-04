// import React, { useState, useEffect } from 'react';
// import { Link, Outlet, useNavigate } from 'react-router-dom';
// import './UserNavbar.css';
// import Logoutb from '../Logoutb/Logoutb';
// import { FaSearch } from 'react-icons/fa';

// const UserInt = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Get token from the URL query params
//     const queryParams = new URLSearchParams(window.location.search);
//     const token = queryParams.get('token');

//     if (token) {
//       // Store the token in localStorage for future API calls
//       localStorage.setItem('token', token);
      
//       // Clear the token from the URL after storing it
//       window.history.replaceState({}, document.title, window.location.pathname);
      
//       // Redirect to the main user interface or fetch user data
//       navigate('/userint'); 
//     }
//   }, [navigate]);




//   useEffect(() => {
//     const fetchSessionData = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       try {
//         console.log("Fetching session data with token:", token);
//         const response = await fetch('http://localhost:8080/api/auth/sessionn', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//         }

//         const data = await response.json();
//         console.log("Fetched user data:", data);

//         setUserDetails({
//           name: data.name,
//           email: data.email,
//           licenseNumber: data.licenseNumber || null,
//         });
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching session data:', error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchSessionData();
//   }, [navigate]);

//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);
//     navigate(`/userint/search/${query}`);
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="user-navbar">
//       <div className="top-navbar">
//         <button className="sidebar-toggle" onClick={toggleSidebar}>
//           ☰
//         </button>
//         <h1 className="navbar-title">Waterway</h1>
//         <div className="search-box">
//           <input 
//             type="text" 
//             className="search-input"
//             placeholder="Search...."
//             value={searchQuery}
//             onChange={handleSearchChange}
//           />
//           <FaSearch className="search-icon" />
//         </div>
        
//         <div className="nav-links">
//           <Link to="userboatl" className="nav-link">Boats</Link>
//         </div>

//         {userDetails && (
//           <>
//             <li style={{ color: "black", fontWeight: "bold" }}>{userDetails.name}</li>
//             <li>{userDetails.email}</li>
//           </>
//         )}
//       </div>

//       <div className={`side-navbar ${isSidebarOpen ? 'open' : ''}`}>
//         <Logoutb />
//       </div>
      
//       <Outlet />
//     </div>
//   );
// };

// export default UserInt;
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './UserNavbar.css';
import Logoutb from '../Logoutb/Logoutb';
import { FaSearch } from 'react-icons/fa';

const UserInt = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        console.log("Fetching session data with token:", token);
        const response = await fetch('http://localhost:8080/api/auth/sessionn', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched user data:', data);
        setUserDetails({
          id: data.id, // Ensure we're capturing the user's ID
          name: data.name,
          email: data.email,
          licenseNumber: data.licenseNumber || null,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [navigate]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    navigate(`/userint/search/${query}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="user-navbar">
      <div className="top-navbar">
        <button id='sidebar' className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="navbar-title">Waterway</h1>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search...."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="nav-links">
         <Link 
  to="userboatl" 
  state={{ userDetails: { id: userDetails?.id, name: userDetails?.name, email: userDetails?.email } }} 
  className="nav-link"
>
  Boats
</Link>
        </div>

        {userDetails && (
          <ul>
            <li style={{ color: 'black', fontWeight: 'bold' }}>{userDetails.name}</li>
            <li style={{ color: 'black', fontWeight: 'bold' }}>{userDetails.email}</li>
          </ul>
        )}
      </div>

      <div className={`side-navbar ${isSidebarOpen ? 'open' : ''}`}>
        <Logoutb />
      </div>

      <Outlet context={{ userDetails: { id: userDetails?.id, name: userDetails?.name, email: userDetails?.email } }} />

    </div>
  );
};

export default UserInt;
