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

// Funktion aufrufen und Ergebnis anzeigen
getWeeklyAverages().then(result => {
    if (result) {
        console.log('Wöchentliche Durchschnitte der letzten 30 Tage:');
        console.log(result);
        
        // Schön formatiert ausgeben
        Object.keys(result).forEach(standort => {
            console.log(`\n${standort}:`);
            Object.keys(result[standort]).forEach(day => {
                console.log(`  ${day}: ${result[standort][day]} Passanten`);
            });
        });
    }
});
