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

const ImagePreview = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "300px",
});

export default function FilePreviewer({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
  const [zoom, setZoom] = useState(1);
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

  const handleCropChange = (crop) => {
    setCrop(crop);
  };

  const handleZoomChange = (event, zoom) => {
    setZoom(zoom);
  };

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
          <Grid container spacing={2}>
            <Grid item xs={6} sm={6} md={6}>
              <div className="btn-container">
                <input
                  ref={filePickerRef}
                  accept="image/*"
                  onChange={previewFile}
                  type="file"
                  hidden
                />
                <Button
                  variant="outlined"
                  className="btn"
                  startIcon={<AddAPhotoIcon />}
                  onClick={() => filePickerRef.current.click()}
                >
                  <span>Choose</span>
                </Button>
              </div>
            </Grid>
            <Grid item xs={6} sm={6} md={6}>
              <IconButton aria-label="Picture" onClick={handleCancel}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item xs={12} md={6}>
              {imagePreview && (
                <ImagePreview>
                  <ReactCrop
                    src={imagePreview}
                    crop={crop}
                    zoom={zoom}
                    onChange={handleCropChange}
                    onImageLoaded={(image) => {
                      const aspectRatio = image.naturalWidth / image.naturalHeight;
                      setCrop((prevCrop) => ({ ...prevCrop, aspect: aspectRatio }));
                    }}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                </ImagePreview>
              )}
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} alignItems="center" mt={2}>
            <Typography variant="caption">Zoom:</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={handleZoomChange}
              aria-labelledby="zoom-slider"
              sx={{ flexGrow: 1 }}
            />
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
