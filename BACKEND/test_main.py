import unittest
from unittest.mock import patch
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.utils.face_detection import detect_face_box

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "status": "OK",
            "message": "DeepGuard API is running"
        })

    def test_analyze_image_invalid_content_type(self):
        files = {
            "file": ("test.txt", b"some dummy text content", "text/plain")
        }
        response = self.client.post("/analyze/image", files=files)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Invalid file type")

    def test_analyze_website_ssrf_localhost(self):
        response = self.client.post("/analyze/website", json={"url": "http://127.0.0.1/"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("forbidden", response.json()["detail"].lower())

    def test_analyze_website_ssrf_private_range(self):
        response = self.client.post("/analyze/website", json={"url": "http://192.168.1.1/"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("forbidden", response.json()["detail"].lower())

class TestFaceDetection(unittest.TestCase):
    @patch('app.utils.face_detection.mtcnn')
    def test_detect_face_box_found(self, mock_mtcnn):
        # Mock mtcnn.detect to return a bounding box (x1, y1, x2, y2)
        mock_mtcnn.detect.return_value = ( [[10, 20, 100, 120]], [0.99] )
        
        dummy_img = Image.new('RGB', (200, 200))
        result = detect_face_box(dummy_img)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["x"], 10)
        self.assertEqual(result["y"], 20)
        self.assertEqual(result["width"], 90)  # 100 - 10
        self.assertEqual(result["height"], 100) # 120 - 20

    @patch('app.utils.face_detection.mtcnn')
    def test_detect_face_box_not_found(self, mock_mtcnn):
        # Mock mtcnn.detect to return no face detected
        mock_mtcnn.detect.return_value = (None, None)
        
        dummy_img = Image.new('RGB', (200, 200))
        result = detect_face_box(dummy_img)
        
        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main()
