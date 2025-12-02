import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface ConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className='bg-light'>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center py-4'>
        <p className='mb-0 fs-5'>{message}</p>
      </Modal.Body>
      <Modal.Footer className='justify-content-center border-0 pb-4'>
        <Button variant='secondary' onClick={onHide} className='px-4 me-2'>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} className='px-4'>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
