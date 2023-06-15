import { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import { ReactCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const ImagePreview = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "300px",
});

export default function FilePreviewer({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
  const token = Cookies.get("token");
  const [open, setOpen] = useState(true);
  const filePickerRef = useRef(null);

  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    setImagePreview(null);
  };

  function previewFile(e) {
    const reader = new FileReader();
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  }

  const handleAvatarUpload = async () => {
    if (crop.width && crop.height) {
      const sourceImage = document.createElement("img");
      sourceImage.src = imagePreview;

      const croppedImageBlob = await getCroppedImageBlob(
        sourceImage,
        crop,
        "newFile.jpeg"
      );

      const formData = new FormData();
      formData.append("avatar", croppedImageBlob);

      try {
        const res = await axios.post("/api/users/upload-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        onClose();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCroppedImageBlob = (sourceImage, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const scaleX = sourceImage.naturalWidth / sourceImage.width;
      const scaleY = sourceImage.naturalHeight / sourceImage.height;

      const imageWidth = crop.width * scaleX;
      const imageHeight = crop.height * scaleY;

      canvas.width = imageWidth;
      canvas.height = imageHeight;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        sourceImage,
        crop.x * scaleX,
        crop.y * scaleY,
        imageWidth,
        imageHeight,
        0,
        0,
        imageWidth,
        imageHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob."));
          return;
        }

        blob.name = fileName;
        resolve(blob);
      }, "image/jpeg");
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Stack container spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              <div className="btn-container">
                <input
                  ref={filePickerRef}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={previewFile}
                  type="file"
                  hidden
                />
                <Button
                  
                  variant="outlined"
                  className="btn"
                  startIcon={<AddAPhotoIcon />}
                  onClick={() => setImagePreview(filePickerRef.current.click())}
                >
                  <span>Choose</span>
                </Button>
              </div>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              {imagePreview && (
                <Cropper
                  src={imagePreview}
                  style={{
                    height: 400,
                    width: 400,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  initialAspectRatio={4 / 3}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  guides={true}
                  checkOrientation={false}
                  onInitialized={(instance) => {
                    setCrop(instance);
                  }}
                />
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAvatarUpload}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
