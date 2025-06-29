import { ShowNotification } from "../shared/message_types";

const show_notification = ({ message, result, duration }: ShowNotification) => {
  let existingOverlay = document.getElementById("extension-message-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }
  const overlay = document.createElement("div");
  overlay.id = "extension-message-overlay";
  overlay.className = result;
  overlay.textContent = message;
  overlay.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        color: white !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        font-family: sans-serif !important;
        font-size: 16px !important;
        z-index: 2147483647 !important; /* Max z-index to ensure it's on top */
        opacity: 0;
        transition: opacity 0.5s ease-in-out !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
        pointer-events: none !important; /* Allow clicks to pass through */
    `;

  document.body.appendChild(overlay);
  console.log(overlay);
  console.log(overlay.parentElement);
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
  });

  setTimeout(() => {
    overlay.style.opacity = "0";
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true }
    );
  }, duration);
};

export { show_notification, ShowNotification };
