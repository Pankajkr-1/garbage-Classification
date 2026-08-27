import sys
import requests

API_URL = "http://localhost:8000/api/classify"


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_api.py <path_to_image>")
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        with open(image_path, "rb") as f:
            files = {
                "file": (
                    image_path,
                    f,
                    "image/jpeg"
                )
            }

            response = requests.post(
                API_URL,
                files=files
            )

        print("Status code:", response.status_code)
        print("Response headers:", response.headers.get("content-type"))
        print("Response body:")
        print(response.text)

    except FileNotFoundError:
        print("ERROR: Image file not found:")
        print(image_path)

    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to FastAPI.")
        print("Make sure the server is running.")


if __name__ == "__main__":
    main()