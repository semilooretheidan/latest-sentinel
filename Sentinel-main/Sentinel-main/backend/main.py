from fastapi import FastAPI, UploadFile, File, HTTPException,Form
import ai_vision, shutil, os
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

app = FastAPI()

# Add this CORS block so React can talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Notice how we accept every field individually as Form() data, plus the File()
@app.post("/api/vendors/create-account")
async def process_vendor_account(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    bvn: str = Form(...),
    businessName: str = Form(...),
    document: UploadFile = File(...)
):
    print(f"Received request for {businessName} from {firstName}")
    
    # 5. Return the successful data back to React
    return {
        "status": "success",
        "message": "Virtual account generated successfully",
        "data": {
            "vendorId": f"VND-{bvn[-4:]}", # Simple ID using last 4 digits of BVN
            "virtualAccount": {
                "account_name": businessName,
                "account_number": "1234567890", # Mock number since squad API isn't in Python
                "bank_name": "Mock Python Bank"
            }
        }
    }
@app.get("/")
async def root():
    return {"message": "Sentinel AI Vision API is running. Use POST /analyze for image verification."}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Stateless endpoint for Node.js API to call.
    Just returns the AI score.
    """
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        
    path = f"uploads/{file.filename}"
    with open(path, "wb") as buffer: 
        shutil.copyfileobj(file.file, buffer)

    try:
        score = ai_vision.compare_images("reference.jpg", path)
        return {"score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Vision Error: {str(e)}")