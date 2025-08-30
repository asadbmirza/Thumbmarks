import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Settings, AccountCircle, Add } from "@mui/icons-material";
import { Page } from '../types';

const Header = ({currentPage, onNavigate} : {currentPage: Page, onNavigate: (page: Page) => void}) => {
    return (
        <AppBar position="static" sx={{ boxShadow: 'none' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography 
                    variant="h6" 
                    component="h1" 
                    sx={{fontWeight: 700, cursor: 'pointer', color: 'primary.contrastText'}}
                    onClick={() => onNavigate('bookmarks')}
                >
                    Thumbmarks
                </Typography>
                <Box>
                    <IconButton sx={{color: "text.main"}}  onClick={() => onNavigate('profile')}>
                        <AccountCircle />
                    </IconButton>
                    <IconButton sx={{color: "text.main"}} onClick={() => onNavigate('settings')}>
                        <Settings />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;