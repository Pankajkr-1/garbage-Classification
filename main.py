import time

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from utils.preprocess import preprocess_image
from utils.inference import predict, get_disposal_info


app = FastAPI(title="Smart Waste Segregation API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
}


@app.post("/api/classify")
async def classify_waste(file: UploadFile = File(...)):

    print("\n========== NEW IMAGE REQUEST ==========")
    print("Filename:", file.filename)
    print("Content type:", file.content_type)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}"
        )

    image_bytes = await file.read()

    print("Image bytes:", len(image_bytes))

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty file"
        )

    start = time.time()

    # -----------------------------------------
    # PREPROCESSING
    # -----------------------------------------

    try:
        processed = preprocess_image(image_bytes)

        print("Preprocessed successfully")
        print("Shape:", processed.shape)
        print("Dtype:", processed.dtype)

    except Exception as e:
        print("PREPROCESSING ERROR:", repr(e))

        raise HTTPException(
            status_code=400,
            detail=f"Could not process image: {str(e)}"
        )

    # -----------------------------------------
    # MODEL PREDICTION
    # -----------------------------------------

    try:
        label, confidence, all_scores = predict(processed)

        print("Prediction successful")
        print("Label:", label)
        print("Confidence:", confidence)

    except Exception as e:
        print("PREDICTION ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

    # -----------------------------------------
    # DISPOSAL INFORMATION
    # -----------------------------------------

    try:
        disposal_info = get_disposal_info(label)

        print("Disposal information loaded")
        print("Display name:", disposal_info["display_name"])

    except Exception as e:
        print("DISPOSAL RULE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Could not load disposal information: {str(e)}"
        )

    # -----------------------------------------
    # RESPONSE
    # -----------------------------------------

    result = {
        "category": label,
        "display_name": disposal_info["display_name"],
        "confidence": round(confidence, 3),
        "recyclable": disposal_info["recyclable"],
        "disposal_method": disposal_info["method"],
        "tips": disposal_info["tips"],
        "all_scores": all_scores,
        "processing_time_ms": round(
            (time.time() - start) * 1000,
            1
        )
    }

    print("SUCCESS:", result)
    print("=======================================\n")

    return result


@app.get("/api/health")
def health():
    return {"status": "ok"}