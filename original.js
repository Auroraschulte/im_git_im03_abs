document.addEventListener('DOMContentLoaded', async () => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const germanDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    
    const locations = [
        { id: 'kapellbrücke', name: 'Kapellbrücke', shortName: 'Kapellbrücke', description: 'Iconic Chapel Bridge - perfect for photos without crowds.' },
        { id: 'rathausquai', name: 'Rathausquai', shortName: 'Rathausquai', description: 'Historic Old Town - explore medieval architecture peacefully.' },
        { id: 'löwendenkmal', name: 'Löwendenkmal', shortName: 'Löwendenkmal', description: 'Dying Lion Monument - emotional and usually quiet.' },
        { id: 'schwanenplatz', name: 'Schwanenplatz', shortName: 'Schwanenplatz', description: 'Central square - cafes and shopping, best mid-week.' },
        { id: 'hertensteinstrasse', name: 'Hertensteinstrasse', shortName: 'Hertensteinstrasse', description: 'Lakeside promenade - stunning views, relaxed walks.' }
    ];

    let visitorData = {};
    let selectedDayIndex = 0;

    // DOM Elements
    const slider = document.getElementById('day-slider');
    const selectedDayEl = document.getElementById('selected-day');
    const dayMarkersEl = document.getElementById('day-markers');
    const chartEl = document.getElementById('comparison-chart');
    const comparisonDayEl = document.getElementById('comparison-day');
    const crowdStatusEl = document.getElementById('crowd-status');
    const recommendationEl = document.getElementById('recommendation');
    const recBoxEl = document.getElementById('recommendation-box');
    const touristOverviewEl = document.getElementById('tourist-overview');
    const totalVisitorsEl = document.getElementById('total-visitors');
    const overviewStatusEl = document.getElementById('overview-status');
    const avgLocationEl = document.getElementById('avg-location');

    // ★ DEINE API - 1:1 ★
    async function getWeeklyAverages() {
        try {
            console.log('🔄 Fetching API...');
            const response = await fetch('https://im03.aurora-schulte.ch/backend/api/getAll.php');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log('API data:', data);
            
            if (!Array.isArray(data) || data.length === 0) {
                console.warn(' No data from API');
                return null;
            }

            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const last30DaysData = data.filter(entry => new Date(entry.timestamp) >= thirtyDaysAgo);

            const averages = {};
            last30DaysData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const dayOfWeek = date.getDay();
                const standort = entry.standort.toLowerCase();

                if (!averages[standort]) {
                    averages[standort] = {
                        0: { sum: 0, count: 0 }, 1: { sum: 0, count: 0 },
                        2: { sum: 0, count: 0 }, 3: { sum: 0, count: 0 },
                        4: { sum: 0, count: 0 }, 5: { sum: 0, count: 0 }, 6: { sum: 0, count: 0 }
                    };
                }
                averages[standort][dayOfWeek].sum += parseInt(entry.passanten) || 0;
                averages[standort][dayOfWeek].count++;
            });

            const result = {};
            Object.keys(averages).forEach(standort => {
                result[standort] = {};
                for (let day = 0; day < 7; day++) {
                    const dayData = averages[standort][day];
                    result[standort][germanDayNames[day]] = dayData.count > 0 ? Math.round(dayData.sum / dayData.count) : 0;
                }
            });
            return result;
        } catch (error) {
            console.error('❌ API Error:', error);
            return null;
        }
    }

    function convertToUIData(weeklyAverages) {
        const dayNameMap = {
            'Sonntag': 'Sunday', 'Montag': 'Monday', 'Dienstag': 'Tuesday',
            'Mittwoch': 'Wednesday', 'Donnerstag': 'Thursday', 
            'Freitag': 'Friday', 'Samstag': 'Saturday'
        };

        locations.forEach(location => {
            visitorData[location.id] = {
                days: dayNames.map(day => ({ day, visitors: 0 }))
            };
        });

        Object.keys(weeklyAverages).forEach(standort => {
            const locId = standort;
            if (visitorData[locId]) {
                Object.keys(weeklyAverages[standort]).forEach(germanDay => {
                    const englishDay = dayNameMap[germanDay];
                    const dayIndex = dayNames.indexOf(englishDay);
                    if (dayIndex !== -1) {
                        visitorData[locId].days[dayIndex].visitors = weeklyAverages[standort][germanDay];
                    }
                });
            }
        });
    }

    function generateSampleData() {
        locations.forEach(loc => {
            visitorData[loc.id] = {
                days: dayNames.map((day, i) => ({
                    day, visitors: Math.max(10, Math.round(25 + Math.random() * 140 + (i >= 5 ? 40 : 0)))
                }))
            };
        });
    }

    function getTotalVisitorsToday() {
        let total = 0;
        locations.forEach(loc => {
            const data = visitorData[loc.id]?.days[selectedDayIndex];
            if (data) total += data.visitors;
        });
        return total;
    }

    function getBestTime(locId) {
        const days = visitorData[locId]?.days || [];
        let best = days[0];
        days.forEach(day => { if (day.visitors < best.visitors) best = day; });
        return best;
    }

    function showDetails(location) {
        const current = visitorData[location.id]?.days[selectedDayIndex]?.visitors || 0;
        const best = getBestTime(location.id);
        const status = current < 30 ? 'Calm' : current < 0 ? 'Moderate' : 'Busy';
        
        const modal = document.createElement('div');
        modal.id = 'location-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem';
        modal.innerHTML = `
            <div style="background:white;padding:2.5rem;border-radius:16px;max-width:90%;max-height:90%;overflow:auto;color:#333;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
                <h2 style="color:#248BCC;margin-top:0">${location.name}</h2>
                <p><strong>Description:</strong> ${location.description}</p>
                <p><strong>Today (${dayNames[selectedDayIndex]}):</strong> 
                    <span style="color:${status==='Calm'?'#2ecc71':status==='Moderate'?'#f39c12':'#e74c3c'};font-weight:bold;font-size:1.1rem">${status}</span> 
                    (${current} visitors)
                </p>
                <p><strong>Best time:</strong> <strong>${best.day}</strong> ~10AM (${best.visitors} expected)</p>
                <button onclick="this.parentElement.parentElement.remove()" style="background:#248BCC;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:1rem;width:100%;margin-top:1.5rem">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function updateDisplay() {
        const day = dayNames[selectedDayIndex];
        if (selectedDayEl) selectedDayEl.textContent = day;
        if (comparisonDayEl) comparisonDayEl.textContent = day;
        
        document.querySelectorAll('.day-marker')?.forEach((m,i) => m.classList.toggle('active', i===selectedDayIndex));
        updateStats();
        updateTouristOverview();
        updateChart();
    }

    function updateStats() {
        if (!crowdStatusEl || !recommendationEl) return;
        const data = visitorData.kapellbrücke?.days[selectedDayIndex];
        if (!data) return;
        
        const count = data.visitors;
        let status, rec;
        if (count < 50) { status = 'Calm'; rec = 'Perfect!'; }
        else if (count < 100) { status = 'Moderate'; rec = 'OK'; }
        else { status = 'Busy'; rec = 'Avoid'; }
        
        crowdStatusEl.textContent = status;
        crowdStatusEl.className = `stat-value ${status.toLowerCase()}`;
        recommendationEl.textContent = rec;
    }

    function updateTouristOverview() {
        if (!touristOverviewEl) return;
        const total = getTotalVisitorsToday();
        const avg = Math.round(total / locations.length);
        const status = total < 200 ? 'Calm' : total < 400 ? 'Moderate' : 'Busy';
        
        if (totalVisitorsEl) totalVisitorsEl.textContent = total;
        if (overviewStatusEl) {
            overviewStatusEl.textContent = status;
            overviewStatusEl.className = `overview-status ${status.toLowerCase()}`;
        }
        if (avgLocationEl) avgLocationEl.textContent = `Average ${avg}/location`;
        touristOverviewEl.style.display = 'block';
    }

    function updateChart() {
        if (!chartEl) return;
        const maxToday = Math.max(...locations.map(loc => visitorData[loc.id]?.days[selectedDayIndex]?.visitors || 0));
        const scaleFactor = maxToday > 0 ? 40 / maxToday : 1;
        
        chartEl.innerHTML = `
            <div style="display:flex;
                justify-content:center;
                gap:1rem;
                margin-bottom:2rem;
                padding:1.2rem;
                background:rgba(255,255,255,0.08);
                border-radius:12px;
                color:white;font-size:0.95rem;
                flex-wrap:wrap;
                text-align:center">
            <div style="display:flex;
                align-items:center;
                gap:0.5rem">
                <span style="width:16px;
                      height:5px;
                      background:#2ecc71;
                      border-radius:3px"></span>Calm (<30)</div>
                <div style="display:flex;
                     align-items:center;
                     gap:0.5rem">
                     <span style="width:16px;
                     height:10px;
                     background:#f39c12;
                     border-radius:3px">
                     </span>Moderate (30-80)</div>
                <div style="display:flex;align-items:center;gap:0.5rem"><span style="width:16px;height:15px;background:#e74c3c;border-radius:3px"></span>Busy (80+)</div>
            </div>
        `;

        locations.forEach(loc => {
            const data = visitorData[loc.id]?.days[selectedDayIndex];
            if (!data) return;
            
            const count = data.visitors;
            const colorClass = count < 30 ? 'location-bar-quiet' : count < 80 ? 'location-bar-moderate' : 'location-bar-busy';
            const height = Math.min(4, (count * 4 ));
            
            

            const container = document.createElement('div');
            container.className = 'location-bar-container';
            container.title = `${loc.name}: ${count} visitors`;
            
            const bar = document.createElement('div');
            bar.className = `location-bar ${colorClass}`;
            bar.style.height = `${height}%`;
            bar.innerHTML = `<span>${count}</span>`;
            bar.onclick = () => showDetails(loc);
            
            const label = document.createElement('div');
            label.className = 'location-label';
            label.textContent = loc.shortName;
            
            container.appendChild(bar);
            container.appendChild(label);
            chartEl.appendChild(container);
        });
    }

    // ★ INIT: API + Fallback ★
    try {
        const apiData = await getWeeklyAverages();
        if (apiData && Object.keys(apiData).length > 0) {
            convertToUIData(apiData);
            if (recBoxEl) recBoxEl.innerHTML = '<p style="color:var(--secondary-color);font-style:italic"> Real data from last 30 days </p>';
        } else {
            generateSampleData();
            if (recBoxEl) recBoxEl.innerHTML = '<p style="color:#f39c12;font-style:italic"> Sample data - API temporarily unavailable</p>';
        }
    } catch(e) {
        generateSampleData();
        if (recBoxEl) recBoxEl.innerHTML = '<p style="color:#e74c3c;font-style:italic"> API error - using sample data</p>';
        console.error('Init error:', e);
    }

    // Events
    if (slider) slider.oninput = () => { selectedDayIndex = +slider.value; updateDisplay(); };
    
    if (dayMarkersEl) {
        dayNames.forEach((day, i) => {
            const marker = document.createElement('div');
            marker.className = 'day-marker';
            marker.textContent = day.slice(0,3).toUpperCase();
            marker.onclick = () => { 
                selectedDayIndex = i; 
                if (slider) slider.value = i; 
                updateDisplay(); 
            };
            dayMarkersEl.appendChild(marker);
        });
    }
    
    updateDisplay();
});
