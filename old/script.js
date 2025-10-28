document.addEventListener('DOMContentLoaded', function() {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
    
    const slider = document.getElementById('day-slider');
    const selectedDayElement = document.getElementById('selected-day');
    const dayMarkersContainer = document.getElementById('day-markers');
    const comparisonChartContainer = document.getElementById('comparison-chart');
    const comparisonDayElement = document.getElementById('comparison-day');
    const visitorCountElement = document.getElementById('visitor-count');
    const crowdStatusElement = document.getElementById('crowd-status');
    const recommendationElement = document.getElementById('recommendation');
    
    let selectedDayIndex = 0;
    let visitorData = {};
    
    // Create day markers
    dayNames.forEach((day, index) => {
        const marker = document.createElement('div');
        marker.className = 'day-marker';
        if (index === 0) marker.classList.add('active');
        marker.textContent = day.substring(0, 3);
        marker.dataset.index = index;
        dayMarkersContainer.appendChild(marker);
    });
    
    // Load visitor data from API using the existing getWeeklyAverages function
    async function loadVisitorData() {
        try {
            // Use the existing getWeeklyAverages function
            const weeklyAverages = await getWeeklyAverages();
            
            if (weeklyAverages) {
                // Convert the data format for UI usage
                visitorData = convertToUIData(weeklyAverages);
                updateDayDisplay();
            } else {
                throw new Error('No data received from API');
            }
        } catch (error) {
            console.error('Error loading visitor data:', error);
            // Fallback to sample data if API fails
            visitorData = generateSampleData();
            updateDayDisplay();
        }
    }
    
    // Convert the getWeeklyAverages format to UI data format
    function convertToUIData(weeklyAverages) {
        const uiData = {};
        
        // Map German day names to English
        const dayNameMap = {
            'Sonntag': 'Sunday',
            'Montag': 'Monday', 
            'Dienstag': 'Tuesday',
            'Mittwoch': 'Wednesday',
            'Donnerstag': 'Thursday',
            'Freitag': 'Friday',
            'Samstag': 'Saturday'
        };
        
        // Initialize data structure for all locations
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
        
        // Fill with actual data from getWeeklyAverages
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
            'Kapellbrücke': 'kapellbrücke',
            'Rathausquai': 'rathausquai', 
            'Löwendenkmal': 'löwendenkmal',
            'Schwanenplatz': 'schwanenplatz',
            'Hertensteinstrasse': 'hertensteinstrasse'
        };
        return mapping[standort];
    }
    
    // Update display based on selected day
    function updateDayDisplay() {
        const dayName = dayNames[selectedDayIndex];
        selectedDayElement.textContent = dayName;
        comparisonDayElement.textContent = dayName;
        
        // Update active day marker
        document.querySelectorAll('.day-marker').forEach((marker, index) => {
            if (index === selectedDayIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
        
        // Update visitor count and status
        updateVisitorStats();
        
        // Update comparison chart
        updateComparisonChart();
    }
    
    // Update visitor stats based on visitor count
    function updateVisitorStats() {
        const locationData = visitorData['kapellbrücke'];
        if (!locationData) return;
        
        const dayData = locationData.days[selectedDayIndex];
        const visitorCount = dayData.visitors;
        
        // Update visitor count
        visitorCountElement.textContent = visitorCount;
        
        // Determine crowd status and color
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
        
        // Update status and recommendation
        crowdStatusElement.textContent = status;
        crowdStatusElement.className = `stat-value ${statusClass}`;
        recommendationElement.textContent = recommendation;
    }
    
    // Update comparison chart for selected day
    function updateComparisonChart() {
        comparisonChartContainer.innerHTML = '';
        
        // If no data yet, show loading
        if (Object.keys(visitorData).length === 0) {
            comparisonChartContainer.innerHTML = '<div class="loading">Loading data...</div>';
            return;
        }
        
        locations.forEach((location, index) => {
            const locationData = visitorData[location.id];
            if (!locationData) return;
            
            const dayData = locationData.days[selectedDayIndex];
            const visitorCount = dayData.visitors;
            
            // Determine color class based on visitor count
            let colorClass;
            if (visitorCount < 50) {
                colorClass = "location-bar-quiet";
            } else if (visitorCount < 100) {
                colorClass = "location-bar-moderate";
            } else {
                colorClass = "location-bar-busy";
            }
            
            // Create container for bar and label
            const barContainer = document.createElement('div');
            barContainer.className = 'location-bar-container';
            
            // Create the vertical bar
            const crowdBar = document.createElement('div');
            crowdBar.className = `location-bar ${colorClass}`;
            
            // Set the height based on visitor count (scaled to max 150 people)
            const maxVisitors = 700;
            const heightPercentage = Math.min(100, (visitorCount / maxVisitors) * 100);
            crowdBar.style.height = `${heightPercentage}%`;
            
            // Add visitor count as text inside the bar
            const barText = document.createElement('span');
            barText.textContent = `${visitorCount}`;
            crowdBar.appendChild(barText);
            
            // Create label for location
            const locationLabel = document.createElement('div');
            locationLabel.className = 'location-label';
            locationLabel.textContent = location.shortName;
            
            // Add bar and label to container
            barContainer.appendChild(crowdBar);
            barContainer.appendChild(locationLabel);
            
            // Add container to chart
            comparisonChartContainer.appendChild(barContainer);
        });
    }
    
    // Event listener for slider
    slider.addEventListener('input', function() {
        selectedDayIndex = parseInt(this.value);
        updateDayDisplay();
    });
    
    // Sample data for fallback (remove this when API is working)
    function generateSampleData() {
        const data = {};
        
        locations.forEach(location => {
            data[location.id] = {
                name: location.name,
                days: []
            };
            
            dayNames.forEach(day => {
                // Generate sample visitor count with some pattern based on location and day
                let baseVisitors;
                
                // Different locations have different visitor patterns
                if (location.id === 'kapellbrücke') {
                    // Chapel Bridge is busy on weekends
                    if (day === 'Saturday' || day === 'Sunday') {
                        baseVisitors = 100 + Math.random() * 50;
                    } else {
                        baseVisitors = 40 + Math.random() * 40;
                    }
                } else if (location.id === 'rathausquai') {
                    // Old Town is moderately busy most days
                    if (day === 'Saturday') {
                        baseVisitors = 80 + Math.random() * 40;
                    } else if (day === 'Sunday') {
                        baseVisitors = 60 + Math.random() * 30;
                    } else {
                        baseVisitors = 50 + Math.random() * 30;
                    }
                } else if (location.id === 'löwendenkmal') {
                    // Lion Monument is popular but not extremely crowded
                    baseVisitors = 40 + Math.random() * 40;
                } else if (location.id === 'schwanenplatz') {
                    // Central square is busy during shopping hours
                    if (day === 'Saturday') {
                        baseVisitors = 90 + Math.random() * 40;
                    } else {
                        baseVisitors = 60 + Math.random() * 40;
                    }
                } else if (location.id === 'hertensteinstrasse') {
                    // Lakeside promenade is popular on nice days
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
    
    // Initialize by loading data
    loadVisitorData();
});