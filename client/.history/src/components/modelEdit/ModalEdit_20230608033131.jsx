import React, { useState } from "react";
import { Box, Modal, IconButton, TextField, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

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
}) => {
  const [content, setContent] = useState(onContent);
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      try {
        setLoading(true);

        let endpoint = "";
        let updatedData = null;

        if (onTitle === "Post") {
          endpoint = `/api/posts/${onContentID}`;
          updatedData = { content };
        } else if (onTitle === "Comment") {
          endpoint = `/api/comments/${onContentID}/comments/${onCommentsID}`;
          updatedData = { content };
        } else if (onTitle === "Add Comment") {
          endpoint = `/api/comments/Comment/${onContentID}`;
          updatedData = { content: , member_id: userId };
        } else {
          console.log("Invalid Edit Type");
          return;
        }

        await axios.put(endpoint, updatedData);

        if (isAddComment) {
          const resComments = await axios.get(
            `/api/comments/${onContentID}/comments`
          );
          onPostUpdate(resComments.data);
        } else {
          const updatedItem = { ...onContent, content };
          onPostUpdate(updatedItem);
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

        await axios.put(endpoint, rePortData);
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
