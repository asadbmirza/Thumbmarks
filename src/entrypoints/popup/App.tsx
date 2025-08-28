import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { Button } from '@mui/material';
import { BackgroundMessageType, Message } from '../shared/message_types';


function App() {

  const onCapture = async () => {
    try {
      await chrome.runtime.sendMessage<Message>({
        type: BackgroundMessageType.CaptureScreen,
      })
    } catch (error) {
      console.error("Failed to capture the page", error);
    }
    
  }

  const onDelete = async () => {
    try {
      await chrome.runtime.sendMessage<Message>({
        type: BackgroundMessageType.DeleteBookmark,
      })
    } catch (error) {
      console.error("Failed to delete the bookmark", error);
    }
  }

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>dfd + sds</h1>
      <div className="card">
        <Button onClick={onCapture}>Capture webpage</Button>
        <Button onClick={onDelete}>Delete Bookmark</Button>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
