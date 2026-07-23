import ModalRoot from './Modal.jsx';
import ModalButton from './ModalButton.jsx';
import ModalFooter from './ModalFooter.jsx';

/**
 * Public compound-component API for the shared modal.
 *
 * Import this named export instead of importing the internal files directly.
 *
 * @example
 * import { Modal } from '../components/Modal/index.js';
 *
 * <Modal
 *   open={isOpen}
 *   onClose={({ reason }) => setIsOpen(false)}
 *   title="도움말"
 * >
 *   <HelpContent />
 *   <Modal.Footer>
 *     <Modal.Button
 *       variant="secondary"
 *       onClick={() => setIsOpen(false)}
 *     >
 *       닫기
 *     </Modal.Button>
 *     <Modal.Button onClick={handleConfirm}>확인</Modal.Button>
 *   </Modal.Footer>
 * </Modal>
 */
const Modal = Object.assign(ModalRoot, {
  Button: ModalButton,
  Footer: ModalFooter,
});

export { Modal };
