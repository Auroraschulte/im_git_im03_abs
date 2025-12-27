 document.addEventListener('DOMContentLoaded', function () {
  // --- CONFIG: days & locations ------------------------------------------------
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const germanDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  const locations = [
        { id: 'kapellbrücke', name: 'Kapellbrücke', shortName: 'Kapellbrücke' },
        { id: 'rathausquai', name: 'Rathausquai', shortName: 'Rathausquai' },
        { id: 'löwendenkmal', name: 'Löwendenkmal', shortName: 'Löwendenkmal' },
        { id: 'schwanenplatz', name: 'Schwanenplatz', shortName: 'Schwanenplatz' },
        
        { id: 'hertensteinstrasse', name: 'Hertensteinstrasse', shortName: 'Hertensteinstrasse' }
    ];

    // thresholds for crowd level
  const QUIET_THRESHOLD = 40;
  const MODERATE_THRESHOLD = 90;
        
     const slider = document.getElementById('day-slider');
     const selectedDayElement = document.getElementById('selected-day');
     const dayMarkersContainer = document.getElementById('day-markers');
     const comparisonChartContainer = document.getElementById('comparison-chart');
     const comparisonDayElement = document.getElementById('comparison-day');
     const visitorCountElement = document.getElementById('visitor-count');
     const crowdStatusElement = document.getElementById('crowd-status');
     const recommendationElement = document.getElementById('recommendation');
     const recommendationBox = document.getElementById('recommendation-box'); // for detailed text (optional)

     let selectedDayIndex = 0;   // 0 = Monday
     let visitorData = {};       // weekly averages per location/day
     let hourlyStats = null;     // detailed hour stats from API
      
     async function getWeeklyAverages() {
    try {
      const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
      const data = await response.json();

      // sort newest first
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // filter last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const last30DaysData = data.filter(entry => new Date(entry.timestamp) >= thirtyDaysAgo);
     
     // also build hourly stats for recommendations
      hourlyStats = buildHourlyStats(last30DaysData);

      // group by location + weekday
      const averages = {};
      last30DaysData.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dayOfWeek = date.getDay();  // 0 = Sunday ... 6 = Saturday
        const standort = entry.standort;

        if (!averages[standort]) {
          averages[standort] = {
            0: { sum: 0, count: 0 },
            1: { sum: 0, count: 0 },
            2: { sum: 0, count: 0 },
            3: { sum: 0, count: 0 },
            4: { sum: 0, count: 0 },
            5: { sum: 0, count: 0 },
            6: { sum: 0, count: 0 }
          };
        }

        averages[standort][dayOfWeek].sum += entry.passanten;
        averages[standort][dayOfWeek].count++;
      });

      // convert to object with German day names
      const result = {};
      Object.keys(averages).forEach(standort => {
        result[standort] = {};
        for (let d = 0; d < 7; d++) {
          const dayData = averages[standort][d];
          const germanName = germanDayNames[d];
          result[standort][germanName] =
            dayData.count > 0 ? Math.round(dayData.sum / dayData.count) : 0;
        }
      });

      return result;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  // build { locationId: { hour: [counts...] } }
  function buildHourlyStats(entries) {
    const stats = {};
    entries.forEach(entry => {
      const id = mapStandortToId(entry.standort);
      if (!id) return;

      const date = new Date(entry.timestamp);
      const hour = date.getHours();

      if (!stats[id]) stats[id] = {};
      if (!stats[id][hour]) stats[id][hour] = [];
      stats[id][hour].push(entry.passanten);
    });
    return stats;
  }

  // convert weekly averages with German day names into UI structure (English days, index 0–6)
  function convertToUIData(weeklyAverages) {
    const uiData = {};
    const dayNameMap = {
      'Sonntag': 'Sunday',
      'Montag': 'Monday',
      'Dienstag': 'Tuesday',
      'Mittwoch': 'Wednesday',
      'Donnerstag': 'Thursday',
      'Freitag': 'Friday',
      'Samstag': 'Saturday'
    };

    // prepare structure for all locations
    locations.forEach(location => {
      uiData[location.id] = {
        name: location.name,
        days: Array(7).fill().map((_, index) => ({
          day: dayNames[index], // Monday ... Sunday
          visitors: 0
        }))
      };
    });

    // fill with data
    Object.keys(weeklyAverages).forEach(standort => {
      const locationId = mapStandortToId(standort);
      if (!locationId || !uiData[locationId]) return;

      Object.keys(weeklyAverages[standort]).forEach(germanDay => {
        const english = dayNameMap[germanDay];
        const dayIndex = dayNames.indexOf(english);
        if (dayIndex !== -1) {
          uiData[locationId].days[dayIndex].visitors = weeklyAverages[standort][germanDay];
        }
      });
    });

    return uiData;
  }

  // map API "standort" names to internal ids
  function mapStandortToId(standort) {
    const mapping = {
      'kapellbrücke': 'kapellbrücke',
      'rathausquai': 'rathausquai',
      'löwendenkmal': 'löwendenkmal',
      'schwanenplatz': 'schwanenplatz',
      'hertensteinstrasse': 'hertensteinstrasse'
    };
    return mapping[standort.toLowerCase()] || null;
  }

  // --- UI INITIALISATION: slider + day markers --------------------------------

  // create day markers under the slider
  dayNames.forEach((day, index) => {
    const marker = document.createElement('div');
    marker.className = 'day-marker';
    if (index === 0) marker.classList.add('active');
    marker.textContent = day.substring(0, 3); // Mon, Tue, ...
    marker.dataset.index = index;

    marker.addEventListener('click', () => {
      selectedDayIndex = index;
      slider.value = index;
      updateDayDisplay();
    });

    dayMarkersContainer.appendChild(marker);
  });

  // configure slider
  slider.min = 0;
  slider.max = 6;
  slider.step = 1;
  slider.value = 0;

  slider.addEventListener('input', function () {
    selectedDayIndex = parseInt(this.value, 10);
    updateDayDisplay();
  });

  // --- UPDATE FUNCTIONS -------------------------------------------------------

  function updateDayDisplay() {
    const dayName = dayNames[selectedDayIndex];
    selectedDayElement.textContent = dayName;
    if (comparisonDayElement) {
      comparisonDayElement.textContent = dayName;
    }

    document.querySelectorAll('.day-marker').forEach((marker, index) => {
      marker.classList.toggle('active', index === selectedDayIndex);
    });

    updateVisitorStats();
    updateComparisonChart();
  }

  function updateVisitorStats() {
    const locationData = visitorData['kapellbrücke'];
    if (!locationData) return;

    const dayData = locationData.days[selectedDayIndex];
    const visitorCount = dayData.visitors;

    visitorCountElement.textContent = visitorCount;

    let status, statusClass, recommendation;
    if (visitorCount < QUIET_THRESHOLD) {
      status = 'Quiet';
      statusClass = 'status-quiet';
      recommendation = 'Great moment to visit.';
    } else if (visitorCount < MODERATE_THRESHOLD) {
      status = 'Moderate';
      statusClass = 'status-moderate';
      recommendation = 'Okay, but expect some crowding.';
    } else {
      status = 'Busy';
      statusClass = 'status-busy';
      recommendation = 'If possible, pick another day.';
    }

    crowdStatusElement.textContent = status;
    crowdStatusElement.className = `stat-value ${statusClass}`;
    recommendationElement.textContent = recommendation;
  }

  function updateComparisonChart() {
    comparisonChartContainer.innerHTML = '';

    if (Object.keys(visitorData).length === 0) {
      comparisonChartContainer.innerHTML = '<div class="loading">Loading data…</div>';
      return;
    }

    locations.forEach(location => {
      const locationData = visitorData[location.id];
      if (!locationData) return;

      const dayData = locationData.days[selectedDayIndex];
      const visitorCount = dayData.visitors;

      let colorClass;
      if (visitorCount < QUIET_THRESHOLD) {
        colorClass = 'location-bar-quiet';
      } else if (visitorCount < MODERATE_THRESHOLD) {
        colorClass = 'location-bar-moderate';
      } else {
        colorClass = 'location-bar-busy';
      }

      const barContainer = document.createElement('div');
      barContainer.className = 'location-bar-container';

      const crowdBar = document.createElement('div');
      crowdBar.className = `location-bar ${colorClass}`;

      // scale height between 40px and 200px
      const minHeight = 40;
      const maxHeight = 200;
      let height;
      if (visitorCount < QUIET_THRESHOLD) {
        height = minHeight;
      } else if (visitorCount <= MODERATE_THRESHOLD) {
        height = minHeight + ((visitorCount - QUIET_THRESHOLD) / (MODERATE_THRESHOLD - QUIET_THRESHOLD)) * (maxHeight - minHeight) * 0.5 + 40;
      } else {
        height = maxHeight;
      }
      crowdBar.style.height = `${height}px`;

      const barText = document.createElement('span');
      barText.textContent = `${visitorCount}`;
      crowdBar.appendChild(barText);

      const locationLabel = document.createElement('div');
      locationLabel.className = 'location-label';
      locationLabel.textContent = location.shortName;

      // click on bar → detailed recommendation with best hour
      crowdBar.addEventListener('click', () => {
        document.querySelectorAll('.location-bar').forEach(bar => bar.classList.remove('active-bar'));
        crowdBar.classList.add('active-bar');

        let bestHourText = '';
        if (hourlyStats && hourlyStats[location.id]) {
          const bestHour = getBestHourFromStatsWithAmPm(hourlyStats[location.id]);
          bestHourText = `<br><b>Best time to visit:</b> ${bestHour}`;
        } else {
          bestHourText = '<br>No best time data available.';
        }

        const text = getRecommendationText(location.shortName, visitorCount, bestHourText);
        if (recommendationBox) {
          recommendationBox.innerHTML = text;
        }
      });

      barContainer.appendChild(crowdBar);
      barContainer.appendChild(locationLabel);
      comparisonChartContainer.appendChild(barContainer);
    });
  }

  // --- RECOMMENDATION HELPERS -------------------------------------------------

  function getRecommendationText(shortName, visitors, bestHourText) {
    if (visitors < QUIET_THRESHOLD) {
      return `<b>${shortName}:</b> Low attendance – great moment to visit! ${bestHourText}`;
    } else if (visitors < MODERATE_THRESHOLD) {
      return `<b>${shortName}:</b> Moderate attendance – choose a non‑peak hour if you prefer it quiet. ${bestHourText}`;
    } else {
      return `<b>${shortName}:</b> Very crowded – avoid peak hours if possible. ${bestHourText}`;
    }
  }

  function getBestHourFromStatsWithAmPm(hourObj) {
    let bestHour = null;
    let minAvg = Infinity;

    // consider only 07:00–21:00
    for (let h = 7; h < 22; h++) {
      const list = hourObj[h] || [];
      if (list.length === 0) continue;

      const avg = list.reduce((a, b) => a + b, 0) / list.length;
      if (avg < minAvg) {
        minAvg = avg;
        bestHour = h;
      }
    }

    return bestHour !== null ? hourToAmPm(bestHour) : 'No quiet hour found';
  }

  function hourToAmPm(hour) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : (hour <= 12 ? hour : hour - 12);
    return `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
  }

  // --- INITIALIZE -------------------------------------------------------------

  async function initializeData() {
    try {
      const weeklyAverages = await getWeeklyAverages();
      if (weeklyAverages) {
        visitorData = convertToUIData(weeklyAverages);
      } else {
        // optional: fallback to sample data
        visitorData = generateSampleData();
      }
      updateDayDisplay();
    } catch (error) {
      console.error('Error loading visitor data:', error);
      visitorData = generateSampleData();
      updateDayDisplay();
    }
  }

  // simple random fallback if API fails
  function generateSampleData() {
    const data = {};
    locations.forEach(location => {
      data[location.id] = {
        name: location.name,
        days: []
      };
      dayNames.forEach(day => {
        let baseVisitors;
        if (location.id === 'kapellbrücke') {
          baseVisitors = (day === 'Saturday' || day === 'Sunday')
            ? 100 + Math.random() * 50
            : 40 + Math.random() * 40;
        } else if (location.id === 'rathausquai') {
          if (day === 'Saturday') {
            baseVisitors = 80 + Math.random() * 40;
          } else if (day === 'Sunday') {
            baseVisitors = 60 + Math.random() * 30;
          } else {
            baseVisitors = 50 + Math.random() * 30;
          }
        } else if (location.id === 'löwendenkmal') {
          baseVisitors = 40 + Math.random() * 40;
        } else if (location.id === 'schwanenplatz') {
          baseVisitors = (day === 'Saturday')
            ? 90 + Math.random() * 40
            : 60 + Math.random() * 40;
        } else { // hertensteinstrasse
          baseVisitors = (day === 'Saturday' || day === 'Sunday')
            ? 70 + Math.random() * 40
            : 30 + Math.random() * 30;
        }
        data[location.id].days.push({
          day,
          visitors: Math.round(baseVisitors)
        });
      });
    });
    return data;
  }

  initializeData();
});
     
     
  