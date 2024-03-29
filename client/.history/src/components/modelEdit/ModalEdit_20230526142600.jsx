import React, { useState } from 'react';
import Feed from "../../components/feed/Feed";
import { Box, Modal, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import {Send as SendIcon} from "@mui/icons-material";
import axios from "axios";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const NestedModal = ({ onContent, onContentID, , onClose, onTitle, userId, onfirstName, onPostUpdate }) => {
  const [content, setContent] = useState(onContent);
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      if (onTitle === "Post") {
        try {
          setLoading(true);
          await axios.put(`/api/posts/${onContentID}`, { member_id: userId, content: content });
          onPostUpdate(); // Invoke the callback function to re-fetch post data
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      } else if (onTitle === "Comment") {
        console.log(content);
        try {
            setLoading(true);
            await axios.put(`/api/posts/${onContentID}/comments`, { member_id: userId, content: content });
            onPostUpdate(); // Invoke the callback function to re-fetch post data
          } catch (err) {
            console.log(err);
          } finally {
            setLoading(false);
          }
        console.log("Edit comment");
      } else {
        console.log("Err Edit Type");
      }
    } else {
      console.log("Err Edit Content");
    }
    onClose();
  };

  const handleCloseNestedModal = () => {
    onClose();
  };

  const handleChangeContent = (event) => {
    setContent(event.target.value);
  };

  return (
    <Modal open={true}>
      <Box sx={style}>
        <IconButton
          onClick={handleCloseNestedModal}
          size="small"
          sx={{
            position: 'absolute',
            top: '0px',
            right: '0px',
          }}
        >
          <CloseIcon />
        </IconButton>
        <h2 id="nested-modal-title">Edit {onTitle}</h2>
        <TextField
          id="nested-modal-content"
          label={`${onTitle} Content`}
          multiline
          rows={4}
          value={content?.content}
          onChange={handleChangeContent}
        />
        <LoadingButton
          size="small"
          onClick={handleSaveChanges}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
          sx={{ backgroundColor: "#6200E8" }}
        >
          <span>Edit</span>
        </LoadingButton>
      </Box>
    </Modal>
  );
};

export default NestedModal;
