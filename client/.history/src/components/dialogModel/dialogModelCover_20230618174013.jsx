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
import SaveIcon from '@mui/icons-material/Save';
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

export default function FilePreviewerCover({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 100, height: 50, aspect: 1 });
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

  // const getCroppedImageBlob = async (sourceImageUrl, crop, fileName) => {
  //   return new Promise((resolve, reject) => {
  //     const image = new Image();
  //     image.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       const scaleX = image.naturalWidth / image.width;
  //       const scaleY = image.naturalHeight / image.height;
  //       canvas.width = crop.width;
  //       canvas.height = crop.height;
  //       const ctx = canvas.getContext("2d");

  //       ctx.drawImage(
  //         image,
  //         crop.x * scaleX,
  //         crop.y * scaleY,
  //         crop.width * scaleX,
  //         crop.height * scaleY,
  //         0,
  //         0,
  //         crop.width,
  //         crop.height
  //       );

  //       canvas.toBlob(
  //         (blob) => {
  //           blob.name = fileName;
  //           resolve(blob);
  //         },
  //         "image/jpeg",
  //         1
  //       );
  //     };

  //     image.src = sourceImageUrl;
  //   });
  // };
  
  const handleCrop = () => {
    const image = new Image();
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

      const croppedImageUrl = canvas.toDataURL("image/jpeg", 1);
      setCroppedImage(croppedImageUrl);
      return croppedImageUrl;
    };

    image.src = imagePreview;
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
      
      

      // const croppedImage = await getCroppedImageBlob(imagePreview, crop);

      // if (!croppedImage) {
      //   throw new Error("Error cropping image");
      // }

      // const response = await fetch(croppedImage);
      // const blob = await response.blob();

      // const file = new File([blob], fileName, { type: blob.type });

      const uploadTaskSnapshot = await fileRef.put(croppedImage);

      const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      await firestore.collection("Users").doc(user.member_id).update({
        coverPicture: downloadUrl,
      });

      console.log("Profile picture updated successfully:", downloadUrl);

      onClose();
    } catch (error) {
      console.log("Error uploading profile picture:", error);
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
                      <br/>
                    </>
                  </ReactCrop>
                  {/* <Button onClick={handleCrop}>Crop Image</Button> */}
                  <br/>
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
