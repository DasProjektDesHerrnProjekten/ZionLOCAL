// Analytics utility function that can be disabled in development
const trackEvent = async (eventName: string, data?: any) => {
  // Only track in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Event: ${eventName}`, data);
    return;
  }

  try {
    // Replace with your actual analytics endpoint when ready
    // await fetch('YOUR_ANALYTICS_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event: eventName, ...data })
    // });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export default trackEvent;
