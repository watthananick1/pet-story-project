import React, { useState } from 'react';
import { Box, Modal, Button } from '@mui/material';

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

const NestedModal = () => {
  const [open, setOpen] = useState(true);

  const handleSaveChanges = () => {
    // Handle saving changes here
    setOpen(false);
  };

  const handleCloseNestedModal = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleCloseNestedModal}>
      <Box sx={style}>
        <h2 id="nested-modal-title">Edit Post</h2>
        {/* Content and form for editing the post */}
        <p id="nested-modal-description">
          Add your post content and form elements here.
        </p>
        <Button onClick={handleSaveChanges}>Save</Button>
        <Button onClick={handleCloseNestedModal}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default NestedModal;
