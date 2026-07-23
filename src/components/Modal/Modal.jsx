import { Children, isValidElement, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import ModalFooter from './ModalFooter.jsx';

const sizeClasses = {
  small: 'max-w-sm',
  medium: 'max-w-lg',
  large: 'max-w-3xl',
  full: 'max-w-none sm:max-w-5xl',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const sizeClass = sizeClasses[size] ?? sizeClasses.medium;
  const childArray = Children.toArray(children);
  const footerChildren = childArray.filter(
    (child) => isValidElement(child) && child.type === ModalFooter,
  );
  const bodyChildren = childArray.filter(
    (child) => !isValidElement(child) || child.type !== ModalFooter,
  );

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const preferredFocus = initialFocusRef?.current;
    const firstFocusable = dialog?.querySelector(focusableSelector);
    (preferredFocus ?? firstFocusable ?? dialog)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [initialFocusRef, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose({ reason: 'escape' });
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(focusableSelector) ?? [],
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, onClose, open]);

  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose({ reason: 'overlay' });
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={handleOverlayClick}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[28px] bg-white text-fg-basic shadow-2xl motion-safe:animate-[modal-enter_180ms_ease-out] ${sizeClass}`}
      >
        {(title || description || showCloseButton) && (
          <header className="relative shrink-0 px-5 pb-4 pt-6 sm:px-6">
            {title && (
              <h2 id={titleId} className="m-0 pr-10 text-xl font-bold text-fg-basic">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mb-0 mt-2 pr-10 text-sm text-fg-basic-muted">
                {description}
              </p>
            )}
            {showCloseButton && (
              <button
                type="button"
                aria-label="모달 닫기"
                className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full text-2xl leading-none text-fg-basic-muted hover:bg-ui-sub focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                onClick={() => onClose({ reason: 'close-button' })}
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
          {bodyChildren}
        </div>
        {footerChildren}
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
