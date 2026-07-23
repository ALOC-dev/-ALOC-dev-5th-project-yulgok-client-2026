import { forwardRef } from 'react';

const variantClasses = {
  primary: 'bg-brand-primary text-white hover:opacity-90',
  secondary: 'bg-ui-sub text-fg-basic hover:brightness-95',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

/**
 * Standard action button for `Modal.Footer`.
 *
 * Supported variants are `primary` (default), `secondary`, and `danger`.
 * This component forwards its ref for `initialFocusRef` usage. Clicking it does
 * not close the Modal automatically; the supplied `onClick` handler owns that
 * decision and should update the parent's `open` state when appropriate.
 *
 * All native button props are forwarded. The default `type` is `button` to
 * prevent accidental form submission.
 */
const ModalButton = forwardRef(function ModalButton(
  {
    variant = 'primary',
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const variantClass = variantClasses[variant] ?? variantClasses.primary;

  return (
    <button
      ref={ref}
      type={type}
      className={`min-h-12 flex-1 rounded-2xl px-4 py-3 font-sans text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      {...props}
    />
  );
});

export default ModalButton;
