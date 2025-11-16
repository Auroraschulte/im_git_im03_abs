// Place this code at the bottom of your <script> or JS file

document.addEventListener('DOMContentLoaded', function() {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const locations = [
        { id: 'kapellbrücke', name: 'Kapellbrücke', shortName: 'Kapellbrücke', description: 'The iconic Chapel Bridge and Water Tower' },
        { id: 'rathausquai', name: 'Rathausquai', shortName: 'Rathausquai', description: 'The historic Old Town with its medieval architecture' },
        { id: 'löwendenkmal', name: 'Löwendenkmal', shortName: 'Löwendenkmal', description: 'The famous Lion of Lucerne rock relief' },
        { id: 'schwanenplatz', name: 'Schwanenplatz', shortName: 'Schwanenplatz', description: 'Central square with shopping and cafes' },
        { id: 'hertensteinstrasse', name: 'Hertensteinstrasse', shortName: 'Hertensteinstrasse', description: 'Lakeside promenade with beautiful views' }
    ];

    // Global variable for visitor data
    let visitorData = {};
    let hourlyStats = null; // Will hold API hourly stats

    // DOM Elements
    const slider = document.getElementById("myRange");
    const output = document.getElementById("selected-day");
    const selectedDayElement = document.getElementById('selected-day');
    const dayMarkersContainer = document.getElementById('day-markers');
    const comparisonChartContainer = document.getElementById('comparison-chart');
    const comparisonDayElement = document.getElementById('comparison-day');
    const crowdStatusElement = document.getElementById('crowd-status');
    const recommendationElement = document.getElementById('recommendation');
    const recommendationBox = document.getElementById('recommendation-box');
    let selectedDayIndex = 1;

    if (slider && output) {
        output.innerHTML = slider.value;
    } else {
        console.error('Slider or Output element not found!');
    }

    // Create day markers
    dayNames.forEach((day, index) => {
        const marker = document.createElement('div');
        marker.className = 'day-marker';
        if (index === 0) marker.classList.add('active');
        marker.textContent = day.substring(0, 3);
        marker.dataset.index = index;
        dayMarkersContainer.appendChild(marker);
    });

    async function getWeeklyAverages() {
        try {
            const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
            const data = await response.json();
            
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const last30DaysData = data.filter(entry => new Date(entry.timestamp) >= thirtyDaysAgo);

            // Also build hourlyStats for later
            hourlyStats = buildHourlyStats(last30DaysData);

            // Weekly averages for normal chart
            const averages = {};
            last30DaysData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const dayOfWeek = date.getDay();
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
            const result = {};
            const germanDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            Object.keys(averages).forEach(standort => {
                result[standort] = {};
                for (let day = 0; day < 7; day++) {
                    const dayData = averages[standort][day];
                    if (dayData.count > 0) {
                        result[standort][germanDayNames[day]] = Math.round(dayData.sum / dayData.count);
                    } else {
                        result[standort][germanDayNames[day]] = 0;
                    }
                }
            });
            return result;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    /**
     * Builds an object: { locationId: { hour: [visitorCount, ...] } }
     */
    function buildHourlyStats(entries) {
        const stats = {};
        entries.forEach(entry => {
            const id = mapStandortToId(entry.standort);
            const date = new Date(entry.timestamp);
            const hour = date.getHours();
            if (!id) return;
            if (!stats[id]) stats[id] = {};
            if (!stats[id][hour]) stats[id][hour] = [];
            stats[id][hour].push(entry.passanten);
        });
        return stats;
    }

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
        locations.forEach(location => {
            uiData[location.id] = {
                name: location.name,
                days: Array(7).fill().map((_, index) => ({
                    day: dayNames[index],
                    visitors: 0,
                    count: 0
                }))
            };
        });
        Object.keys(weeklyAverages).forEach(standort => {
            const locationId = mapStandortToId(standort);
            if (locationId && uiData[locationId]) {
                Object.keys(weeklyAverages[standort]).forEach(germanDay => {
                    const englishDay = dayNameMap[germanDay];
                    const dayIndex = dayNames.indexOf(englishDay);
                    if (dayIndex !== -1) {
                        uiData[locationId].days[dayIndex].visitors = weeklyAverages[standort][germanDay];
                    }
                });
            }
        });
        return uiData;
    }

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

    function updateDayDisplay() {
        const dayName = dayNames[selectedDayIndex];
        selectedDayElement.textContent = dayName;
        comparisonDayElement.textContent = dayName;
        document.querySelectorAll('.day-marker').forEach((marker, index) => {
            if (index === selectedDayIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
        updateVisitorStats();
        updateComparisonChart();
    }

    function updateVisitorStats() {
        const locationData = visitorData['kapellbrücke'];
        if (!locationData) return;
        const dayData = locationData.days[selectedDayIndex];
        const visitorCount = dayData.visitors;
        let status, statusClass, recommendation;
        if (visitorCount < 40) {
            status = "Quiet";
            statusClass = "status-quiet";
            recommendation = "Good";
        } else if (visitorCount < 90) {
            status = "Moderate";
            statusClass = "status-moderate";
            recommendation = "Moderate";
        } else {
            status = "Busy";
            statusClass = "status-busy";
            recommendation = "Avoid";
        }
        crowdStatusElement.textContent = status;
        crowdStatusElement.className = `stat-value ${statusClass}`;
        recommendationElement.textContent = recommendation;
    }

    // ---- MAIN CHART: Make location bars interactive ----
    // ... davor alles wie gehabt ...

function updateComparisonChart() {
  comparisonChartContainer.innerHTML = '';
  if (Object.keys(visitorData).length === 0) {
      comparisonChartContainer.innerHTML = '<div class="loading">Loading data...</div>';
      return;
  }
  locations.forEach((location) => {
      const locationData = visitorData[location.id];
      if (!locationData) return;
      const dayData = locationData.days[selectedDayIndex];
      const visitorCount = dayData.visitors;
      let colorClass;
      if (visitorCount < 40) {
        colorClass = "location-bar-quiet";
      } else if (visitorCount < 90) {
        colorClass = "location-bar-moderate";
      } else {
        colorClass = "location-bar-busy";
      }
      const barContainer = document.createElement('div');
      barContainer.className = 'location-bar-container';
      const crowdBar = document.createElement('div');
      crowdBar.className = `location-bar ${colorClass}`;
      const minHeight = 40;
      const maxHeight = 200;
      let height;
      if (visitorCount < 40) {
        height = minHeight;
      } else if (visitorCount <= 90) {
        height = minHeight + ((visitorCount - 40) / 90) * (maxHeight - minHeight) * 0.5 + 40;
      } else {
        height = maxHeight;
      }
      crowdBar.style.height = height + "px";
      // Zahl einfügen:
      const barText = document.createElement('span');
      barText.textContent = `${visitorCount}`;
      crowdBar.appendChild(barText);
      const locationLabel = document.createElement('div');
      locationLabel.className = 'location-label';
      locationLabel.textContent = location.shortName;

      crowdBar.addEventListener('click', function() {
        document.querySelectorAll('.location-bar').forEach(bar => bar.classList.remove('active-bar'));
        crowdBar.classList.add('active-bar');
        let bestHourText = '';
        if (hourlyStats && hourlyStats[location.id]) {
          const bestHour = getBestHourFromStatsWithAmPm(hourlyStats[location.id]);
          bestHourText = `<br><b>Best time to visit:</b> ${bestHour}`;
        } else {
          bestHourText = `<br>No best time data available.`;
        }
        const recommendationText = getRecommendationText(location.shortName, visitorCount, bestHourText);
        showRecommendationBox(recommendationText);
      });

      barContainer.appendChild(crowdBar);
      barContainer.appendChild(locationLabel);
      comparisonChartContainer.appendChild(barContainer);
  });
}

// Recommendation-Text wie bisher
function getRecommendationText(shortName, visitors, bestHourText) {
  if (visitors < 40) {
    return `<b>${shortName}:</b> Low attendance – great moment to visit! ${bestHourText}`;
  } else if (visitors < 90) {
    return `<b>${shortName}:</b> Moderate attendance – for less crowd, pick a non-peak hour. ${bestHourText}`;
  } else {
    return `<b>${shortName}:</b> Very crowded – avoid peak! ${bestHourText}`;
  }
}

// STUNDE MIT AM/PM & OHNE NACHTSTUNDEN
function getTimeSlotsFromStats(hourObj) {
  // 1. Besucher-Durchschnitte für jede Stunde zwischen 7 - 22 Uhr berechnen
  let hourlyAverages = [];
  for (let h = 7; h <= 22; h++) {
    const visitorsList = hourObj[h] || [];
    if (visitorsList.length === 0) continue; // keine Daten, überspringen
    const avg = visitorsList.reduce((a, b) => a + b, 0) / visitorsList.length;
    hourlyAverages.push({ hour: h, avg });
  }
  if (hourlyAverages.length === 0) return { recommend: [], avoid: [] };

  // 2. Sortieren nach Besucherzahl
  hourlyAverages.sort((a, b) => a.avg - b.avg);

  // 3. Die ersten 2–3 ruhigsten Stunden, die letzten als "avoid"
  const recommendedSlots = hourlyAverages.slice(0, 3).map(e => hourToAmPm(e.hour));
  const avoidSlot = hourToAmPm(hourlyAverages[hourlyAverages.length - 1].hour);

  return { recommend: recommendedSlots, avoid: avoidSlot };
}

// Hilfsfunktion für AM/PM-Format
function hourToAmPm(hour) {
  let period = (hour < 12) ? 'AM' : 'PM';
  let displayHour = (hour === 0) ? 12 : (hour <= 12 ? hour : hour - 12);
  return (`${displayHour.toString().padStart(2,'0')}:00 ${period}`);
}

function getRecommendationText(shortName, visitors, slotInfo) {
  // slotInfo = { recommend: [...], avoid: ... }
  let recommendTimes = slotInfo.recommend.length > 0
    ? slotInfo.recommend.join(', ')
    : 'No time slots available';
  let avoidTime = slotInfo.avoid || 'No slot';

  let msg = `<b>${shortName}:</b>`;

  if (visitors < 40) {
    msg += ` Low attendance – great moment to visit!`;
  } else if (visitors < 90) {
    msg += ` Moderate attendance – for less crowd, pick a non-peak hour.`;
  } else {
    msg += ` Very crowded – avoid peak!`;
  }
  msg += `<br><b>Recommended time slots:</b> ${recommendTimes}`;
  msg += `<br><span style="color:#e74c3c;"><b>Avoid (peak):</b> ${avoidTime}</span>`;

  return msg;
}

function showRecommendationBox(text) {
  const box = document.getElementById('recommendation-box');
  box.innerHTML = text;
}

// In updateComparisonChart:
crowdBar.addEventListener('click', function() {
  document.querySelectorAll('.location-bar').forEach(bar => bar.classList.remove('active-bar'));
  crowdBar.classList.add('active-bar');

  let slotInfo = { recommend: [], avoid: '' };
  if (hourlyStats && hourlyStats[location.id]) {
    slotInfo = getTimeSlotsFromStats(hourlyStats[location.id]);
  }
  const recommendationText = getRecommendationText(location.shortName, visitorCount, slotInfo);
  showRecommendationBox(recommendationText);
});


    async function initializeData() {
        try {
            const weeklyAverages = await getWeeklyAverages();
            if (weeklyAverages) {
                visitorData = convertToUIData(weeklyAverages);
                updateDayDisplay();
            } else {
                throw new Error('No data received from API');
            }
        } catch (error) {
            console.error('Error loading visitor data:', error);
            visitorData = {}; // fallback: no data
            updateDayDisplay();
        }
    }

    if (slider) {
        slider.addEventListener('input', function() {
            selectedDayIndex = parseInt(this.value);
            updateDayDisplay();
        });
    }

    // Start initialization
    initializeData();
});
