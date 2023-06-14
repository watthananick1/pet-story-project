import { useState } from "react";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

export default function FormDialogImage() {
  const [open, setOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const token = Cookies.get("token");
  const [user, setUser] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
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
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Change Profile Picture
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAvatarUpload}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
