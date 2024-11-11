import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import './BookingD.css'; // Import the CSS file for styling

const BookingD = () => {
    const location = useLocation(); // Get the location object
    const userId = location.state?.userDetails?.id; // Extract user ID from location state
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                if (!userId) {
                    throw new Error('User ID is not available');
                }
                console.log('Fetching bookings for User ID:', userId); // Log the user ID
                const response = await fetch(`https://waterway-booking2-1.onrender.com/api/bookings/user/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch booking details');
                }
                
                const data = await response.json();
                console.log('Fetched booking details:', data); // Log the fetched booking details
                setBookings(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [userId]); // Add userId as a dependency

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options); // Format the date
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="booking-container">
            <h1 className="booking-title">Your Booking Details</h1>
            {bookings.length > 0 ? (
                bookings.map((booking) => (
                    <div className="booking-card" key={booking._id}>
                        <h3>Booking ID: {booking._id}</h3>
                        <div className="booking-details">
                            <span>Boat ID:</span> <span>{booking.boatId}</span>
                        </div>
                        <div className="booking-details">
                            <span>Check-In:</span> <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="booking-details">
                            <span>Check-Out:</span> <span>{formatDate(booking.endDate)}</span>
                        </div>
                        <div className="booking-details">
                            <span>Price:</span> <span>{booking.totalAmount}</span>
                        </div>
                        {/* <div className="booking-details">
                            <span>Status:</span> <span>{booking.status}</span>
                        </div> */}
                    </div>
                ))
            ) : (
                <div className="no-bookings">No bookings found.</div>
            )}
        </div>
    );
};

export default BookingD;
