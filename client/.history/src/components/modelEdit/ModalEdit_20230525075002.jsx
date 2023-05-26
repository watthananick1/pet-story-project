import React, { useState } from 'react';
import { Box, Modal, Button, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

const NestedModal = ({ onontent, onSaveChanges, onClose, ontitle }) => {
  const [content, setContent] = useState(content);

  const handleSaveChanges = () => {
    onSaveChanges(content);
    onClose();
  };

  const handleCloseNestedModal = () => {
    onClose();
  };

  const handleChangeContent = (event) => {
    setContent(event.target.value);
  };

  return (
    <Modal open={true} >
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
        <h2 id="nested-modal-title">`Edit ${ontitle}`</h2>
        <TextField
          id="nested-modal-content"
          label="Post Content"
          multiline
          rows={4}
          value={content}
          onChange={handleChangeContent}
        />
        <Button onClick={handleSaveChanges}>Save</Button>
      </Box>
    </Modal>
  );
};

export default NestedModal;