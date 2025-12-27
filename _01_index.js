document.addEventListener('DOMContentLoaded', function() {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const locations = [
        { id: 'kapellbrücke', name: 'Kapellbrücke', shortName: 'KB', description: 'The iconic Chapel Bridge and Water Tower - perfect for photos with fewer crowds.' },
        { id: 'rathausquai', name: 'Rathausquai', shortName: 'RQ', description: 'Historic Old Town with medieval architecture - best for quiet exploration.' },
        { id: 'löwendenkmal', name: 'Löwendenkmal', shortName: 'Lion', description: 'Famous Lion of Lucerne rock relief - moving monument, peaceful anytime.' },
        { id: 'schwanenplatz', name: 'Schwanenplatz', shortName: 'SP', description: 'Central square with shopping and cafes - lively but manageable mid-week.' },
        { id: 'hertensteinstrasse', name: 'Hertensteinstrasse', shortName: 'HS', description: 'Lakeside promenade with stunning views - ideal for relaxed walks.' }
    ];

    let visitorData = {};
    // ... [keep all your existing DOM elements, getWeeklyAverages, convertToUIData, mapStandortToId, generateSampleData unchanged] ...

    // NEW: Get best time for location (lowest visitors)
    function getBestTimeForLocation(locationId) {
        const locationData = visitorData[locationId];
        if (!locationData) return null;
        
        let bestDay = 'Monday', bestVisitors = Infinity, bestHour = '10:00 AM';
        
        // Find day with lowest average visitors
        locationData.days.forEach((dayData, index) => {
            if (dayData.visitors < bestVisitors) {
                bestVisitors = dayData.visitors;
                bestDay = dayData.day;
            }
        });
        
        return { day: bestDay, visitors: bestVisitors, hour: bestHour };
    }

    // NEW: Show location details modal
    function showLocationDetails(location) {
        const bestTime = getBestTimeForLocation(location.id);
        const currentVisitors = visitorData[location.id]?.days[selectedDayIndex]?.visitors || 0;
        
        let status = currentVisitors < 50 ? 'Calm' : currentVisitors < 100 ? 'Moderate' : 'Busy';
        
        const modalHTML = `
            <div id="location-modal" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
                align-items: center; justify-content: center; font-family: Arial;">
                <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 400px; max-height: 80vh; overflow-y: auto;">
                    <h2>${location.name}</h2>
                    <p><strong>Description:</strong> ${location.description}</p>
                    <p><strong>Today (${dayNames[selectedDayIndex]}) Status:</strong> <span style="color: ${status === 'Calm' ? '#2ecc71' : status === 'Moderate' ? '#f39c12' : '#e74c3c'}">${status}</span> (${currentVisitors} visitors)</p>
                    <p><strong>Best time to visit:</strong> ${bestTime.day} around ${bestTime.hour} (${bestTime.visitors} visitors expected)</p>
                    <button onclick="document.getElementById('location-modal').remove()" style="background: #248BCC; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // UPDATED: Update comparison chart with click handlers + legend
    function updateComparisonChart() {
       function updateComparisonChart() {
    comparisonChartContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; color: white;">
            <div><strong>Legend:</strong></div>
            <div style="display: flex; gap: 1rem; font-size: 0.9rem;">
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #2ecc71; border-radius: 3px; margin-right: 6px;"></span>Calm (<50 visitors)</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #f39c12; border-radius: 3px; margin-right: 6px;"></span>Moderate (50-99)</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #e74c3c; border-radius: 3px; margin-right: 6px;"></span>Busy (100+)</div>
            </div>
        </div>
    `;

    if (Object.keys(visitorData).length === 0) {
        comparisonChartContainer.innerHTML += '<div class="loading">Loading data...</div>';
        return;
    }
    
    locations.forEach((location) => {
        const locationData = visitorData[location.id];
        if (!locationData) return;
        
        const dayData = locationData.days[selectedDayIndex];
        const visitorCount = dayData.visitors;
        
        const colorClass = visitorCount < 50 ? "location-bar-quiet" : 
                          visitorCount < 100 ? "location-bar-moderate" : "location-bar-busy";
        
        const barContainer = document.createElement('div');
        barContainer.className = 'location-bar-container';
        barContainer.style.cursor = 'pointer';
        
        const crowdBar = document.createElement('div');
        crowdBar.className = `location-bar ${colorClass}`;
        
        // Proportionale Höhe basierend auf Besucherzahlen (max 150 = 90%)
        const maxVisitors = 150;
        const heightPercentage = Math.min(90, (visitorCount / maxVisitors) * 100);
        crowdBar.style.height = `${heightPercentage}%`;
        
        const barText = document.createElement('span');
        barText.textContent = `${visitorCount}`;
        crowdBar.appendChild(barText);
        
        // CLICK HANDLER für Modal
        crowdBar.addEventListener('click', () => showLocationDetails(location));
        barContainer.addEventListener('click', () => showLocationDetails(location));
        
        const locationLabel = document.createElement('div');
        locationLabel.className = 'location-label';
        locationLabel.textContent = location.shortName;
        
        barContainer.appendChild(crowdBar);
        barContainer.appendChild(locationLabel);
        comparisonChartContainer.appendChild(barContainer);
    });
}

// Füge diese Funktion hinzu (für Location-Details):
function showLocationDetails(location) {
    const bestTime = getBestTimeForLocation(location.id);
    const currentVisitors = visitorData[location.id]?.days[selectedDayIndex]?.visitors || 0;
    const status = currentVisitors < 50 ? 'Calm' : currentVisitors < 100 ? 'Moderate' : 'Busy';
    
    const modal = document.createElement('div');
    modal.id = 'location-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.85); z-index: 1000; display: flex; 
        align-items: center; justify-content: center; font-family: Arial, sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 420px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <h2 style="margin-top: 0; color: #248BCC;">${location.name}</h2>
            <p><strong>Description:</strong> ${location.description}</p>
            <p><strong>Today (${dayNames[selectedDayIndex]}) Status:</strong> 
               <span style="color: ${status === 'Calm' ? '#2ecc71' : status === 'Moderate' ? '#f39c12' : '#e74c3c'}; font-weight: bold;">${status}</span> 
               (${currentVisitors} visitors)
            </p>
            <p><strong>Best time to visit:</strong> <strong>${bestTime.day}</strong> around <strong>10:00 AM</strong> 
               (${bestTime.visitors} visitors expected)
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #248BCC; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 1rem;">
                Close
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Füge auch diese hinzu (bester Tag):
function getBestTimeForLocation(locationId) {
    const locationData = visitorData[locationId];
    if (!locationData) return { day: 'Monday', visitors: 0 };
    
    let bestDay = 'Monday', bestVisitors = Infinity;
    locationData.days.forEach(dayData => {
        if (dayData.visitors < bestVisitors) {
            bestVisitors = dayData.visitors;
            bestDay = dayData.day;
        }
    });
    return { day: bestDay, visitors: bestVisitors };
}

    // ... [keep all your other functions unchanged: updateDayDisplay, updateVisitorStats, initializeData, event listeners] ...
    
    // Rest of your code stays exactly the same
});
