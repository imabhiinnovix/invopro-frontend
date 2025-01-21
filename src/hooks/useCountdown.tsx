import { useState, useEffect } from 'react';

const useCountdown = (initialTime: number) => {
  const [countdown, setCountdown] = useState(initialTime);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    let timer: number | undefined | any;

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else {
      setIsButtonDisabled(false);
    }

    return () => clearInterval(timer);
  }, [countdown]);

  const resetCountdown = () => {
    setCountdown(initialTime);
    setIsButtonDisabled(true);
  };

  return { countdown, isButtonDisabled, resetCountdown };
};

export default useCountdown;
