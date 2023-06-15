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
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export default function FilePreviewer({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
  const token = Cookies.get("token");
  const [open, setOpen] = useState(true);
  const filePickerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
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
        setLoading(true);

        const storageRef = storage.ref();
        const fileName = `${Date.now()}_profile`;
        const fileRef = storageRef.child(`${user.member_id}/profilePicture/`);
        const uploadTaskSnapshot = await fileRef.put(croppedImageBlob);

        const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

        // Send the downloadUrl to your API or use it directly

        onClose();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              mt={2}
            >
              <input
                ref={filePickerRef}
                accept="image/png, image/jpeg, image/jpg"
                onChange={previewFile}
                type="file"
                hidden
              />
              <Button
                sx={{ alignItems: "center", justifyContent: "center" }}
                variant="outlined"
                className="btn"
                startIcon={<AddAPhotoIcon />}
                onClick={() => setImagePreview(filePickerRef.current.click())}
              >
                <span>Choose</span>
              </Button>
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
