


const navigate_to_bookmark = async (url: string, scrollX: number, scrollY: number) => {
  return new Promise<void>((resolve, reject) => {
    chrome.tabs.create({ url }, (tab) => {
      if (tab?.id) {
        // Wait for tab to finish loading
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (x, y) => window.scrollTo(x, y),
              args: [scrollX, scrollY]
            }, () => {
              if (chrome.runtime.lastError) {
                const error = chrome.runtime.lastError.message;
                console.error('Navigation failed:', error);
                reject(new Error(error));
              } else {
                resolve();
              }
            });
          }
        });
      }
    });
  });
};

export default navigate_to_bookmark;