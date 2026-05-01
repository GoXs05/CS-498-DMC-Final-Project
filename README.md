## Run The App

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Run The Backend

1. Go to the GCP VM
2. Run these commands:
```
cd ~
source backend_env/bin/activate
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
```
