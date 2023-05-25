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

export default function NestedModal() {
  const [open, setOpen] = useState(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div id="modal-root"
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={style}>
          <h2 id="parent-modal-title">Text in a modal</h2>
          <p id="parent-modal-description">
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </p>
          <ChildModal handleClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
}
