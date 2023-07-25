import React, { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();
const firestore = firebase.firestore();
const path = process.env.REACT_APP_PATH_ID;

export default function FilePreviewerCover({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100,
    height: 50,
    aspect: 1,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const cropperRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    setImagePreview(null);
    handleClose();
  };

  const handleCrop = () => {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const MAX_WIDTH = window.innerWidth - 50; // Maximum width of the cropped image
        const MAX_HEIGHT = window.innerHeight - 200; // Maximum height of the cropped image
        const aspectRatio = image.width / image.height;
        let width = image.width;
        let height = image.height;

        // Adjust width and height to fit within maximum dimensions while maintaining aspect ratio
        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = width / aspectRatio;
        }
        if (height > MAX_HEIGHT) {
          height = MAX_HEIGHT;
          width = height * aspectRatio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        const cropX = (image.width - width) / 2; // X coordinate for cropping
        const cropY = (image.height - height) / 2; // Y coordinate for cropping

        ctx.drawImage(image, cropX, cropY, width, height, 0, 0, width, height);

        const croppedImageUrl = canvas.toDataURL("image/jpeg", 1);
        resolve(croppedImageUrl);
      };

      image.src = imagePreview;
    });
  };

  const handleAvatarUpload = async () => {
    setLoading(true);

    try {
      const storageRef = storage.ref();
      const fileName = `${Date.now()}_cover`;
      const fileRef = storageRef.child(
        `${user.member_id}/CoverePicture/${fileName}`
      );

      if (!imagePreview) {
        throw new Error("No image selected");
      }

      const croppedImageDataURL = await handleCrop();

      if (!croppedImageDataURL) {
        throw new Error("Error cropping image");
      }

      const response = await fetch(croppedImageDataURL);
      const blob = await response.blob();

      const file = new File([blob], fileName, { type: blob.type });

      const uploadTaskSnapshot = await fileRef.put(file);

      const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      await firestore.collection("Users").doc(user.member_id).update({
        coverPicture: downloadUrl,
      });

      //console.log("Profile picture updated successfully:", downloadUrl);

      handleClose();
    } catch (error) {
      console.log("Error uploading cover picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const previewFile = (e) => {
    const reader = new FileReader();
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        const imgDataUrl = reader.result;
        setImagePreview(imgDataUrl);
        setCrop((prevCrop) => ({ ...prevCrop, width: 30, aspect: 1 }));
        setCroppedImage(null);
      };
    }
  };

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  return (
    <div>
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Update Cover Picture</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              mt={2}
            >
              <input
                accept="image/png, image/jpeg, image/jpg"
                onChange={previewFile}
                ref={cropperRef}
                type="file"
                hidden
              />
              <Button
                variant="outlined"
                className="btn"
                startIcon={<AddAPhotoIcon />}
                onClick={() => cropperRef.current.click()}
              >
                Choose
              </Button>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              {imagePreview && (
                <>
                  <ReactCrop
                    crop={crop}
                    // locked={true}
                    onChange={handleCropChange}
                    onImageLoaded={setImagePreview}
                    src={imagePreview}
                  >
                    <>
                      <img src={imagePreview} />
                      <br />
                    </>
                  </ReactCrop>
                  {/* <Button onClick={handleCrop}>Crop Image</Button> */}
                  <br />
                  {/* {croppedImage && (
                    <div>
                      <h3>Cropped Image:</h3>
                      <img src={croppedImage} alt="Cropped" />
                    </div>
                  )} */}
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <LoadingButton
            onClick={handleAvatarUpload}
            variant="outlined"
            color="success"
            startIcon={<SaveIcon />}
            className="shareButton"
            loading={loading}
            disabled={loading}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
