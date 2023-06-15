import { useState, useRef } from "react";
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

export default function FilePreviewer() {
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [open, setOpen] = useState(false);
  const filePicekerRef = useRef(null);
  const handleClose = () => {
    setOpen(false);
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

  return (
    <div>
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <div className="btn-container">
            <input
              ref={filePicekerRef}
              accept="image/*, video/*"
              onChange={previewFile}
              type="file"
              hidden
            />
            <button
              className="btn"
              onClick={() => filePicekerRef.current.click()}
            >
              Choose
            </button>
            <button className="btn">x</button>
          </div>
          <div className="preview">
            <img src="" alt="" />
            <video controls src=""></video>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAvatarUpload}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
