import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  Box,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

export default function FormDialogImage({ onOpen }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const token = Cookies.get("token");
  const [user, setUser] = useState({});
  const [open, setOpen] = useState(false);

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
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
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

  return (
    <Modal open={true}>
      <Box>
        <Dialog open={true} onClose={handleClose}>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAvatarUpload}>Submit</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
}