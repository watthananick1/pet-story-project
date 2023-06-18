import React, { useState, useRef, useEffect } from "react";
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
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import LoadingButton from "@mui/lab/LoadingButton";

const firebaseConfig = {
  // Your Firebase configuration
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();
const firestore = firebase.firestore();

export default function FilePreviewerCover({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 1 });
  const [croppedImage, setCroppedImage] = useState(null);  

  const cropperRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleCancel = () => {
    setImagePreview(null);
    handleClose();
  };

  const previewFile = (e) => {
    const reader = new FileReader();
    const selectedFile = e.target.files[0];
  
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCrop((prevCrop) => ({ ...prevCrop, width: 30, aspect: 1 }));
        setCroppedImage(null);
      };
    }
  };
  

  const getCroppedImageBlob = async (sourceImageUrl, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = sourceImageUrl;
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

        canvas.toBlob(
          (blob) => {
            blob.name = fileName;
            resolve(blob);
          },
          "image/jpeg",
          1
        );
      };
    });
  };

  const handleAvatarUpload = async () => {
    setLoading(true);

    try {
      const storageRef = storage.ref();
      const fileName = `${Date.now()}_cover`;
      const fileRef = storageRef.child(
        `${user.member_id}/CovertPicture/${fileName}`
      );

      if (!imagePreview) {
        throw new Error("No image selected");
      }

      const croppedImage = await getCroppedImageBlob(
        imagePreview,
        crop,
        "cropped_cover"
      );

      const uploadTaskSnapshot = await fileRef.put(croppedImage);

      const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      await firestore.collection("Users").doc(user.member_id).update({
        coverPicture: downloadUrl,
      });

      console.log("Cover picture updated successfully:", downloadUrl);

      onClose();
    } catch (error) {
      console.log("Error uploading cover picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrop = async () => {
    setLoading(true);

    try {
      const croppedImage = await getCroppedImageBlob(
        imagePreview,
        crop,
        "cropped_cover"
      );

      // TODO: Handle the cropped image as desired
      // For example, you can upload the cropped image to a server or display it

      console.log("Image cropped successfully");

      onClose();
    } catch (error) {
      console.log("Error cropping image:", error);
    } finally {
      setLoading(false);
    }
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
                    src={imagePreview}
                    crop={crop}
                    onCropChange={(newCrop) => setCrop(newCrop)}
                  />
                  <img src={imagePreview} alt="Preview" />
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <LoadingButton
            onClick={handleCrop}
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
