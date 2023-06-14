import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function FormDialogImage({ onOpen }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const token = Cookies.get("token");
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState({ aspect: 1 / 1 });
  const [croppedImage, setCroppedImage] = useState(null);

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
    if (croppedImage) {
      const formData = new FormData();
      formData.append("avatar", croppedImage);
      try {
        const res = await axios.post("/api/users/upload-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: res.data.profilePicture,
        }));
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

  const handleImageLoaded = (image) => {
    // Perform any additional logic when the image is loaded, if needed
  };

  const handleCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (avatarFile && crop.width && crop.height) {
      const croppedImageBlob = await getCroppedImageBlob(
        avatarFile,
        crop,
        "newFile.jpeg"
      );
      setCroppedImage(croppedImageBlob);
    }
  };

  const getCroppedImageBlob = (sourceImage, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(sourceImage);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to crop image."));
            return;
          }
          blob.name = fileName;
          resolve(blob);
        }, "image/jpeg");
      };
    });
  };

  return (
    <Dialog open={teu} onClose={handleClose}>
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
        />
        {avatarFile && (
          <ReactCrop
            src={URL.createObjectURL(avatarFile)}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onImageLoaded={handleImageLoaded}
            onComplete={handleCropComplete}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAvatarUpload}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
