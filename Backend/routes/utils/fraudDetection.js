// Simple fraud detection logic in JavaScript
const predictFraud = async (loginData) => {
    try {
        // Simple fraud detection rules
        let riskScore = 0;
        
        // Check if login is during night hours
        if (loginData.is_night) {
            riskScore += 1;
        }

        // Check failed attempts
        if (loginData.failed_attempts > 3) {
            riskScore += 2;
        }

        // Check if location is unknown
        if (loginData.location.country === 'Unknown') {
            riskScore += 1;
        }

        // Determine if login is fraudulent based on risk score
        return {
            isFraud: riskScore >= 3,
            riskScore: riskScore
        };
    } catch (error) {
        console.error('Error in fraud detection:', error);
        return {
            isFraud: false,
            riskScore: 0
        };
    }
};

module.exports = {
    predictFraud
};
