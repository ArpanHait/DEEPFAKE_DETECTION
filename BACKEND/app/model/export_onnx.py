import torch
import torchvision.models as models
import torch.nn as nn
import os

def export():
    print("Initializing MobileNetV3-Small...")
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    
    # Refactor the classifier to output 2 classes (0: Real, 1: Fake)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, 2)
    
    # Set to evaluation mode
    model.eval()
    
    # Create dummy input matching (batch_size, channels, height, width)
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Define save path
    weights_dir = os.path.join(os.path.dirname(__file__), "weights")
    os.makedirs(weights_dir, exist_ok=True)
    onnx_path = os.path.join(weights_dir, "model.onnx")
    
    print(f"Exporting to ONNX format at: {onnx_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
    )
    print("Export complete!")

if __name__ == "__main__":
    export()
