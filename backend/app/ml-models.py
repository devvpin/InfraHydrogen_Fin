import pandas as pd
import torch
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_*KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def run_prediction():
    # Load training data (Hydrogen projects)
    hydrogen_df = pd.read_csv('../hydrogen_power_plants.csv')

    # Load test data (Solar and Wind)
    test_df = pd.read_excel('../data_solar_wind.xlsx')

    # Prepare features and targets (update columns as per your actual data)
    hydrogen_features = hydrogen_df.drop(['feasibility_score', 'hydrogen_production'], axis=1).values
    hydrogen_targets = hydrogen_df[['feasibility_score', 'hydrogen_production']].values

    test_features = test_df.values

    # Convert to PyTorch tensors
    X_train = torch.tensor(hydrogen_features, dtype=torch.float32)
    y_train = torch.tensor(hydrogen_targets, dtype=torch.float32)
    X_test = torch.tensor(test_features, dtype=torch.float32)

    # --- ML model training and prediction code ---
    # Example:
    # model = YourModel(...)
    # model.train()
    # ...training loop...
    # predictions = model(X_test).detach().numpy()

    # Placeholder: Replace with your actual model prediction logic
    # Here, just assigning dummy predictions for *each row* in test_df
    predictions = [[0.85, 1200] for _ in range(len(test_df))]

    # Add predictions to the dataframe
    test_df['feasibility_score'] = [p[0] for p in predictions]
    test_df['hydrogen_production'] = [p[1] for p in predictions]

    # Convert DataFrame to list of dictionaries
    result_data = test_df.to_dict(orient='records')

    # Insert into Supabase table
    response = supabase.table('SiteRecommendations').insert(result_data).execute()

    if response.error is None:
        print("Data successfully inserted into Supabase!")
    else:
        print(f"Error inserting data: {response.error}")

    return predictions  # Or return test_df if you want to see merged data
