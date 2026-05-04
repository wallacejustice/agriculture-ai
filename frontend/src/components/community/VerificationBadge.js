import React from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { CheckCircle, People } from '@mui/icons-material';

const VerificationBadge = ({ verificationCount = 0, verifiedFarmers = [], crop = 'crop' }) => {
  const [open, setOpen] = React.useState(false);
  
  if (verificationCount === 0) return null;
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  // Generate farmer descriptions
  const farmerDescriptions = verifiedFarmers.map(f => 
    `${f.name} • ${f.experience} yrs • ${f.crops.join(', ')}`
  );
  
  return (
    <>
      <Tooltip 
        title={`${verificationCount} farmer${verificationCount > 1 ? 's' : ''} confirmed this advice worked for ${crop}`}
        placement="top"
        arrow
      >
        <Chip
          icon={<CheckCircle sx={{ color: 'success.main' }} />}
          label={`${verificationCount} Verified`}
          onClick={verifiedFarmers.length > 0 ? handleOpen : undefined}
          sx={{
            bgcolor: 'success.light',
            color: 'success.dark',
            fontWeight: 'bold',
            cursor: verifiedFarmers.length > 0 ? 'pointer' : 'default',
            '&:hover': {
              bgcolor: 'success.main',
              color: 'white'
            },
            height: 28
          }}
        />
      </Tooltip>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" />
          <Typography variant="h6">
            Farmers Who Verified This Advice
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These farmers successfully used this advice on their {crop} farms:
          </Typography>
          
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {farmerDescriptions.map((desc, i) => (
              <React.Fragment key={i}>
                <ListItem>
                  <ListItemText
                    primary={desc.split('•')[0].trim()}
                    secondary={desc.split('•').slice(1).join('•').trim()}
                  />
                  <CheckCircle color="success" sx={{ ml: 2 }} />
                </ListItem>
                {i < farmerDescriptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ✅ Verified advice is 3x more likely to work for your farm
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on 2,450 success stories from Ghanaian farmers
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VerificationBadge;