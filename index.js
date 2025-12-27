document.addEventListener('DOMContentLoaded', function () {
  // Wochentage für das UI
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
 async function getWeeklyAverages() {
    try {
        // Daten von der API abrufen
        const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
        const data = await response.json();
        console.log('data?', data);
        // Daten nach Timestamp sortieren (neueste zuerst)
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Letzte 30 Tage filtern
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysData = data.filter(entry => 
            new Date(entry.timestamp) >= thirtyDaysAgo
        );

        // Daten nach Standort und Wochentag gruppieren
        const averages = {};

        last30DaysData.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dayOfWeek = date.getDay(); // 0 = Sonntag, 1 = Montag, etc.
            const standort = entry.standort;

            // Initialisiere die Struktur falls noch nicht vorhanden
            if (!averages[standort]) {
                averages[standort] = {
                    0: { sum: 0, count: 0 }, // Sonntag
                    1: { sum: 0, count: 0 }, // Montag
                    2: { sum: 0, count: 0 }, // Dienstag
                    3: { sum: 0, count: 0 }, // Mittwoch
                    4: { sum: 0, count: 0 }, // Donnerstag
                    5: { sum: 0, count: 0 }, // Freitag
                    6: { sum: 0, count: 0 }  // Samstag
                };
            }

            // Addiere die Passantenzahlen für den entsprechenden Wochentag
            averages[standort][dayOfWeek].sum += entry.passanten;
            averages[standort][dayOfWeek].count++;
        });

        // Berechne die Durchschnitte
        const result = {};
        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

        Object.keys(averages).forEach(standort => {
            result[standort] = {};
            
            for (let day = 0; day < 7; day++) {
                const dayData = averages[standort][day];
                if (dayData.count > 0) {
                    result[standort][dayNames[day]] = Math.round(dayData.sum / dayData.count);
                } else {
                    result[standort][dayNames[day]] = 0;
                }
            }
        });

        return result;

    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        return null;
    }
}
  // Schwellenwerte für die Besucherdichte
  const QUIET_THRESHOLD = 50;
  const MODERATE_THRESHOLD = 100;

  // DOM-Elemente
  const slider = document.getElementById('day-slider');
  const selectedDayElement = document.getElementById('selected-day');
  const dayMarkersContainer = document.getElementById('day-markers');
  const comparisonChartContainer = document.getElementById('comparison-chart');
  const comparisonDayElement = document.getElementById('comparison-day');
  const visitorCountElement = document.getElementById('visitor-count');
  const crowdStatusElement = document.getElementById('crowd-status');
  const recommendationElement = document.getElementById('recommendation');
  const dataMessageElement = document.getElementById('data-message');

  let selectedDayIndex = 0;
  let visitorData = {};

  // Standorte
  const locations = [
    { id: 'kapellbrücke', name: 'Kapellbrücke', shortName: 'Kapellbrücke' },
    { id: 'rathausquai', name: 'Rathausquai', shortName: 'Rathausquai' },
    { id: 'löwendenkmal', name: 'Löwendenkmal', shortName: 'Löwendenkmal' },
    { id: 'schwanenplatz', name: 'Schwanenplatz', shortName: 'Schwanenplatz' },
    { id: 'hertensteinstrasse', name: 'Hertensteinstrasse', shortName: 'Hertensteinstrasse' }
  ];

  // 1) Daten aus deinem Backend holen und Wochenmittel berechnen
  async function getWeeklyAverages() {
    try {
      const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('data?', data);

      // Nach Timestamp sortieren (neueste zuerst)
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Letzte 30 Tage filtern
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const last30DaysData = data.filter(entry =>
        new Date(entry.timestamp) >= thirtyDaysAgo
      );

      // Nach Standort + Wochentag gruppieren
      const averages = {};
      last30DaysData.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dayOfWeek = date.getDay(); // 0 = Sonntag, 1 = Montag, ...
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

      // Durchschnitte berechnen
      const result = {};
      const germanDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

      Object.keys(averages).forEach(standort => {
        result[standort] = {};
        for (let day = 0; day < 7; day++) {
          const dayData = averages[standort][day];
          const name = germanDayNames[day];
          result[standort][name] = dayData.count > 0
            ? Math.round(dayData.sum / dayData.count)
            : 0;
        }
      });

      return result;
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      return null;
    }
  }

  // 2) Weekly-Averages in UI-Format übersetzen
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

    // Struktur für alle Locations vorbereiten
    locations.forEach(location => {
      uiData[location.id] = {
        name: location.name,
        days: Array(7)
          .fill()
          .map((_, index) => ({
            day: dayNames[index],
            visitors: 0
          }))
      };
    });

    // Daten einfüllen
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
      'Kapellbrücke': 'kapellbrücke',
      'Rathausquai': 'rathausquai',
      'Löwendenkmal': 'löwendenkmal',
      'Schwanenplatz': 'schwanenplatz',
      'Hertensteinstrasse': 'hertensteinstrasse'
    };
    return mapping[standort];
  }

  // 3) UI: Day-Marker erzeugen
  dayNames.forEach((day, index) => {
    const marker = document.createElement('div');
    marker.className = 'day-marker';
    if (index === 0) marker.classList.add('active');
    marker.textContent = day.substring(0, 3);
    marker.dataset.index = index;

    marker.addEventListener('click', () => {
      selectedDayIndex = index;
      slider.value = index;
      updateDayDisplay();
    });

    dayMarkersContainer.appendChild(marker);
  });

  // Slider-Event
  slider.addEventListener('input', () => {
    selectedDayIndex = parseInt(slider.value, 10);
    updateDayDisplay();
  });

  // 4) Daten laden
  async function loadVisitorData() {
    try {
      const weeklyAverages = await getWeeklyAverages();

      if (weeklyAverages) {
        visitorData = convertToUIData(weeklyAverages);
        dataMessageElement.textContent =
          'Durchschnittswerte der letzten 30 Tage, täglich aktualisiert.';
        updateDayDisplay();
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error loading visitor data:', error);
      dataMessageElement.textContent =
        'Live-Daten sind aktuell nicht verfügbar. Es werden Beispielwerte angezeigt.';
      visitorData = generateSampleData();
      updateDayDisplay();
    }
  }

  // 5) Anzeige aktualisieren
  function updateDayDisplay() {
    const dayName = dayNames[selectedDayIndex];
    selectedDayElement.textContent = dayName;
    if (comparisonDayElement) {
      comparisonDayElement.textContent = dayName;
    }

    // Active Marker
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
      status = 'Ruhig';
      statusClass = 'status-quiet';
      recommendation = 'Ideal für einen entspannten Besuch.';
    } else if (visitorCount < MODERATE_THRESHOLD) {
      status = 'Mittel';
      statusClass = 'status-moderate';
      recommendation = 'Gut machbar, mit etwas Gedränge.';
    } else {
      status = 'Voll';
      statusClass = 'status-busy';
      recommendation = 'Wenn möglich einen anderen Tag wählen.';
    }

    crowdStatusElement.textContent = status;
    crowdStatusElement.className = `stat-value ${statusClass}`;
    recommendationElement.textContent = recommendation;
  }

  function updateComparisonChart() {
    comparisonChartContainer.innerHTML = '';

    if (Object.keys(visitorData).length === 0) {
      comparisonChartContainer.innerHTML =
        '<div class="loading">Daten werden geladen …</div>';
      return;
    }

    locations.forEach(location => {
      const locationData = visitorData[location.id];
      if (!locationData) return;

      const dayData = locationData.days[selectedDayIndex];
      const visitors = dayData.visitors;

      const container = document.createElement('div');
      container.className = 'location-bar-container';

      const bar = document.createElement('div');
      bar.className = 'location-bar';

      // Höhe relativ skalieren
      const height = Math.min(100, visitors); // 100px max
      bar.style.height = `${height + 40}px`;

      let barClass;
      if (visitors < QUIET_THRESHOLD) {
        barClass = 'location-bar-quiet';
      } else if (visitors < MODERATE_THRESHOLD) {
        barClass = 'location-bar-moderate';
      } else {
        barClass = 'location-bar-busy';
      }
      bar.classList.add(barClass);

      const valueSpan = document.createElement('span');
      valueSpan.textContent = visitors;
      bar.appendChild(valueSpan);

      const label = document.createElement('div');
      label.className = 'location-label';
      label.textContent = location.shortName;

      container.appendChild(bar);
      container.appendChild(label);
      comparisonChartContainer.appendChild(container);
    });
  }

  // Fallback-Sample-Daten (falls API down)
  function generateSampleData() {
    const sample = {};
    locations.forEach(location => {
      sample[location.id] = {
        name: location.name,
        days: dayNames.map(day => ({
          day,
          visitors: Math.floor(Math.random() * 150)
        }))
      };
    });
    return sample;
  }

  // Initial laden
  loadVisitorData();

