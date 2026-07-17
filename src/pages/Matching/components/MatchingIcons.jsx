const commonProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
};

export function CloseIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FilledHeartIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M12 20.2 4.4 13A5.1 5.1 0 0 1 11.6 5.8l.4.4.4-.4A5.1 5.1 0 1 1 19.6 13L12 20.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MatchingChatIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8 8 0 0 1-3.6-.8L4 20l1.5-4a7 7 0 0 1-1-4.5A7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon(props) {
  return (
    <svg {...commonProps} {...props}>
      <path
        d="M19 8a7.2 7.2 0 1 0 .2 7.6M19 4v4h-4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
