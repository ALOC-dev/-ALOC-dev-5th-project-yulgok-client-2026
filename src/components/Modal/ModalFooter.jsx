function ModalFooter({ children, className = '' }) {
  return (
    <footer
      className={`sticky bottom-0 -mx-5 mt-5 flex gap-3 border-t border-[var(--border)] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-6 sm:px-6 ${className}`}
    >
      {children}
    </footer>
  );
}

export default ModalFooter;
