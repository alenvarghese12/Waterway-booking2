import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Razorpay from 'razorpay'; // Import Razorpay library for payment
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const BoatViewDetails = () => {
  const location = useLocation();

  const { boat, userDetails } = location.state; // Extract boat and user data from the location state

  const [currentStep, setCurrentStep] = useState(1); // Step control for multi-step booking
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [adults, setAdults] = useState(1);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [showFoodOptions, setShowFoodOptions] = useState(false); // Control visibility of food options
  const [selectedFoods, setSelectedFoods] = useState({
    breakfast: '',
    lunch: '',
    dinner: ''
  });

  const [foodCustomization, setFoodCustomization] = useState({
    breakfastOptions: [],
    lunchOptions: [],
    dinnerOptions: []
  });

  useEffect(() => {
    // Ensure that name is accessed and prefilled
    if (userDetails && userDetails.name) {
      setUserData(prevData => ({
        ...prevData,
        name: userDetails.name
      }));
    }
  }, [userDetails]);

  const steps = ["Your selection", "Your details", "Final step"];

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFoodSelection = (meal, dish) => {
    setSelectedFoods((prevState) => ({
      ...prevState,
      [meal]: dish,
    }));
  };

  const toggleFoodOptions = () => {
    setShowFoodOptions(!showFoodOptions); // Toggle food options visibility
  };

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        if (boat && boat._id) { // Ensure boat._id is available
          const response = await fetch(`http://localhost:8080/api/boats/${boat._id}/unavailable-dates`); // Use boat._id instead of boatId
          if (!response.ok) {
            throw new Error('Error fetching unavailable dates');
          }
          const dates = await response.json();
          setUnavailableDates(dates); // Assuming the response is an array of dates
          console.log('Fetched Unavailable Dates:', dates); // Log the fetched dates
        }
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      }
    };

    fetchUnavailableDates();
  }, [boat]);

  const handleRazorpayPayment = async () => {
    // Calculate total amount based on price type
    let totalAmount;

    if (boat.priceType === 'perHead') {
      totalAmount = boat.price * adults; // Price per head times number of adults
    } else if (boat.priceType === 'perNight') {
      const numberOfDays = Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)); // Calculate the number of days, ensuring at least 1 day
      totalAmount = boat.price * Math.max(1, numberOfDays); // Ensure a minimum of 1 day
    }
    
    const options = {
      key: 'rzp_test_shlMZZixePYp01',
      amount: totalAmount * 100, // Convert to paisa and round to nearest integer
      currency: 'INR',
      name: 'Boat Booking',
      description: `Booking for ${boat.boatName}`,
      handler: async (response) => {
        try {
          const paymentDetails = {
            boatId: boat._id,
            userId: userDetails.id, // Ensure this is correctly passed from the parent component
            startDate: dateRange[0].startDate,
            endDate: dateRange[0].endDate,
            adults: adults,
            paymentId: response.razorpay_payment_id,
            name: userData.name,
            email: userDetails.email,
            phone: userData.phone,
            address: userData.address,
            totalAmount: totalAmount,
          };
          // Send the booking details to the backend to store in the booking table
          console.log('Sending booking data:', paymentDetails);
          const bookingResponse = await fetch('http://localhost:8080/api/bookings/bookingss', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentDetails),
          });

          if (bookingResponse.ok) {
            const responseData = await bookingResponse.json();
            alert('Booking successful!.Email will be sent with the booking details');
            console.log('Booking response:', responseData);
          } else {
            const errorText = await bookingResponse.text();
            console.error('Booking failed:', errorText);
            throw new Error(`Booking failed: ${errorText}`);
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          alert(`An error occurred while processing your payment: ${error.message}`);
        }
      },
      prefill: {
        name: userData.name,
        email: userDetails.email,
        contact: userData.phone,
      },
      theme: {
        color: '#F37254',
      },
    };

    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadRazorpay();
    if (isLoaded) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay SDK failed to load. Are you online?');
    }
  };

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/food/${boat._id}/food`);
        console.log('Food Customization:', response.data);
        setFoodCustomization(response.data.meals); // Assuming response.data contains an object with arrays for breakfast, lunch, and dinner options
      } catch (error) {
        console.error('Error fetching food data:', error);
      }
    };

    fetchFoodData();
  }, [boat]);

  // Render step indicator
  const renderStepIndicator = () => (
    <div style={styles.stepsContainer}>
      {steps.map((step, index) => (
        <div key={index} style={styles.stepWrapper}>
          <div
            style={{
              ...styles.stepCircle,
              backgroundColor: currentStep === index + 1 ? '#007BFF' : '#ccc',
              color: currentStep === index + 1 ? 'white' : 'black',
            }}
          >
            {index + 1}
          </div>
          <p
            style={{
              ...styles.stepLabel,
              fontWeight: currentStep === index + 1 ? 'bold' : 'normal',
            }}
          >
            {step}
          </p>
          {index < steps.length - 1 && <div style={styles.stepLine}></div>}
        </div>
      ))}
    </div>
  );

  const handleQuantityChange = (meal, itemName, change) => {
    setSelectedFoods((prevSelectedFoods) => {
      const updatedMeal = { ...prevSelectedFoods[meal] };
      const currentQuantity = updatedMeal[itemName] || 1; // Default to 1 if not selected yet
      const newQuantity = Math.max(1, currentQuantity + change); // Ensure quantity never goes below 1

      updatedMeal[itemName] = newQuantity;

      return {
        ...prevSelectedFoods,
        [meal]: updatedMeal,
      };
    });
  };

  const renderFoodOptions = () => (
    <div style={styles.foodOptionsContainer}>
      <h4>Select Your Meals</h4>

      {['breakfast', 'lunch', 'dinner'].map((meal) => (
        <div key={meal} style={styles.mealContainer}>
          <h5>{meal.charAt(0).toUpperCase() + meal.slice(1)}:</h5>
          {foodCustomization[meal] &&
            foodCustomization[meal].map((food, index) => (
              <div key={index} style={styles.foodCard}>
                <div style={styles.foodInfo}>
                  <span style={styles.foodTitle}>
                    {food.itemName} ({food.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'})
                  </span>
                  <span style={styles.foodPrice}>₹{food.price}</span>
                  <p style={styles.foodDescription}>
                    {food.description}
                  </p>
                </div>

                {/* Image for food item */}
                {/* <div style={styles.foodImageContainer}>
                  <img src={food.imageUrl} alt={food.itemName} style={styles.foodImage} />
                </div> */}

                {/* Quantity controls */}
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => handleQuantityChange(meal, food.itemName, -1)}
                    style={styles.quantityButton}
                    disabled={selectedFoods[meal][food.itemName] <= 1}
                  >
                    -
                  </button>
                  <span style={styles.quantityDisplay}>
                    {selectedFoods[meal][food.itemName] || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(meal, food.itemName, 1)}
                    style={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  // Conditionally render the content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Step 1: Display boat details and date selection
        return (
          <div>
            <h2>{boat.boatName}</h2>
            <img
              src={`http://localhost:8080/uploads/${boat.image}`}
              alt={boat.boatName}
              style={styles.boatImage}
            />
            <p>{boat.description}</p>
            <p><strong>Price:</strong> Rs. {boat.price} {boat.priceType}</p>
            <p><strong>Capacity:</strong> {boat.capacity} people</p>
            <p><strong>Speed:</strong> {boat.speed} km/h</p>

            <h3>Select Dates and Number of Adults</h3>
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => setDateRange([item.selection])}
              minDate={new Date()}
              disabledDates={unavailableDates}
            />
            <label style={styles.label}>Number of Adults:</label>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              style={styles.input}
            >
              {[...Array(boat.capacity).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1} Adult{num + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <div style={styles.foodCustomizationContainer}>
              <p>Food customization is available!</p>
              <button onClick={toggleFoodOptions} style={styles.customizeBtn}>
                {showFoodOptions ? 'Hide Food Options' : 'Customize Your Meals'}
              </button>
              {showFoodOptions && renderFoodOptions()}
            </div>

            <button onClick={handleNextStep} style={styles.nextBtn}>
              Next
            </button>
          </div>
        );

      case 2: // Step 2: Collect user details
        return (
          <div>
            <h3>Enter Your Details</h3>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              readOnly
              style={styles.input}
            />
            <label style={styles.label}>Phone:</label>
            <input
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              style={styles.input}
            />
            <label style={styles.label}>Address:</label>
            <input
              type="text"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              style={styles.input}
            /><br></br>
            <button onClick={handlePreviousStep} style={styles.backBtn}>
              Back
            </button>
            <button onClick={handleNextStep} style={styles.nextBtn}>
              Next
            </button>
          </div>
        );

      case 3: // Step 3: Razorpay Payment
        return (
          <div>
            <h3>Make Payment</h3>
            <p>
              You are booking {boat.boatName} from{' '}
              {dateRange[0].startDate.toLocaleDateString()} to{' '}
              {dateRange[0].endDate.toLocaleDateString()} for {adults} adults.
            </p>
            <p>Total Amount: Rs. {boat.priceType === 'perHead' 
              ? boat.price * adults 
              : boat.price * Math.ceil((dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24))}</p>
            <button onClick={handlePreviousStep} style={styles.backBtn}>
              Back
            </button>
            <button onClick={handleRazorpayPayment} style={styles.payBtn}>
              Proceed to Payment
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {renderStepIndicator()}
      {renderStepContent()}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    marginBottom: '-700px',
  },
  boatImage: {
    width: '100%',
    height: 'auto',
    marginBottom: '15px',
    borderRadius: '10px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: '20px',
    padding: '10px',
    width: '100%',
    maxWidth: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
    width: '100%',
    position: 'relative',
    marginTop: '20px',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 4,
    margin: '0 10px', // Increased margin to create more distance between steps
    marginRight: '350px',
  },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s, color 0.3s',
  },
  stepLabel: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
    transition: 'font-weight 0.4s, color 0.4s',
  },
  stepLine: {
    height: '2px',
    width: '91%', // Increased width to cover more distance between steps
    backgroundColor: '#ccc',
    position: 'absolute',
    top: '20px',
    zIndex: -1,
    left: '10%', // Adjusted left position to center the line
  },
  nextBtn: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    marginRight: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  payBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  // foodCustomizationContainer: {
  //   marginTop: '20px',
  // },
  // customizeBtn: {
  //   padding: '10px 20px',
  //   backgroundColor: '#007BFF',
  //   color: 'white',
  //   border: 'none',
  //   cursor: 'pointer',
  //   borderRadius: '5px',
  // },
  // foodOptionsContainer: {
  //   marginTop: '10px',
  //   padding: '10px',
  //   backgroundColor: '#f9f9f9',
  //   borderRadius: '5px',
  //   border: '1px solid #ccc',
  // },
  // foodSelect: {
  //   display: 'block',
  //   width: '100%',
  //   padding: '10px',
  //   margin: '5px 0',
  //   borderRadius: '5px',
  // },

  foodOptionsContainer: {
    padding: '20px',
  },
  mealContainer: {
    marginBottom: '20px',
  },
  foodCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#fff',
  },
  foodInfo: {
    flex: '1',
    marginRight: '20px',
  },
  foodTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: '16px',
    color: '#000',
    marginTop: '5px',
  },
  foodDescription: {
    fontSize: '14px',
    color: '#777',
    marginTop: '5px',
  },
  foodImageContainer: {
    flexShrink: 0,
    marginRight: '20px',
  },
  foodImage: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    fontSize: '18px',
    margin: '0 5px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  quantityDisplay: {
    minWidth: '20px',
    textAlign: 'center',
    fontSize: '16px',
  },

};

export default BoatViewDetails;
