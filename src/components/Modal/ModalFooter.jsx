/**
 * Action area for `Modal`.
 *
 * Place this component directly under `Modal`; do not wrap it in a Fragment or
 * another element. The Modal shell detects direct Footer children and renders
 * them outside its scrollable body so long content cannot overlap the actions.
 *
 * Buttons inside the Footer do not close the Modal automatically. Their click
 * handlers must update the parent's `open` state after any required work.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Usually one or more `Modal.Button` elements.
 * @param {string} [props.className=''] Optional layout overrides.
 */
function ModalFooter({ children, className = '' }) {
  return (
    <footer
      className={`flex shrink-0 gap-3 border-t border-[var(--border)] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 ${className}`}
    >
      {children}
    </footer>
  );
}

export default ModalFooter;
