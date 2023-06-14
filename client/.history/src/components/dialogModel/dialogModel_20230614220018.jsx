import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

export default function FormDialogImage({ onOpen }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const token = Cookies.get("token");
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 30,
    aspect: 1 / 1,
    rotation: 0,
    x: 0,
    y: 0,
  });

  const handleClickOpen = () => {
    setOpen(true);
    if (onOpen) {
      onOpen(true);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (crop.width && crop.height) {
      const croppedImageBlob = await getCroppedImageBlob(
        avatarFile,
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
        // Handle the response as needed
        handleClose();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onOpen) {
      onOpen(false);
    }
  };

  const handleSliderChange = (key) => (event, value) => {
    setCrop((prevCrop) => ({ ...prevCrop, [key]: value }));
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const getCroppedImageBlob = async (sourceImage, crop, fileName) => {
    return new Promise((resolve) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onloadend = () => {
        image.src = reader.result;
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const scaleX = image.naturalWidth / image.width;
          const scaleY = image.naturalHeight / image.height;
          const rotation = crop.rotation || 0;

          const rotatedWidth =
            crop.width * Math.abs(Math.cos((rotation * Math.PI) / 180)) +
            crop.height * Math.abs(Math.sin((rotation * Math.PI) / 180));
          const rotatedHeight =
            crop.width * Math.abs(Math.sin((rotation * Math.PI) / 180)) +
            crop.height * Math.abs(Math.cos((rotation * Math.PI) / 180));

          canvas.width = rotatedWidth;
          canvas.height = rotatedHeight;
          const ctx = canvas.getContext("2d");

          ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(
            image,
            (crop.x + crop.width / 2) * scaleX - rotatedWidth / 2,
            (crop.y + crop.height / 2) * scaleY - rotatedHeight / 2,
            crop.width * scaleX,
            crop.height * scaleY,
            -crop.width / 2,
            -crop.height / 2,
            crop.width,
            crop.height
          );

          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            blob.name = fileName;
            resolve(blob);
          }, "image/jpeg");
        };
      };

      reader.readAsDataURL(sourceImage);
    });
  };

  const SortableItem = SortableElement(({ item, index }) => {
    return (
      <div className="shareImgItem">
        <img src={item.url} alt="Gallery Image" className="shareImg" />
      </div>
    );
  });

  const SortableList = SortableContainer(({ items }) => (
    <div className="shareImgContainer">
      {items.map((item, index) => (
        <SortableItem key={index} item={item} index={index} />
      ))}
    </div>
  ));

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Change Profile Picture
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <label htmlFor="file">
            <Button
              variant="contained"
              component="span"
              startIcon={<AddAPhotoIcon />}
            >
              Add Picture
            </Button>
          </label>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            accept=".png,.jpeg,.jpg"
            multiple
            onChange={handleAvatarChange}
          />type
          <SortableList
            items={[avatarFile].map((file) => ({
              type: 'image',
              url: URL.createObjectURL(file),
            }))}
            onSortEnd={() => {}}
            axis="xy"
            distance={1}
          />
          {avatarFile && (
            <ReactCrop
              src={URL.createObjectURL(avatarFile)}
              crop={crop}
              onChange={handleCropChange}
            />
          )}
          <Stack spacing={2} mt={2}>
            <Typography id="rotation-slider" gutterBottom>
              Rotation
            </Typography>
            <Slider
              value={crop.rotation}
              onChange={handleSliderChange("rotation")}
              aria-labelledby="rotation-slider"
              min={-180}
              max={180}
              step={1}
            />
            <Typography id="scale-slider" gutterBottom>
              Scale
            </Typography>
            <Slider
              value={crop.width}
              onChange={handleSliderChange("width")}
              aria-labelledby="scale-slider"
              min={1}
              max={100}
              step={1}
            />
            <Typography id="zoom-slider" gutterBottom>
              Zoom
            </Typography>
            <Slider
              value={crop.aspect * 100}
              onChange={handleSliderChange("aspect")}
              aria-labelledby="zoom-slider"
              min={50}
              max={150}
              step={1}
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
