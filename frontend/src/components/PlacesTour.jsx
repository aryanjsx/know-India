import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const PlacesTour = () => {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if it's the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenPlacesTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const steps = [
    {
      target: '.india-map-container',
      content: 'Welcome to Know India! This interactive map allows you to explore different states and union territories of India. Click on any state to learn more about it.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.state-hover',
      content: 'Hover over any state to see its name. The state will highlight to show you can interact with it.',
      placement: 'bottom',
    },
    {
      target: '.search-filter',
      content: 'Use these filters to search for specific states or filter them by region.',
      placement: 'bottom',
    },
    {
      target: '.state-card',
      content: 'Click on any state card to view detailed information about that state, including its culture, history, and tourist attractions.',
      placement: 'left',
    },
    {
      target: '.theme-toggle',
      content: 'Toggle between light and dark mode for comfortable viewing.',
      placement: 'left',
    },
    {
      target: '.feedback-button',
      content: 'Share your feedback with us to help improve your experience!',
      placement: 'left',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Set the flag in localStorage so we don't show the tour again
      localStorage.setItem('hasSeenPlacesTour', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4F46E5',
          zIndex: 1000,
        },
        tooltip: {
          container: {
            textAlign: 'left',
          },
        },
        buttonNext: {
          backgroundColor: '#4F46E5',
        },
        buttonBack: {
          marginRight: 10,
        },
      }}
      locale={{
        last: "Got it!",
        skip: "Skip tour",
        next: "Next",
        back: "Back",
      }}
    />
  );
};

export default PlacesTour; 