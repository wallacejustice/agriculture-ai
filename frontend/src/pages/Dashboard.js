import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
Box,
Container,
Typography,
Paper,
Grid, // ✅ Grid V2
Chip,
Avatar,
IconButton,
Menu,
MenuItem,
ListItemIcon,
ListItemText,
Divider,
Card,
CardActionArea,
LinearProgress,
CircularProgress,
Snackbar,
Alert,
Tooltip,
Skeleton,
Badge,
Button
} from '@mui/material';
import {
AccountCircle,
Logout,
Settings,
Chat,
Mic,
Analytics,
Language,
LocationOn,
Grain,
TrendingUp,
HelpOutline,
Edit,
ShowChart,
Verified,
Star,
EmojiEvents,
DarkMode,
LightMode,
Refresh,
Notifications,
Warning,
CheckCircle,
Info as InfoIcon,
ErrorOutline
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
ArcElement,
Title,
Tooltip as ChartTooltip,
Legend,
Filler
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// ✅ Register Chart Components
ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
ArcElement,
Title,
ChartTooltip,
Legend,
Filler
);

// ✅ API Base URL - Works on localhost AND production
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
const { user, logout } = useAuth();
const navigate = useNavigate();
const [anchorEl, setAnchorEl] = useState(null);
const [notificationAnchor, setNotificationAnchor] = useState(null);
const open = Boolean(anchorEl);
const notificationsOpen = Boolean(notificationAnchor);
const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
// ✅ State Management
const [stats, setStats] = useState({
conversations: 0,
questions: 0,
voiceUsage: '0%',
successRate: '95%'
});
const [notifications, setNotifications] = useState([]); // ✅ REAL NOTIFICATIONS STATE
const [statsLoading, setStatsLoading] = useState(true);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const [lastUpdated, setLastUpdated] = useState(new Date());
const [isScrolling, setIsScrolling] = useState(false);
const scrollContainerRef = useRef(null);
// ✅ Scroll Performance Handler
useEffect(() => {
let scrollTimer;
const handleScroll = () => {
setIsScrolling(true);
clearTimeout(scrollTimer);
scrollTimer = setTimeout(() => setIsScrolling(false), 150);
};
const container = scrollContainerRef.current;
if (container) {
container.addEventListener('scroll', handleScroll, { passive: true });
return () => container.removeEventListener('scroll', handleScroll);
}
}, []);
// ✅ Dark Mode System
useEffect(() => {
document.body.style.backgroundColor = darkMode ? '#0f0f0f' : '#f8fafc';
document.body.style.color = darkMode ? '#e6e6e6' : '#121212';
localStorage.setItem('darkMode', darkMode);
}, [darkMode]);
// ✅ Fetch Real Stats - FIXED: Check 401 BEFORE parsing JSON + use API_BASE
const fetchStats = useCallback(async (showRefresh = false) => {
try {
setStatsLoading(true);
const token = localStorage.getItem('token');
if (!token) {
setStatsLoading(false);
return;
}
const response = await fetch(`${API_BASE}/api/analytics/dashboard-stats`, {
headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
});

// ✅ FIX: Check HTTP status BEFORE parsing JSON (prevents "Missing data property" error)
if (response.status === 401) {
console.warn('⚠️ Token rejected - logging out user');
logout();
navigate('/login', { replace: true });
return;
}

const contentType = response.headers.get('content-type') || '';
if (!contentType.includes('application/json')) {
throw new Error(`Server returned HTML. Status: ${response.status}`);
}
const data = await response.json();
if (data.success && data.data) {
setStats({
conversations: data.data.conversations || 0,
questions: data.data.questions || 0,
voiceUsage: data.data.voiceUsage || '0%',
successRate: data.data.successRate || '95%'
});
setLastUpdated(new Date());
if (showRefresh) {
setSnackbar({
open: true,
message: `✅ Stats updated! (${data.data.conversations} conv, ${data.data.questions} questions)`,
severity: 'success'
});
}
} else {
// Only throw if it's a 200 response but missing expected structure
if (response.ok) {
throw new Error('Invalid API response: Missing "data" property');
}
}
} catch (error) {
console.error('❌ Stats fetch FAILED:', error);
// Don't show error for auth issues (handled by logout)
if (!error.message.includes('logging out')) {
setSnackbar({
open: true,
message: `Stats update failed: ${error.message.substring(0, 60)}`,
severity: 'error'
});
}
} finally {
setStatsLoading(false);
}
}, [logout, navigate]); // ✅ Added dependencies
// ✅ FETCH REAL NOTIFICATIONS - IMPROVED WITH DEBUG LOGGING + use API_BASE
const fetchNotifications = useCallback(async () => {
try {
const token = localStorage.getItem('token');
if (!token) {
// If no token (logged out), clear notifications
console.log('⚠️ No token found - clearing notifications');
setNotifications([]);
return;
}
console.log('📡 Fetching notifications...');
const response = await fetch(`${API_BASE}/api/user/notifications`, {
headers: { 
'Authorization': `Bearer ${token}`, 
'Content-Type': 'application/json' 
}
});

// ✅ FIX: Check HTTP status BEFORE parsing JSON
if (response.status === 401) {
console.warn('⚠️ Token rejected in notifications - logging out');
logout();
navigate('/login', { replace: true });
return;
}

console.log('📊 Response status:', response.status);
if (!response.ok) {
console.warn('❌ Notifications endpoint returned non-OK status:', response.status);
setNotifications([]);
return;
}
const data = await response.json();
console.log('📨 Notification data received:', data.notifications?.length || 0);
// ✅ Only update if API returns success AND notifications array
if (data.success && Array.isArray(data.notifications)) {
setNotifications(data.notifications);
console.log('✅ Notifications state updated successfully');
} else {
console.warn('⚠️ Invalid notification format, setting empty array');
setNotifications([]);
}
} catch (error) {
console.error('❌ Notification fetch FAILED:', error);
}
}, [logout, navigate]); // ✅ Added dependencies
// ✅ Auto-refresh on mount & interval
useEffect(() => {
if (user) {
console.log('🔍 Dashboard mounted - fetching stats and notifications');
fetchStats();
fetchNotifications();
const interval = setInterval(() => {
fetchStats();
fetchNotifications();
}, 30000);
return () => clearInterval(interval);
} else {
setStatsLoading(false);
}
}, [user, fetchStats, fetchNotifications]);
// ✅ Styles: PERFORMANCE OPTIMIZED GLASS
const cardStyle = useMemo(() => ({
bgcolor: darkMode ? 'rgba(35, 35, 35, 0.92)' : 'rgba(255, 255, 255, 0.98)',
border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
boxShadow: darkMode
? '0 4px 20px rgba(0, 0, 0, 0.35)'
: '0 4px 20px rgba(0, 0, 0, 0.08)',
borderRadius: 3,
color: darkMode ? '#e6e6e6' : 'inherit',
transform: 'translateZ(0)',
willChange: 'transform',
transition: 'box-shadow 0.2s ease'
}), [darkMode]);
const headerStyle = useMemo(() => ({
bgcolor: darkMode ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)',
backdropFilter: isScrolling ? 'none' : 'blur(12px)',
border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
boxShadow: darkMode
? '0 4px 24px rgba(0, 0, 0, 0.4)'
: '0 4px 24px rgba(0, 0, 0, 0.1)',
borderRadius: 3,
color: darkMode ? '#e0e0e0' : 'inherit'
}), [darkMode, isScrolling]);
const backgroundStyle = useMemo(() => ({
bgcolor: darkMode ? '#0a0a0a' : '#f5f7fa',
backgroundImage: darkMode
? 'linear-gradient(rgba(15, 15, 15, 0.7), rgba(15, 15, 15, 0.9)), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z")'
: 'linear-gradient(rgba(245, 247, 250, 0.9), rgba(245, 247, 250, 1))',
backgroundSize: 'cover'
}), [darkMode]);
const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
const handleMenuClose = () => setAnchorEl(null);
const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
const handleNotificationClose = () => setNotificationAnchor(null);
const handleLogout = () => { handleMenuClose(); logout(); navigate('/login'); };
const handleSettings = () => { handleMenuClose(); navigate('/settings'); };
if (!user) {
return (
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
<CircularProgress />
</Box>
);
}
// ✅ CHART DATA - FIXED SYNTAX + GREEN THEME
const languageData = {
labels: ['Pidgin', 'English', 'Twi', 'Yoruba'],
datasets: [{
data: [45, 35, 15, 5], // ✅ ADDED 'data:' PROPERTY
backgroundColor: ['#2e7d32', '#66bb6a', '#81c784', '#a5d6a7'], // ✅ GREEN COLORS
borderWidth: 0,
hoverOffset: 15
}]
};
const cropData = {
labels: ['Maize', 'Cassava', 'Yam', 'Rice'],
datasets: [{
label: 'Questions',
data: [24, 15, 8, 5], // ✅ FIXED: Was missing 'data:'
backgroundColor: '#2e7d32', // ✅ GREEN COLOR
borderRadius: 8,
borderSkipped: false,
borderWidth: 2,
borderColor: '#ffffff'
}]
};
const timelineData = {
labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
datasets: [{
label: 'Questions',
data: [5, 8, 12, 7, 10, 3, 2], // ✅ ADDED 'data:' PROPERTY
borderColor: '#2e7d32',
backgroundColor: 'rgba(46, 125, 50, 0.15)',
borderWidth: 3,
tension: 0.4,
fill: true,
pointRadius: 5,
pointHoverRadius: 8,
pointBackgroundColor: '#ffffff',
pointBorderColor: '#2e7d32',
pointBorderWidth: 2,
pointHoverBorderWidth: 3
}]
};
const doughnutOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { position: 'bottom' },
tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
},
cutout: '70%'
};
const barOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: { legend: { display: false } },
scales: {
y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
x: { grid: { display: false } }
}
};
const lineOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: { legend: { display: false } },
scales: {
y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
x: { grid: { display: false } }
}
};
const quickActions = [
{ title: 'Ask Question', icon: <HelpOutline />, color: '#2e7d32', gradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', onClick: () => navigate('/chat') },
{ title: 'Voice Assistant', icon: <Mic />, color: '#66bb6a', gradient: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)', onClick: () => navigate('/voice') },
{ title: 'Conversations', icon: <Chat />, color: '#81c784', gradient: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)', onClick: () => navigate('/conversations') },
{ title: 'Analytics', icon: <Analytics />, color: '#a5d6a7', gradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)', onClick: () => navigate('/analytics') }
];
const LANGUAGE_NAMES = {
en: 'English',
pcm: 'Nigerian Pidgin',
tw: 'Twi',
yo: 'Yoruba'
};
const statsCards = [
{
label: 'Conversations',
value: stats.conversations,
icon: <Chat />,
color: '#2e7d32',
gradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
onClick: () => navigate('/conversations'),
clickable: true,
description: 'Active farming discussions'
},
{
label: 'Questions',
value: stats.questions,
icon: <HelpOutline />,
color: '#66bb6a',
gradient: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)',
onClick: () => navigate('/conversations'),
clickable: true,
description: 'AI answered today'
},
{
label: 'Voice Usage',
value: stats.voiceUsage,
icon: <Mic />,
color: '#81c784',
gradient: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
clickable: false,
description: 'Farmers using voice'
},
{
label: 'Success Rate',
value: stats.successRate,
icon: <TrendingUp />,
color: '#a5d6a7',
gradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
clickable: false,
description: 'Satisfied farmers'
}
];
const StatsSkeleton = () => (
<Grid container spacing={2.5} sx={{ mb: 3 }}>
{[...Array(4)].map((_, i) => (
<Grid size={{ xs: 6, sm: 3 }} key={i}>
<Skeleton variant="rounded" height={130} sx={{ borderRadius: 3, bgcolor: darkMode ? 'rgba(50,50,50,0.3)' : 'rgba(0,0,0,0.03)' }} />
</Grid>
))}
</Grid>
);
return (
<Box sx={backgroundStyle}>
{/* ✅ HEADER */}
<Box sx={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 100, borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
<Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: { xs: 2, sm: 3 } }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
<Box sx={{
width: 44,
height: 44,
borderRadius: 2.5,
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
border: darkMode ? '1px solid rgba(46,125,50,0.4)' : '1px solid rgba(46,125,50,0.3)'
}}>
<Grain sx={{ fontSize: 26, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Box>
<Typography variant="h6" fontWeight="bold" sx={{
background: darkMode ? 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)' : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
fontSize: { xs: '1.1rem', sm: '1.2rem' }
}}>
AI-AgriPal
</Typography>
<Typography variant="caption" color={darkMode ? 'rgba(165,214,167,0.85)' : 'text.secondary'} sx={{ fontWeight: 500 }}>
Expert farming advice in your language
</Typography>
</Box>
</Box>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
<Tooltip title="Notifications">
<IconButton onClick={handleNotificationOpen} sx={{
color: darkMode ? '#81c784' : '#2e7d32',
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)',
'&:hover': {
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.18)',
transform: 'scale(1.05)'
},
transition: 'all 0.2s ease',
width: 44,
height: 44
}}>
<Badge 
  badgeContent={notifications.length > 0 ? notifications.length : null} // ✅ DYNAMIC COUNT
  color="error" 
  overlap="circular"
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
<Notifications />
</Badge>
</IconButton>
</Tooltip>
<Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
<IconButton onClick={() => setDarkMode(!darkMode)} sx={{
color: darkMode ? '#81c784' : '#2e7d32',
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)',
'&:hover': { bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.18)' },
transition: 'all 0.2s ease',
width: 44,
height: 44
}}>
{darkMode ? <LightMode /> : <DarkMode />}
</IconButton>
</Tooltip>
<IconButton onClick={handleMenuOpen} sx={{
width: 48,
height: 48,
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.12)',
'&:hover': {
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.22)',
transform: 'scale(1.08)'
},
transition: 'all 0.2s ease',
boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)'
}}>
<Avatar sx={{
width: 40,
height: 40,
bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
color: 'white',
fontWeight: 'bold',
fontSize: '1.1rem'
}}>
{user.name.charAt(0).toUpperCase()}
</Avatar>
</IconButton>
</Box>
</Container>
</Box>
{/* ✅ NOTIFICATION MENU - ENHANCED FOR BETTER READABILITY */}
<Menu
anchorEl={notificationAnchor}
open={notificationsOpen}
onClose={handleNotificationClose}
anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
transformOrigin={{ vertical: 'top', horizontal: 'right' }}
PaperProps={{
sx: {
mt: 1.5,
borderRadius: 3,
boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
minWidth: 350, // Slightly wider for better readability
maxWidth: 500,
bgcolor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'white',
border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
color: darkMode ? '#e0e0e0' : 'inherit',
maxHeight: '60vh', // Use viewport height instead of fixed pixels
overflowY: 'auto'
}
}}
>
<Box sx={{ px: 2.5, py: 2, borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid divider' }}>
<Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
<Notifications sx={{ fontSize: 24, color: '#2e7d32' }} /> Notifications
</Typography>
<Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ mt: 0.5 }}>
{notifications.length > 0 ? `${notifications.length} updates` : "No new notifications"}
</Typography>
</Box>
{notifications.length === 0 ? (
<Box sx={{ p: 4, textAlign: 'center' }}>
<InfoIcon sx={{ fontSize: 40, color: darkMode ? '#475569' : '#cbd5e1', opacity: 0.5 }} />
<Typography variant="body1" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} sx={{ mt: 1 }}>
No new notifications
</Typography>
<Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.5)' : 'text.secondary'} sx={{ mt: 1, display: 'block' }}>
Check back later for updates
</Typography>
</Box>
) : (
notifications.map((notification) => (
<MenuItem key={notification.id} sx={{
py: 2, // Increased padding for better readability
px: 2.5,
minHeight: 64, // Ensure minimum height
borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
'&:hover': {
bgcolor: darkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)'
}
}}>
<ListItemIcon sx={{ mr: 2, minWidth: 40 }}>
{notification.type === 'success' && <CheckCircle sx={{ color: 'success.main' }} />}
{notification.type === 'warning' && <Warning sx={{ color: 'warning.main' }} />}
{notification.type === 'info' && <InfoIcon sx={{ color: 'info.main' }} />}
</ListItemIcon>
<Box sx={{ flex: 1, overflow: 'hidden' }}>
<Typography 
  variant="body2" 
  fontWeight="500" 
  sx={{ 
    lineHeight: 1.5,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    maxHeight: '80px', // Limit height for very long messages
    overflowY: 'auto'
  }}
>
{notification.message}
</Typography>
<Typography 
  variant="caption" 
  color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} 
  sx={{ display: 'block', mt: 1 }}
>
{notification.time}
</Typography>
</Box>
</MenuItem>
))
)}
<Box sx={{ p: 1.5, textAlign: 'center', borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid divider' }}>
<Button size="small" sx={{ fontWeight: 'bold', color: darkMode ? '#81c784' : '#1b5e20', textTransform: 'none' }}>View All Notifications</Button>
</Box>
</Menu>
{/* ✅ USER MENU */}
<Menu
anchorEl={anchorEl}
open={open}
onClose={handleMenuClose}
anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
transformOrigin={{ vertical: 'top', horizontal: 'right' }}
PaperProps={{
sx: {
mt: 1.5,
borderRadius: 3,
boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
minWidth: 240,
bgcolor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'white',
border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
color: darkMode ? '#e0e0e0' : 'inherit'
}
}}
>
<Box sx={{ px: 3, py: 2 }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
<Avatar sx={{ width: 48, height: 48, bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white' }}>
{user.name.charAt(0).toUpperCase()}
</Avatar>
<Box>
<Typography variant="subtitle1" fontWeight="bold" sx={{ color: darkMode ? '#fff' : 'text.primary' }}>{user.name}</Typography>
<Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: darkMode ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>
<Verified sx={{ fontSize: 14, color: 'success.main' }} /> Verified Farmer
</Typography>
</Box>
</Box>
<Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider' }} />
<MenuItem onClick={handleSettings} sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: darkMode ? 'rgba(46,125,50,0.2)' : 'action.hover' } }}>
<ListItemIcon><Settings fontSize="small" sx={{ color: '#2e7d32' }} /></ListItemIcon>
<ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500 }} />
</MenuItem>
<MenuItem onClick={handleLogout} sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: darkMode ? 'rgba(244, 67, 54, 0.15)' : 'error.light' } }}>
<ListItemIcon><Logout fontSize="small" sx={{ color: darkMode ? '#ff5252' : 'error.main' }} /></ListItemIcon>
<ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
</MenuItem>
</Box>
</Menu>
{/* ✅ MAIN CONTENT SCROLL AREA */}
<Box ref={scrollContainerRef} sx={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'layout style paint' }}>
<Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
<Grid container spacing={3}>
{/* LEFT COLUMN */}
<Grid size={{ xs: 12, lg: 8 }}>
{/* Welcome Card */}
<Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4, md: 5 }, mb: 3, position: 'relative', overflow: 'hidden' }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
<Avatar sx={{
width: { xs: 64, sm: 80 },
height: { xs: 64, sm: 80 },
bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
color: 'white',
fontSize: { xs: 28, sm: 36 },
fontWeight: 'bold',
boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)'
}}>
{user.name.charAt(0).toUpperCase()}
</Avatar>
<Box>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
<Typography variant="h3" fontWeight="bold" sx={{
fontSize: { xs: '1.8rem', sm: '2.2rem' },
background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
lineHeight: 1.2
}}>
Welcome back, {user.name}!
</Typography>
<EmojiEvents sx={{ fontSize: 28, color: '#FFD700' }} />
</Box>
<Typography variant="h6" color={darkMode ? 'rgba(255,255,255,0.85)' : 'text.secondary'} sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, maxWidth: 600, lineHeight: 1.6 }}>
Ready for expert farming advice? Ask questions or use voice input for instant AI guidance!
</Typography>
</Box>
</Box>
</Paper>
{/* Stats Cards */}
{statsLoading ? (
<StatsSkeleton />
) : (
<Grid container spacing={2.5} sx={{ mb: 3 }}>
{statsCards.map((stat, i) => (
<Grid size={{ xs: 6, sm: 3 }} key={i}>
<Card sx={{
...cardStyle,
borderRadius: 3,
transition: 'all 0.25s ease',
'&:hover': stat.clickable ? {
transform: 'translateY(-4px)',
boxShadow: darkMode ? '0 8px 32px rgba(0, 20, 10, 0.5)' : '0 8px 32px rgba(0, 50, 20, 0.15)',
bgcolor: darkMode ? 'rgba(40, 50, 45, 0.95)' : 'rgba(255, 255, 255, 1)'
} : {},
height: '100%',
border: stat.clickable ? `2px solid ${stat.color}30` : 'none',
position: 'relative',
overflow: 'hidden'
}}>
<CardActionArea onClick={stat.onClick} disabled={!stat.clickable} sx={{ p: 2.5, minHeight: 120, cursor: stat.clickable ? 'pointer' : 'default' }}>
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<Box>
<Typography variant="h3" fontWeight="bold" sx={{
background: stat.gradient,
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
fontSize: { xs: '1.8rem', sm: '2rem' },
lineHeight: 1.1
}}>{stat.value}</Typography>
<Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.5, display: 'block' }}>
{stat.label}
{stat.clickable && <Typography component="span" variant="caption" sx={{ ml: 0.5, color: stat.color, fontWeight: 'bold' }}>→</Typography>}
</Typography>
<Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.7rem', lineHeight: 1.4 }}>
{stat.description}
</Typography>
</Box>
<Box sx={{ width: 52, height: 52, borderRadius: '16px', bgcolor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${stat.color}25` }}>
{React.cloneElement(stat.icon, { sx: { fontSize: 28, color: stat.color } })}
</Box>
</Box>
</CardActionArea>
</Card>
</Grid>
))}
</Grid>
)}
{/* Quick Actions */}
<Paper sx={{ ...cardStyle, p: 3, mb: 3, borderRadius: 3 }}>
<Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
<Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<LightningBoltIcon sx={{ fontSize: 20, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem', color: darkMode ? '#a5d6a7' : '#1b5e20' }}>
📊 Farming Insights
</Typography>
</Box>
<Grid container spacing={2}>
{quickActions.map((action, i) => (
<Grid size={{ xs: 6, sm: 3 }} key={i}>
<Card sx={{
...cardStyle,
borderRadius: 2.5,
transition: 'all 0.2s ease',
'&:hover': {
transform: 'translateY(-3px)',
boxShadow: darkMode ? '0 6px 20px rgba(0, 20, 10, 0.4)' : '0 6px 20px rgba(0, 50, 20, 0.12)',
bgcolor: darkMode ? 'rgba(40, 50, 45, 0.95)' : 'rgba(255, 255, 255, 1)'
},
height: '100%',
background: action.gradient,
border: `1px solid ${action.color}40`,
color: 'white'
}}>
<CardActionArea onClick={action.onClick} sx={{ p: 2, minHeight: 120 }}>
<Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, border: '2px solid rgba(255, 255, 255, 0.4)' }}>
{React.cloneElement(action.icon, { sx: { color: 'white', fontSize: 32 } })}
</Box>
<Typography variant="subtitle2" fontWeight="bold" align="center" sx={{ fontSize: '0.85rem', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
{action.title}
</Typography>
</CardActionArea>
</Card>
</Grid>
))}
</Grid>
</Paper>
{/* Charts Section */}
<Paper sx={{ ...cardStyle, p: 3, borderRadius: 3 }}>
<Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
<Analytics sx={{ fontSize: 26, color: darkMode ? '#81c784' : '#2e7d32' }} />
<Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem', color: darkMode ? '#a5d6a7' : '#1b5e20' }}>
📊 Farming Analytics
</Typography>
</Box>
<Chip label="Live" size="small" icon={<Star sx={{ fontSize: 14 }} />} sx={{ bgcolor: darkMode ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.15)', color: darkMode ? '#a5d6a7' : '#2e7d32', fontWeight: 'bold', height: 26 }} />
</Box>
<Grid container spacing={2.5}>
<Grid size={{ xs: 12, md: 4 }}>
<Paper sx={{ ...cardStyle, p: 2, borderRadius: 2, height: '100%' }}>
<Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
<Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<Language sx={{ fontSize: 16, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem', color: darkMode ? '#a5d6a7' : '#2e7d32' }}>
Language Usage
</Typography>
</Box>
<Box sx={{ height: 200, position: 'relative' }}>
<Doughnut data={languageData} options={doughnutOptions} />
</Box>
</Paper>
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
<Paper sx={{ ...cardStyle, p: 2, borderRadius: 2, height: '100%' }}>
<Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
<Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<Grain sx={{ fontSize: 16, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem', color: darkMode ? '#a5d6a7' : '#2e7d32' }}>
Top Crops
</Typography>
</Box>
<Box sx={{ height: 200, position: 'relative' }}>
<Bar data={cropData} options={barOptions} />
</Box>
</Paper>
</Grid>
<Grid size={{ xs: 12, md: 4 }}>
<Paper sx={{ ...cardStyle, p: 2, borderRadius: 2, height: '100%' }}>
<Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
<Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<ShowChart sx={{ fontSize: 16, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem', color: darkMode ? '#a5d6a7' : '#2e7d32' }}>
Activity (7 Days)
</Typography>
</Box>
<Box sx={{ height: 200, position: 'relative' }}>
<Line data={timelineData} options={lineOptions} />
</Box>
</Paper>
</Grid>
</Grid>
<Box sx={{ mt: 2.5, textAlign: 'center', pt: 2, borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid divider' }}>
<Button variant="outlined" startIcon={<Analytics />} onClick={() => navigate('/analytics')} sx={{ borderColor: darkMode ? 'rgba(46,125,50,0.4)' : '#2e7d32', color: darkMode ? '#81c784' : '#1b5e20', fontWeight: 'bold', px: 3.5, py: 1, '&:hover': { bgcolor: darkMode ? 'rgba(46,125,50,0.1)' : 'rgba(46,125,50,0.05)', borderColor: '#2e7d32' } }}>
View Detailed Analytics
</Button>
</Box>
</Paper>
</Grid>
{/* RIGHT COLUMN */}
<Grid size={{ xs: 12, lg: 4 }}>
{/* Profile Card */}
<Paper sx={{ ...cardStyle, p: 3.5, borderRadius: 3, mb: 3 }}>
<Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
<Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<AccountCircle sx={{ fontSize: 20, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem', color: darkMode ? '#a5d6a7' : '#1b5e20' }}>
User Profile
</Typography>
</Box>
<IconButton size="small" onClick={() => navigate('/settings')} sx={{ color: darkMode ? '#81c784' : '#2e7d32' }}>
<Edit fontSize="small" />
</IconButton>
</Box>
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 2.5, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)', borderRadius: 2, border: darkMode ? '1px solid rgba(46,125,50,0.3)' : '1px solid rgba(46,125,50,0.2)' }}>
<Avatar sx={{ width: 72, height: 72, bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', fontSize: '2.2rem', fontWeight: 'bold', boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)' }}>
{user.name.charAt(0).toUpperCase()}
</Avatar>
<Box sx={{ textAlign: 'center' }}>
<Typography variant="h6" fontWeight="bold" sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.15rem' }}>
{user.name}
</Typography>
<Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5, color: darkMode ? 'rgba(165,214,167,0.9)' : 'text.secondary' }}>
<Verified sx={{ fontSize: 13, color: 'success.main' }} /> Verified Farmer
</Typography>
</Box>
</Box>
<PremiumInfoRow label="Full Name" value={user.name} icon={<AccountCircle />} color="#2e7d32" darkMode={darkMode} />
<PremiumInfoRow label="Email" value={user.email} icon={<Language />} color="#f093fb" darkMode={darkMode} />
<PremiumInfoRow label="Language" value={<Chip label={LANGUAGE_NAMES[user.preferredLanguage] || user.preferredLanguage} size="small" sx={{ bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', fontWeight: 'bold', height: 26, fontSize: '0.75rem' }} />} icon={<Language />} color="#4facfe" darkMode={darkMode} />
{user.region && <PremiumInfoRow label="Region" value={user.region} icon={<LocationOn />} color="#43e97b" darkMode={darkMode} />}
<Box sx={{ mt: 1.5, pt: 1.5, borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid divider' }}>
<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
<Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontWeight: 500 }}>Profile Completion</Typography>
<Typography variant="caption" fontWeight="bold" sx={{ color: darkMode ? '#81c784' : '#2e7d32' }}>85%</Typography>
</Box>
<LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3, bgcolor: darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: 'linear-gradient(90deg, #2e7d32, #1b5e20)', borderRadius: 3, boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)' } }} />
</Box>
</Box>
</Paper>
{/* CTA Card */}
<Paper sx={{ ...cardStyle, p: 3.5, borderRadius: 3, height: '100%' }}>
<Box sx={{ width: 80, height: 80, borderRadius: '20px', bgcolor: darkMode ? 'rgba(46, 125, 50, 0.35)' : 'rgba(46, 125, 50, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, mx: 'auto', border: darkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 8px 24px rgba(46, 125, 50, 0.25)' }}>
<Analytics sx={{ fontSize: 48, color: darkMode ? '#81c784' : '#2e7d32' }} />
</Box>
<Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 1.5, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.4rem', textAlign: 'center' }}>
Premium Analytics
</Typography>
<Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.6, textAlign: 'center', color: darkMode ? 'rgba(255,255,255,0.85)' : 'text.secondary', px: 2 }}>
Real-time insights on language usage, crop trends, and engagement patterns. Powered by AI for Agriculture.
</Typography>
<Chip label="Live Data" size="medium" icon={<Star sx={{ fontSize: 16 }} />} sx={{ bgcolor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', fontWeight: 'bold', height: 32, fontSize: '0.85rem', mx: 'auto', display: 'block', boxShadow: '0 4px 16px rgba(46, 125, 50, 0.35)' }} />
<Box sx={{ mt: 2.5, width: '100%' }}>
<Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', textAlign: 'center' }}>Your Stats Summary</Typography>
<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
<StatChip label="Convos" value={stats.conversations} color="#2e7d32" />
<StatChip label="Questions" value={stats.questions} color="#f093fb" />
<StatChip label="Voice" value={stats.voiceUsage} color="#4facfe" />
<StatChip label="Success" value={stats.successRate} color="#43e97b" />
</Box>
</Box>
</Paper>
</Grid>
</Grid>
</Container>
</Box>
{/* FOOTER */}
<Box sx={{ mt: 6, pt: 3, borderTop: darkMode ? '1px solid rgba(46,125,50,0.3)' : '1px solid rgba(46,125,50,0.25)', textAlign: 'center' }}>
<Typography variant="caption" color={darkMode ? 'rgba(165,214,167,0.9)' : 'rgba(85,139,47,0.9)'} sx={{ fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
© 2024 AI for Agriculture • Crafted by Wallace Justice in Accra 🇬🇭
</Typography>
</Box>
<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
<Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', bgcolor: darkMode ? 'rgba(30,30,30,0.95)' : 'white', color: darkMode ? '#e0e0e0' : 'inherit', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
{snackbar.message}
</Alert>
</Snackbar>
</Box>
);
};
// ✅ PREMIUM INFO ROW COMPONENT
const PremiumInfoRow = ({ label, value, icon, color, darkMode }) => (
<Box sx={{
display: 'flex',
alignItems: 'flex-start',
gap: 1.5,
py: 1.2,
px: 1.5,
borderRadius: 1.5,
bgcolor: darkMode ? 'rgba(40, 50, 45, 0.6)' : 'rgba(0, 0, 0, 0.02)',
transition: 'all 0.2s ease',
'&:hover': { bgcolor: darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.08)' }
}}>
<Box sx={{
width: 36,
height: 36,
borderRadius: 1.5,
bgcolor: darkMode ? `${color}15` : `${color}08`,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
flexShrink: 0,
border: darkMode ? `1px solid ${color}30` : `1px solid ${color}15`
}}>
{React.cloneElement(icon, { sx: { fontSize: 18, color: color } })}
</Box>
<Box sx={{ flex: 1 }}>
<Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
{label}
</Typography>
{React.isValidElement(value) ? value : (
<Typography variant="body2" fontWeight="500" sx={{ color: darkMode ? '#e6e6e6' : 'text.primary', fontSize: '0.9rem', lineHeight: 1.5 }}>
{value}
</Typography>
)}
</Box>
</Box>
);
// ✅ STAT CHIP COMPONENT
const StatChip = ({ label, value, color }) => (
<Box sx={{
p: 1,
borderRadius: 1.5,
bgcolor: 'rgba(0,0,0,0.03)',
textAlign: 'center',
border: '1px solid rgba(0,0,0,0.05)'
}}>
<Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5, fontSize: '0.65rem', fontWeight: 500 }}>
{label}
</Typography>
<Typography variant="h6" fontWeight="bold" sx={{ color: color, fontSize: '1.1rem' }}>
{value}
</Typography>
</Box>
);
// ✅ LIGHTNING BOLT ICON
const LightningBoltIcon = (props) => (
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
</svg>
);
export default Dashboard;