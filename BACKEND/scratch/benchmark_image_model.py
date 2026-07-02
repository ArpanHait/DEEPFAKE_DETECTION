import sys
import os
import time
from PIL import Image

# Add BACKEND to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.model.inference import predict_image

def main():
    print("Initializing benchmark test...")
    # Create a dummy RGB image
    img = Image.new("RGB", (800, 800), color="blue")
    
    # Warmup call
    print("Running warmup call...")
    predict_image(img)
    
    # Benchmark runs
    num_runs = 15
    latencies = []
    
    print(f"Running {num_runs} benchmark iterations...")
    for i in range(num_runs):
        start_time = time.time()
        res = predict_image(img)
        latency = (time.time() - start_time) * 1000
        latencies.append(latency)
        print(f"  Iteration {i+1:02d}: Result: {res['label']} (Confidence: {res['score']:.1%}) | Latency: {latency:.2f} ms")
        
    avg_latency = sum(latencies) / len(latencies)
    print("\nBenchmark Results Summary:")
    print(f"  Average CPU Latency: {avg_latency:.2f} ms")
    print(f"  Min CPU Latency: {min(latencies):.2f} ms")
    print(f"  Max CPU Latency: {max(latencies):.2f} ms")
    
    if avg_latency < 150.0:
        print("\nSUCCESS: Average CPU latency is well under the 150ms threshold!")
    else:
        print("\nWARNING: Average CPU latency exceeded the 150ms threshold.")

if __name__ == "__main__":
    main()
