document.addEventListener('DOMContentLoaded', function() {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Locations definition
    const locations = [
        {
            id: 'kapellbrücke',
            name: 'Kapellbrücke',
            shortName: 'Kapellbrücke',
            description: 'The iconic Chapel Bridge and Water Tower'
        },
        {
            id: 'rathausquai',
            name: 'Rathausquai',
            shortName: 'Rathausquai',
            description: 'The historic Old Town with its medieval architecture'
        },
        {
            id: 'löwendenkmal',
            name: 'Löwendenkmal',
            shortName: 'Löwendenkmal',
            description: 'The famous Lion of Lucerne rock relief'
        },
        {
            id: 'schwanenplatz',
            name: 'Schwanenplatz',
            shortName: 'Schwanenplatz',
            description: 'Central square with shopping and cafes'
        },
        {
            id: 'hertensteinstrasse',
            name: 'Hertensteinstrasse',
            shortName: 'Hertensteinstrasse',
            description: 'Lakeside promenade with beautiful views'
        }
    ];

    // Global variable for visitor data
    let visitorData = {};

    // DOM Elements
    const slider = document.getElementById("myRange");
    const output = document.getElementById("selected-day");
    const selectedDayElement = document.getElementById('selected-day');
    const dayMarkersContainer = document.getElementById('day-markers');
    const comparisonChartContainer = document.getElementById('comparison-chart');
    const comparisonDayElement = document.getElementById('comparison-day');
    const crowdStatusElement = document.getElementById('crowd-status');
    const recommendationElement = document.getElementById('recommendation');
    
    let selectedDayIndex = 1;

    // Check if slider exists
    if (slider && output) {
        output.innerHTML = slider.value;
    } else {
        console.error('Slider oder Output Element nicht gefunden!');
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

    // Async function to get weekly averages from API
    async function getWeeklyAverages() {
        try {
            const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
            const data = await response.json();
            console.log('data?', data);
            
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const last30DaysData = data.filter(entry => 
                new Date(entry.timestamp) >= thirtyDaysAgo
            );

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
            console.error('Fehler beim Abrufen der Daten:', error);
            return null;
        }
    }

    // Convert API data to UI format
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

    // Map German location names to IDs
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

    // Generate sample data as fallback
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
                    if (day === 'Saturday' || day === 'Sunday') {
                        baseVisitors = 100 + Math.random() * 50;
                    } else {
                        baseVisitors = 40 + Math.random() * 40;
                    }
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
                    if (day === 'Saturday') {
                        baseVisitors = 90 + Math.random() * 40;
                    } else {
                        baseVisitors = 60 + Math.random() * 40;
                    }
                } else if (location.id === 'hertensteinstrasse') {
                    if (day === 'Saturday' || day === 'Sunday') {
                        baseVisitors = 70 + Math.random() * 40;
                    } else {
                        baseVisitors = 30 + Math.random() * 30;
                    }
                }
                
                const visitors = Math.round(baseVisitors);
                
                data[location.id].days.push({
                    day: day,
                    visitors: visitors
                });
            });
        });
        
        return data;
    }

    // Update day display
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
    
    // Update visitor stats
    function updateVisitorStats() {
        const locationData = visitorData['kapellbrücke'];
        if (!locationData) return;
        
        const dayData = locationData.days[selectedDayIndex];
        const visitorCount = dayData.visitors;
        
        let status, statusClass, recommendation;
        if (visitorCount < 50) {
            status = "Quiet";
            statusClass = "status-quiet";
            recommendation = "Good";
        } else if (visitorCount < 100) {
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

    // Update comparison chart
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
            if (visitorCount < 50) {
                colorClass = "location-bar-quiet";
            } else if (visitorCount < 100) {
                colorClass = "location-bar-moderate";
            } else {
                colorClass = "location-bar-busy";
            }
            
            const barContainer = document.createElement('div');
            barContainer.className = 'location-bar-container';
            
            const crowdBar = document.createElement('div');
            crowdBar.className = `location-bar ${colorClass}`;
            
            const maxVisitors = 700;
            const heightPercentage = Math.min(100, (visitorCount / maxVisitors) * 100);
            crowdBar.style.height = `${heightPercentage}%`;
            
            const barText = document.createElement('span');
            barText.textContent = `${visitorCount}`;
            crowdBar.appendChild(barText);
            
            const locationLabel = document.createElement('div');
            locationLabel.className = 'location-label';
            locationLabel.textContent = location.shortName;
            
            barContainer.appendChild(crowdBar);
            barContainer.appendChild(locationLabel);
            comparisonChartContainer.appendChild(barContainer);
        });
    }

    // Initialize data
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
            visitorData = generateSampleData();
            updateDayDisplay();
        }
    }

    // Event listener for slider
    if (slider) {
        slider.addEventListener('input', function() {
            selectedDayIndex = parseInt(this.value);
            updateDayDisplay();
        });
    }

    // Start initialization
    initializeData();


})