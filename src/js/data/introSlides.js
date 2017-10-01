module.exports = [
  {
    title: 'Search Interest',
    highlights: ['Search interest'],
    copy: [
      'This is your usual Google Trends chart. Search interest is measured from 0 (no interest) to 100 (popularity peak) for a given term.',
      'We can see that the swine flu epidemics spiked in 2009, but it’s hard to tell from this view whether there’s any seasonality in the data.',
    ]
  },
  {
    title: 'A Yearly Pattern',
    highlights: ['“typical” yearly cycle'],
    copy: [
      'Zooming into each year, we can see that the interest is generally lower in the middle of the year than it is in the first and final months.',
      'However, the values vary quite a bit from one year to another, with 2009 being an obvious outlier.',
      'How can we find the “typical” yearly cycle for the flu? Let’s step back to our 12-year chart.',
    ]
  },
  {
    title: 'Trend versus Total',
    highlights: ['variation independent of the spikes.'],
    copy: [
      'First, let’s draw what seems to be the variation independent of the spikes. This gives us the trend over time. The difference between these two lines is what we’ll use to determine the yearly cycle.',
    ]
  },
  {
    title: 'Total Minus Trend',
    highlights: ['relative to the trend line'],
    copy: [
      'This is what we get by plotting the difference between the trend and total. You’ll notice that some of the values in our scale are negative. That’s because they are relative to the trend line, not to the actual search interest.',
    ]
  },
  {
    title: 'Seasonal Interest',
    highlights: ['seasonal interest per year'],
    copy: [
      'Combining all the seasonal data from multiple years into a single cycle, we can determine the seasonal interest per year for the flu.',
    ]
  },
];
