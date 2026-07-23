# Common Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, accessible compound modal for image examples, help content, confirmations, and destructive actions.

**Architecture:** A controlled `Modal` renders through a body Portal and owns overlay, keyboard, focus, and scroll-lock behavior. Focused `ModalFooter` and `ModalButton` components own action layout and variants, and `index.js` attaches them as `Modal.Footer` and `Modal.Button`.

**Tech Stack:** React 19, React DOM Portal, Tailwind CSS 4, Vite 8, ESLint 10

## Global Constraints

- Do not migrate `PrivacyConsentModal` or the chat page's local dialogs in this change.
- Do not add a test framework; automated component tests remain separate scope.
- Support `small`, `medium`, `large`, and `full` modal sizes, with `medium` as the default.
- Support `primary`, `secondary`, and `danger` button variants.
- Overlay click, Escape, and the close button report `overlay`, `escape`, and `close-button` respectively.
- Overlay click and Escape closing default to enabled; the top-right close button defaults to visible.
- Nested modals are unsupported.

---

## File Map

- Create `src/components/Modal/ModalButton.jsx`: ref-forwarding action button with visual variants.
- Create `src/components/Modal/ModalFooter.jsx`: responsive action layout.
- Create `src/components/Modal/Modal.jsx`: Portal, semantics, close events, scroll lock, and focus management.
- Create `src/components/Modal/index.js`: stable compound-component export.
- Modify `src/index.css`: modal entry keyframes.

### Task 1: Modal action primitives

**Files:**
- Create: `src/components/Modal/ModalButton.jsx`
- Create: `src/components/Modal/ModalFooter.jsx`

**Interfaces:**
- Produces: `ModalButton({ variant = 'primary', className = '', type = 'button', ...props }, ref)`
- Produces: `ModalFooter({ children, className = '' })`
- Consumes: standard React button and children props

- [ ] **Step 1: Create the ref-forwarding button**

Create `src/components/Modal/ModalButton.jsx`:

```jsx
import { forwardRef } from 'react';

const variantClasses = {
  primary: 'bg-brand-primary text-white hover:opacity-90',
  secondary: 'bg-ui-sub text-fg-basic hover:brightness-95',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

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
```

- [ ] **Step 2: Create the action layout**

Create `src/components/Modal/ModalFooter.jsx`:

```jsx
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
```

- [ ] **Step 3: Run focused lint**

Run:

```bash
npx eslint src/components/Modal/ModalButton.jsx src/components/Modal/ModalFooter.jsx
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 4: Commit the action primitives**

```bash
git add src/components/Modal/ModalButton.jsx src/components/Modal/ModalFooter.jsx
git commit -m "feat: add modal action primitives"
```

### Task 2: Accessible modal shell and compound export

**Files:**
- Create: `src/components/Modal/Modal.jsx`
- Create: `src/components/Modal/index.js`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `ModalFooter` and `ModalButton` default exports from Task 1
- Produces: `Modal({ open, onClose, title, description, children, size = 'medium', closeOnOverlayClick = true, closeOnEscape = true, showCloseButton = true, initialFocusRef })`
- Produces: named `Modal` export with `Modal.Footer` and `Modal.Button`
- Calls: `onClose({ reason: 'overlay' | 'escape' | 'close-button' })`

- [ ] **Step 1: Implement the modal shell**

Create `src/components/Modal/Modal.jsx`:

```jsx
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

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
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
```

- [ ] **Step 2: Add the reduced-motion-safe entry keyframe**

Append to `src/index.css`:

```css
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

Also add `src/index.css` to this task's changed files. Tailwind's `motion-safe:` variant prevents the animation when the user requests reduced motion.

- [ ] **Step 3: Assemble the compound public API**

Create `src/components/Modal/index.js`:

```js
import ModalRoot from './Modal.jsx';
import ModalButton from './ModalButton.jsx';
import ModalFooter from './ModalFooter.jsx';

const Modal = Object.assign(ModalRoot, {
  Button: ModalButton,
  Footer: ModalFooter,
});

export { Modal };
```

- [ ] **Step 4: Run complete static verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit with code 0; Vite emits a production bundle under `dist`.

- [ ] **Step 5: Verify behavior in a temporary consumer**

Temporarily render the following from an existing development-only page or `App.jsx`, without committing the temporary consumer:

```jsx
const [open, setOpen] = useState(true);

<Modal
  open={open}
  onClose={({ reason }) => {
    console.log(reason);
    setOpen(false);
  }}
  title="기숙사 합격 화면 예시"
  description="아래와 같은 화면을 캡처해 주세요."
  size="large"
>
  <div className="min-h-64 rounded-xl bg-ui-sub p-4">이미지 영역</div>
  <Modal.Footer>
    <Modal.Button variant="secondary" onClick={() => setOpen(false)}>
      닫기
    </Modal.Button>
    <Modal.Button onClick={() => setOpen(false)}>확인</Modal.Button>
  </Modal.Footer>
</Modal>
```

Run `npm run dev`, then verify:

- overlay, Escape, and X log `overlay`, `escape`, and `close-button`
- clicking inside the dialog does not close it
- Tab and Shift+Tab remain inside the dialog
- body scrolling is locked while open and restored after close
- focus returns to the element that opened the modal
- content stays within the viewport on mobile and desktop widths

Remove only the temporary consumer edits with `apply_patch`, then rerun `npm run lint` and `npm run build`. Expected: both exit with code 0.

- [ ] **Step 6: Commit the accessible modal**

```bash
git add src/components/Modal/Modal.jsx src/components/Modal/index.js src/index.css
git commit -m "feat: add accessible common modal"
```

## Final Verification

- [ ] Run `git diff --check HEAD~2..HEAD`; expected: no whitespace errors.
- [ ] Run `npm run lint`; expected: exit code 0.
- [ ] Run `npm run build`; expected: exit code 0 and a successful Vite production build.
- [ ] Run `git status --short`; expected: no uncommitted files from this implementation.
