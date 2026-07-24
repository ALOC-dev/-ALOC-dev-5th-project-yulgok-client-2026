import { useEffect, useState } from 'react';

function isValidProfileImageUrl(imageUrl) {
  if (!imageUrl || imageUrl === 'string') return false;

  try {
    const url = new URL(imageUrl, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function ProfileAvatar({ imageUrl, alt, className = '' }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (isValidProfileImageUrl(imageUrl) && !hasImageError) {
    return (
      <img
        className={className}
        src={imageUrl}
        alt={alt}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <span
      className={`${className} inline-flex items-center justify-center bg-ui-sub text-fg-basic-muted`}
      role="img"
      aria-label={alt}
    >
      <svg className="h-1/2 w-1/2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M4.5 20c.6-4.2 3.1-6.3 7.5-6.3s6.9 2.1 7.5 6.3" fill="currentColor" />
      </svg>
    </span>
  );
}

export default ProfileAvatar;
