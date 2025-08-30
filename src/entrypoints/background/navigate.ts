


const navigate_to_bookmark = (url: string, scrollX: number, scrollY: number) => {
  chrome.tabs.create({ url }, (tab) => {
      if (tab.id) {
        // Wait for tab to finish loading
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            
            chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              func: (x, y) => window.scrollTo(x, y),
              args: [scrollX, scrollY]
            });
          }
        });
      }
    });

};

export default navigate_to_bookmark;