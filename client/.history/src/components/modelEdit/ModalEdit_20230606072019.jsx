import React, { useState } from 'react';
import { Box, Modal, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

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

const NestedModal = ({ onContent, onContentID, onCommentsID, onClose, onTitle, userId, onPostUpdate }) => {
  const [content, setContent] = useState(onContent);
  const [loading, setLoading] = useState(false);
  
  console.log(onContent);

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      if (onTitle === 'Post') {
        try {
          setLoading(true);
          await axios.put(`/api/posts/${onContentID}`, { member_id: userId, content: content });
          const updatedPost = { ...onContent, content: content }; // Update the content property of the post
          onPostUpdate(updatedPost); // Invoke the callback function with the updated post
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      } else if (onTitle === 'Comment') {
        try {
          setLoading(true);
          await axios.put(`/api/comments/${onContentID}/comments/${onCommentsID}`, { member_id: userId, content: content });
          const updatedComment = { ...onContent, content: content }; // Update the content property of the comment
          onPostUpdate(updatedComment); // Invoke the callback function with the updated comment
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      } else if (onTitle === 'Add Comment') {
        try {
          // Submit the comment
          const res = await axios.post(`/api/comments/${onContentID}/comments`, {
            content: content,
            member_id: userId,
          });
          
          console.log(res.message);
      
          const resComments = await axios.get(`/api/comments/${onContentID}/comments`);
          const updatedComment = resComments.data // Update the content property of the comment
          onPostUpdate(updatedComment); // Invoke the callback function with the updated comment
        } catch (err) {
          console.log(err);
        }
      
      }else {
        console.log('Err Edit Type');
      }
    } else {
      console.log('Err Edit Content');
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
          sx={{ backgroundColor: '#6200E8' }}
        >
          <span>
            {onTitle === 'Add Comment' ? 'Add' : 'Edit'}
          </span>
        </LoadingButton>
      </Box>
    </Modal>
  );
};

const NestedModal = ({ onContent, onContentID, onCommentsID, onClose, onTitle, userId, onPostUpdate }) => {
  const [content, setContent] = useState(onContent);
  const [loading, setLoading] = useState(false);
  
  console.log(onContent);

  const handleSaveChanges = async () => {
    if (onContent !== content) {
      if (onTitle === 'Post') {
        try {
          setLoading(true);
          await axios.put(`/api/posts/${onContentID}`, { member_id: userId, content: content });
          const updatedPost = { ...onContent, content: content }; // Update the content property of the post
          onPostUpdate(updatedPost); // Invoke the callback function with the updated post
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      } else if (onTitle === 'Comment') {
        try {
          setLoading(true);
          await axios.put(`/api/comments/${onContentID}/comments/${onCommentsID}`, { member_id: userId, content: content });
          const updatedComment = { ...onContent, content: content }; // Update the content property of the comment
          onPostUpdate(updatedComment); // Invoke the callback function with the updated comment
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      } else if (onTitle === 'Add Comment') {
        try {
          // Submit the comment
          const res = await axios.post(`/api/comments/${onContentID}/comments`, {
            content: content,
            member_id: userId,
          });
          
          console.log(res.message);
      
          const resComments = await axios.get(`/api/comments/${onContentID}/comments`);
          const updatedComment = resComments.data // Update the content property of the comment
          onPostUpdate(updatedComment); // Invoke the callback function with the updated comment
        } catch (err) {
          console.log(err);
        }
      
      }else {
        console.log('Err Edit Type');
      }
    } else {
      console.log('Err Edit Content');
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
          sx={{ backgroundColor: '#6200E8' }}
        >
          <span>
            {onTitle === 'Add Comment' ? 'Add' : 'Edit'}
          </span>
        </LoadingButton>
      </Box>
    </Modal>
  );
};

export default NestedModal;
