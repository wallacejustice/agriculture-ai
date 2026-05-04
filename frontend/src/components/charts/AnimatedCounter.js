import React, { useEffect, useRef } from 'react';
import { Typography } from '@mui/material';
import CountUp from 'react-countup';

const AnimatedCounter = ({ value, suffix = '', prefix = '', duration = 2 }) => {
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return (
    <Typography 
      variant="h3" 
      fontWeight="bold"
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
      }}
    >
      <CountUp
        start={prevValueRef.current}
        end={value}
        duration={duration}
        separator=","
        decimals={0}
        prefix={prefix}
        suffix={suffix}
      />
    </Typography>
  );
};

export default AnimatedCounter;
