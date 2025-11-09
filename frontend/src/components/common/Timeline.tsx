import React, { ReactNode, CSSProperties } from 'react';
import { styled } from '@mui/material/styles';

const StyledTimeline = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '6px 16px',
  flex: 1,
});

const StyledTimelineItem = styled('div')({
  display: 'flex',
  position: 'relative',
  minHeight: '70px',
  '&:last-child': {
    minHeight: 'auto',
  },
});

const StyledTimelineSeparator = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexShrink: 0,
});

const StyledTimelineConnector = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.grey[400],
  width: '1px',
  flexGrow: 1,
  margin: '8px 0',
}));

const StyledTimelineDot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' }>(
  ({ theme, color = 'primary' }) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: theme.palette[color].main,
    border: `2px solid ${theme.palette[color].main}`,
    flexShrink: 0,
    margin: '8px 0',
  })
);

const StyledTimelineContent = styled('div')({
  padding: '6px 16px',
  flex: 1,
  paddingBottom: '24px',
});

const StyledTimelineOppositeContent = styled('div')({
  flex: 0.2,
  padding: '6px 16px',
  textAlign: 'right',
  color: 'rgba(0, 0, 0, 0.6)',
  fontSize: '0.875rem',
});

interface TimelineProps {
  children: ReactNode;
  sx?: CSSProperties;
}

interface TimelineItemProps {
  children: ReactNode;
}

interface TimelineDotProps {
  children?: ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface TimelineOppositeContentProps {
  children: ReactNode;
  sx?: CSSProperties;
}

export const Timeline = ({ children, sx }: TimelineProps) => (
  <StyledTimeline style={sx}>
    {children}
  </StyledTimeline>
);

export const TimelineItem = ({ children }: TimelineItemProps) => (
  <StyledTimelineItem>
    {children}
  </StyledTimelineItem>
);

export const TimelineSeparator = ({ children }: { children: ReactNode }) => (
  <StyledTimelineSeparator>
    {children}
  </StyledTimelineSeparator>
);

export const TimelineConnector = () => <StyledTimelineConnector />;

export const TimelineContent = ({ children }: { children: ReactNode }) => (
  <StyledTimelineContent>
    {children}
  </StyledTimelineContent>
);

export const TimelineDot = ({ children, color = 'primary' }: TimelineDotProps) => (
  <StyledTimelineDot color={color}>
    {children}
  </StyledTimelineDot>
);

export const TimelineOppositeContent = ({ children, sx }: TimelineOppositeContentProps) => (
  <StyledTimelineOppositeContent style={sx}>
    {children}
  </StyledTimelineOppositeContent>
);

export const timelineOppositeContentClasses = {
  root: 'MuiTimelineOppositeContent-root',
};
