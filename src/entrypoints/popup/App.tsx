import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { Box, Button, Card, CardContent } from '@mui/material';
import { BackgroundMessageType, Message } from '../shared/message_types';
import Header from './header/header';
import { Page } from './types';
import BookmarksPage from './pages/bookmarks';




function App() {
  const [page, setPage] = useState<Page>('bookmarks');

  const renderContent = () => {
    return (
      <>
        <Box sx={{ display: page === 'bookmarks' ? 'block' : 'none' }}>
          <BookmarksPage />
        </Box>
        {/* <Box sx={{ display: page === 'settings' ? 'block' : 'none' }}>
          <SettingsPage />
        </Box>
        <Box sx={{ display: page === 'profile' ? 'block' : 'none' }}>
          <ProfilePage />
        </Box> */}
      </>
    );
  };

  return (
    <Box sx={{ height: '100vh', 
      display: 'flex', 
      flexDirection: 'column' }}>
      <Header currentPage={page} onNavigate={(page: Page) => setPage(page)} />
      <Box sx={{ flex: 1,           // Takes remaining space after header
        paddingX: 2, 
        overflowY: 'auto',
        height: 0 }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;
