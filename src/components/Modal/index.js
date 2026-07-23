import ModalRoot from './Modal.jsx';
import ModalButton from './ModalButton.jsx';
import ModalFooter from './ModalFooter.jsx';

const Modal = Object.assign(ModalRoot, {
  Button: ModalButton,
  Footer: ModalFooter,
});

export { Modal };
