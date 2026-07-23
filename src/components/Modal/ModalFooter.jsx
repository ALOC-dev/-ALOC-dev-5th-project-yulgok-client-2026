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
