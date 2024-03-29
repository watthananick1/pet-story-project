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
import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};



export default function FilePreviewerCover({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const token = Cookies.get("token");
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState({});
  const filePicekerRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 30,
    aspect: 1 / 1,
    rotation: 0,
    x: 0,
    y: 0,
  });
  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    setImagePreview(null);
    setImagePreview(null);
  };
  function previewFile(e) {
    // Reading New File (open file Picker Box)
    const reader = new FileReader();
    // Gettting Selected File (user can select multiple but we are choosing only one)
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
    // As the File loaded then set the stage as per the file type
    reader.onload = (readerEvent) => {
      if (selectedFile.type.includes("image")) {
        setImagePreview(readerEvent.target.result);
      } else if (selectedFile.type.includes("video")) {
        setVideoPreview(readerEvent.target.result);
      }
    };
  }

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

  const handleAvatarUpload = async () => {
    if (crop.width && crop.height) {
      const croppedImageBlob = await getCroppedImageBlob(
        filePicekerRef.current.files[0],
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
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: res.data.profilePicture,
        }));
        onClose();
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Cover Picture</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={6} md={6}>
              <div className="btn-container">
                <input
                  ref={filePicekerRef}
                  accept="image/*, video/*"
                  onChange={previewFile}
                  type="file"
                  hidden
                />
                <Button
                  variant="outlined"
                  className="btn"
                  startIcon={<AddAPhotoIcon />}
                  onClick={() => filePicekerRef.current.click()}
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
              <div className="preview">
                {imagePreview && <img src={imagePreview} alt="Image Preview" />}
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAvatarUpload}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
