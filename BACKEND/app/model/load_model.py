import os
import onnxruntime as ort

_ort_session = None

def get_classifier():
    """
    Legacy wrapper for compatibility with older imports.
    Returns the ONNX Session object.
    """
    return get_onnx_session()

def get_onnx_session():
    """
    Returns a singleton ONNX Runtime InferenceSession for
    the lightweight MobileNetV3-Small classifier.
    """
    global _ort_session
    if _ort_session is None:
        print("Loading lightweight MobileNetV3-Small ONNX model...")
        weights_dir = os.path.join(os.path.dirname(__file__), "weights")
        onnx_path = os.path.join(weights_dir, "model.onnx")
        
        # Self-healing check: run export script if ONNX file is missing
        if not os.path.exists(onnx_path):
            print("ONNX model file not found, running export on-the-fly...")
            from app.model.export_onnx import export
            export()
            
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 1
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        
        _ort_session = ort.InferenceSession(
            onnx_path, 
            sess_options=opts, 
            providers=["CPUExecutionProvider"]
        )
        print("Model loaded successfully.")
    return _ort_session
