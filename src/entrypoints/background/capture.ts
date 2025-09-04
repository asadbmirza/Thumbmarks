const capture_webpage = async () => {
  const captured = await chrome.tabs.captureVisibleTab();
  if (captured) {
    return captured;
  } 
  return;
};

export { capture_webpage };
