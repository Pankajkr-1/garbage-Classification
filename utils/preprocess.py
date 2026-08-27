from io import BytesIO

import numpy as np
from PIL import Image


IMAGE_SIZE = (224, 224)


def preprocess_image(image_bytes: bytes) -> np.ndarray:

    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    image = image.resize(IMAGE_SIZE)

    image_array = np.asarray(image, dtype=np.float32)

    image_array = image_array / 255.0

    image_array = np.expand_dims(image_array, axis=0)

    return image_array