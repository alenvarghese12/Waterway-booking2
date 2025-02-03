import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset with tab-separated values
data = pd.read_csv(r'd:\react1\logn.csv', delimiter='\t')

# Debug: Print column names to verify structure
print("Columns in the dataset:", data.columns)

# Rename columns to make them easier to use
data.columns = ['User_ID', 'IP_Address', 'Device_Type', 'Location', 'Success', 'Failed_Attempts', 'Timestamp']

# Feature engineering
if 'Timestamp' in data.columns:
    data['hour'] = pd.to_datetime(data['Timestamp']).dt.hour
    data['is_night'] = data['hour'].apply(lambda x: 1 if x < 6 or x > 22 else 0)
else:
    raise KeyError("Column 'Timestamp' not found in the dataset.")

# Encode categorical variables
label_encoders = {}
for col in ['IP_Address', 'Device_Type', 'Location']:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    label_encoders[col] = le

# Prepare features and target
required_columns = ['IP_Address', 'Device_Type', 'Location', 'hour', 'is_night', 'Failed_Attempts', 'Success']
for col in required_columns:
    if col not in data.columns:
        raise KeyError(f"Column '{col}' is missing in the dataset.")

X = data[['IP_Address', 'Device_Type', 'Location', 'hour', 'is_night', 'Failed_Attempts']]
y = data['Success']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# Save the model
joblib.dump(model, 'fraud_detection_model.pkl')
print("Model saved as 'fraud_detection_model.pkl'.")
