import React, { useState, useContext } from "react";
import { Box, Modal, IconButton, TextField, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Cookies from "js-cookie";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { AuthContext } from "../../context/AuthContext";

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

const firestore = firebase.firestore();
const path = process.env.REACT_APP_PATH_ID;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const NestedModal = ({
  onContent,
  onContentID,
  onCommentsID,
  onClose,
  onTitle,
  userId,
  onPostUpdate,
  isAddComment,
  isMember_id
}) => {
  const [content, setContent] = useState(onContent);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  const { user } = useContext(AuthContext);
  
  async function newNotification(onType, onBody, onTitle) {
    const NotificationRef = firestore.collection("Notifications").doc();
    const NotificationID = NotificationRef.id;
    const newNotificationData = {
      id: NotificationID,
      type: onType,
      member_id: isMember_id,
      author_id: userId,
      name: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      timestamp: new Date(),
      title: onTitle,
      body: onBody,
      post_id: onContentID,
      read: false,
    };
  
    await NotificationRef.set(newNotificationData);
  }

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      try {
        setLoading(true);

        let endpoint = "";
        let updatedData = null;

        if (onTitle === "Post") {
          endpoint = `${path}/api/posts/${onContentID}`;
          updatedData = {
            content: content,
            member_id: userId,
            status: "normal",
          };
          await axios.put(endpoint, updatedData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const updatedPost = { ...onContent, ...updatedData };
          onPostUpdate(updatedPost);
        } else if (onTitle === "Comment") {
          endpoint = `${path}/api/comments/${onContentID}/Comments/${onCommentsID}`;
          updatedData = { content: content, member_id: userId };
          await axios.put(endpoint, updatedData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else if (onTitle === "Add Comment") {
          endpoint = `${path}/api/comments/Comment/${onContentID}`;
          updatedData = { content: content, member_id: userId };
          await axios.post(endpoint, updatedData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          newNotification("COMMENT", content, "comment post")
        } else {
          console.log("Invalid Edit Type");
          return;
        }

        if (isAddComment) {
          const resComments = await axios.get(
            `${path}/api/comments/${onContentID}/Comments`, {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            }
          );
          onPostUpdate(resComments.data, onTitle);
        } else {
          const updatedItem = { ...onContent, content };
          onPostUpdate(updatedItem, onTitle);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Err Edit Content");
    }
    onClose();
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleChangeContent = (event) => {
    setContent(event.target.value);
  };

  return (
    <Modal open={true}>
      <Box sx={style}>
        <IconButton
          onClick={handleCloseModal}
          size="small"
          sx={{
            position: "absolute",
            top: "0px",
            right: "0px",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12}>
            <h2 id="nested-modal-title">{onTitle}</h2>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              id="nested-modal-content"
              label={`${onTitle} Content`}
              multiline
              rows={4}
              value={content?.content}
              onChange={handleChangeContent}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <LoadingButton
              size="small"
              onClick={handleSaveChanges}
              endIcon={<SendIcon />}
              loading={loading}
              loadingPosition="end"
              variant="contained"
              sx={{ backgroundColor: "#6200E8" }}
              fullWidth
            >
              <span>{isAddComment ? "Add" : "Edit"}</span>
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

//---------------------------------------------------------

const ReportModal = ({
  onContent,
  onContentID,
  onCommentsID,
  onClose,
  onTitle,
  userId,
  onPostUpdate,
  isAddComment,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      try {
        setLoading(true);

        let endpoint = "";
        endpoint = `/api/report/reportPost`;
        const rePortData = {
          member_id: userId,
          post_id: onContentID,
          comment: content,
          status: "accepted",
        };

        await axios.put(endpoint, rePortData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Err Edit Content");
    }
    onClose();
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleChangeContent = (event) => {
    setContent(event.target.value);
  };

  return (
    <Modal open={true}>
      <Box sx={style}>
        <IconButton
          onClick={handleCloseModal}
          size="small"
          sx={{
            position: "absolute",
            top: "0px",
            right: "0px",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={12} md={12}>
            <h2 id="nested-modal-title">Report {onTitle}</h2>
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              id="nested-modal-content"
              label={`${onTitle} report`}
              multiline
              rows={4}
              value={content}
              onChange={handleChangeContent}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <LoadingButton
              size="small"
              onClick={handleSaveChanges}
              endIcon={<SendIcon />}
              loading={loading}
              loadingPosition="end"
              variant="filled"
              sx={{ backgroundColor: "#ffc400" }}
              fullWidth
            >
              <span>Report</span>
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export { NestedModal, ReportModal };
