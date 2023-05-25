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

function ChildModal({ handleClose }) {
  const handleChildClose = () => {
    handleClose(); // Call the handleClose function from props to close the parent modal
  };

  return (
    <Box sx={{ ...style, width: 200 }}>
      <h2 id="child-modal-title">Text in a child modal</h2>
      <p id="child-modal-description">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
      </p>
      <Button onClick={handleChildClose}>Close Child Modal</Button>
    </Box>
  );
}

const NestedModal = () => {
  const [open, setOpen] = useState(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCloseNestedModal = () => {
    setOpen(false);
  };

  return (
    <Modal open={true} onClose={handleCloseNestedModal}>
      <div className="nestedModal">
        {/* Content and form for editing the post */}
        {/* Save and cancel buttons */}
      </div>
    </Modal>
  );
};
export default NestedModal;
