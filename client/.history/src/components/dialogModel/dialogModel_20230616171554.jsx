import React, { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
// import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Send as SendIcon } from "@mui/icons-material";
// import CloseIcon from "@mui/icons-material/Close";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
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

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export default function FilePreviewer({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
  const cropperRef = useRef(null); // Separate ref for Cropper component
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(true);

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
    setLoading(true);

    const sourceImage = document.createElement("img");
    sourceImage.src = cropperRef.current.src; // Access the current value of the ref

    const croppedImageBlob = await getCroppedImageBlob(
      sourceImage,
      crop,
      "newFile.jpeg"
    );

    const imageMaxSize = 5 * 1024 * 1024; // 5 MB in bytes

    if (croppedImageBlob.size > imageMaxSize) {
      console.log("Image size exceeds the maximum limit.");
      return;
    }

    try {
      const storageRef = storage.ref();
      const fileName = Date.now() + _;
      const fileRef = storageRef.child( `${user.member_id}/profilePicture/${fileName}`);
      return fileRef.put(croppedImageBlob);

    const uploadSnapshots = await Promise.all(filePromises);

    const fileUrls = await Promise.all(
      uploadSnapshots.map((snapshot) => snapshot.ref.getDownloadURL())
    );

      const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      // Update profilePicture field in Firestore
      await firebase.collection("Users").doc(user.member_id).update({
        profilePicture: downloadUrl,
      });

      // Update the image preview with the new selected image
      console.log(downloadUrl);

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  function dataURLtoBlob(dataURL) {
    const base64String = dataURL.split(",")[1];
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: "image/jpeg" });
  }

  const getCroppedImageBlob = (sourceImage, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      sourceImage.onload = () => {
        const scaleX = sourceImage.naturalWidth / sourceImage.width;
        const scaleY = sourceImage.naturalHeight / sourceImage.height;

        const imageWidth = crop.width * scaleX;
        const imageHeight = crop.height * scaleY;

        canvas.width = imageWidth;
        canvas.height = imageHeight;

        try {
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

          const dataURL = canvas.toDataURL("image/jpeg");
          const blob = dataURLtoBlob(dataURL);
          blob.name = fileName;

          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };

      sourceImage.onerror = (error) => {
        reject(new Error("Failed to load source image."));
      };

      sourceImage.src = imagePreview;
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
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
                ref={cropperRef}
                accept="image/png, image/jpeg, image/jpg"
                onChange={previewFile}
                type="file"
                hidden
              />
              <Button
                variant="outlined"
                className="btn"
                startIcon={<AddAPhotoIcon />}
                onClick={() => cropperRef.current.click()}
              >
                <span>Choose</span>
              </Button>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mt={2}>
              {imagePreview && (
                <Cropper
                  src={imagePreview}
                  ref={cropperRef} // Use separate ref for Cropper
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
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                />
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            onClick={handleAvatarUpload}
            variant="outlined"
            color="success"
            startIcon={<SendIcon />}
            className="shareButton"
            loading={loading}
            disabled={loading}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
