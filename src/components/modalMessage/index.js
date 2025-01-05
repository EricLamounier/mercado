import { useEffect, useState } from "react";

import { Cross2Icon } from "@radix-ui/react-icons";

export default function ModalMessage({ isOpen = false, onClose }) {
  const [fadeOut, setFadeOut] = useState(false);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setFadeOut(true);
    const timer = setTimeout(() => {
      setFadeOut(false);
      //onClose(false);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <div style={{zIndex: '9'}} className={`modal ${fadeOut ? "fadeOut" : ""}`}>
      <div className={`modalContent ${fadeOut ? "scaleOut" : ""}`}>
        <div className="modalHeader">
            <p style={{fontSize: '16px'}}>Ocorreu um erro!</p>
            <Cross2Icon className="icon" onClick={handleCloseModal}/>
        </div>
        <div className="content">
            <p>erro msg</p>
        </div>
      </div>
    </div>
  );
};
