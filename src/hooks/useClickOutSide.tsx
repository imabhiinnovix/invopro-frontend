import { useEffect, useRef } from 'react';

type Callback = (event: MouseEvent) => void;

const useClickOutside = (callback: Callback) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const path = event.composedPath();
      if (ref.current && !path.includes(ref.current)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export default useClickOutside;
