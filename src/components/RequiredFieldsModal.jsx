import { Modal } from './Modal/index.js';

function RequiredFieldsModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="입력 확인"
      size="small"
    >
      <p className="m-0 text-sm text-fg-basic">
        모든 항목은 필수 입력입니다.
      </p>
    </Modal>
  );
}

export default RequiredFieldsModal;
