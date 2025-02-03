import sys
import json
import joblib

# Load the trained model
model = joblib.load('./ml/fraud_detection_model.pkl')

# Parse input data
login_data = json.loads(sys.argv[1])

# Prepare input features
input_data = [[
    login_data['ip_address'],
    login_data['device_type'],
    login_data['location'],
    login_data['hour'],
    login_data['is_night'],
    login_data['failed_attempts']
]]

# Make prediction
prediction = model.predict(input_data)[0]
result = {"isFraud": bool(prediction == 0)}  # 0 indicates fraudulent

print(json.dumps(result))
