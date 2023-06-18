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
import { Send as SendIcon } from "@mui/icons-material";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import LoadingButton from "@mui/lab/LoadingButton";

const firebaseConfig = {
  // Your Firebase config here
};

// Initialize Firebase outside the component
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();
const firestore = firebase.firestore();

export default function FilePreviewer({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
  const [croppedImageBlob, setCroppedImageBlob] = useState(null); // Track the cropped image blob
  const cropperRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    setImagePreview(null);
    onClose();
  };

  const previewFile = (e) => {
    const reader = new FileReader();
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  };

  const getCroppedImageBlob = (sourceImage, crop) => {
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
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/jpeg"); // Convert the canvas to a blob using JPEG format
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

  const uploadImageAndUpdateFirestore = async () => {
    setLoading(true);

    try {
      const storageRef = storage.ref();
      const fileName = `${Date.now()}_profile`;
      const fileRef = storageRef.child(
        `${user.member_id}/profilePicture/${fileName}`
      );
      const uploadTaskSnapshot = await fileRef.put(croppedImageBlob);

      const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      // Update profilePicture field in Firestore
      await firestore
        .collection("Users")
        .doc(user.member_id)
        .update({
          profilePicture: downloadUrl,
        });

      console.log("Profile picture updated successfully:", downloadUrl);

      onClose();
    } catch (error) {
      console.log("Error uploading profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    setLoading(true);

    const sourceImage = new Image();
    sourceImage.onload = async () => {
      try {
        const croppedImageBlob = await getCroppedImageBlob(sourceImage, crop);
        setCroppedImageBlob(croppedImageBlob); // Save the cropped image blob

        const imageMaxSize = 5 * 1024 * 1024; // 5 MB in bytes

        if (croppedImageBlob.size > imageMaxSize) {
          console.log("Image size exceeds the maximum limit.");
          return;
        }

        await uploadImageAndUpdateFirestore(); // Call the upload function

      } catch (error) {
        console.log("Error cropping image:", error);
      }
    };

    sourceImage.onerror = () => {
      console.log("Failed to load source image.");
    };

    sourceImage.src = imagePreview;
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
                accept="image/png, image/jpeg, image/jpg"
                onChange={previewFile}
                type="file"
                hidden
                ref={(input) => {
                  if (input) {
                    imagePreview.current = input;
                  }
                }}
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
                <Cropper
                  src={imagePreview}
                  ref={cropperRef}
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
          <Button onClick={handleCancel}>Cancel</Button>
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
