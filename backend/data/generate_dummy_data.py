import pandas as pd
import numpy as np
import random

np.random.seed(42)
n = 500

procedures = {
    "99213": 150, "99214": 250, "93000": 75, "85025": 40,
    "71046": 200, "70553": 1800, "27447": 35000, "90837": 180
}

data = []
for _ in range(n):
    cpt = random.choice(list(procedures.keys()))
    base = procedures[cpt]
    age = random.randint(18, 85)
    state_factor = random.uniform(0.8, 1.4)
    insurance = random.choice(["PPO", "HMO", "HDHP", "Medicare", "Medicaid"])
    insurance_factor = {"PPO": 1.0, "HMO": 0.85, "HDHP": 0.95, "Medicare": 0.75, "Medicaid": 0.6}[insurance]
    facility = random.choice(["Hospital", "Outpatient", "Clinic"])
    facility_factor = {"Hospital": 1.3, "Outpatient": 1.0, "Clinic": 0.8}[facility]

    actual_cost = base * state_factor * insurance_factor * facility_factor * random.uniform(0.9, 1.1)
    patient_pays = actual_cost * random.uniform(0.1, 0.4)

    data.append({
        "cpt_code": cpt,
        "age": age,
        "insurance_type": insurance,
        "facility_type": facility,
        "state_cost_index": round(state_factor, 2),
        "total_cost": round(actual_cost, 2),
        "patient_responsibility": round(patient_pays, 2)
    })

pd.DataFrame(data).to_csv("dummy_claims.csv", index=False)
print("Generated 500 dummy claims")
