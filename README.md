##How to avoid people in lucerne

## 1. Projektbeschreibung  

Die Website "How to avoid people in lucerne" visualisiert Besucherzahlen anhand eines interaktiven Sliders, mit dem sich verschiedene Tage auswählen lassen. Ziel war es, eine intuitive und klare Darstellung der Daten zu schaffen – sowohl für Desktop als auch für mobile Geräte.  

Während der Entwicklung stand insbesondere die Benutzerfreundlichkeit im Vordergrund: Die Anwendung soll den Nutzerinnen und Nutzern auf einen Blick zeigen, wie sich die Besucherzahlen anhand den Daten der letzen 30 Tagen verhalten wird. 


## 2. Herausforderungen  

Die **grösste Schwierigkeit** lag in der Umsetzung des **Day‑Selectors**. Der ursprüngliche Slider brachte das Markup mehrfach durcheinander, wodurch die Initialisierung des JavaScript‑Skripts fehlschlug und das Skript zeitweise gar nicht mehr geladen wurde.  

Beim Umbau des Sliders auf eine alternative Lösung musste ich meinen Code mehrmals stark anpassen, was zu wiederholten Debugging‑Runden führte. Zusätzliche Schwierigkeiten bereiteten mir die **Balken der einzelnen Standorte**: Die unterschiedlichen Längen, Bezeichnungen und der verfügbare Platz waren insbesondere in der responsiven mobilen Ansicht anspruchsvoll, da Lesbarkeit, Klarheit und Layout gleichzeitig stimmen mussten.  

Eine weitere Schwierigkeit waren die Standortbalken so hinzu bekommen, wie geplant. In der Vertikale funktionierte die Visualisierung gut, doch in der mobilen Darstellung war es schwierig, Überlappungen zu vermeiden und die Labels der Standorte sauber auszurichten. Unter Zeitdruck entschied ich mich für einen Kompromiss: Die aktuelle mobile Darstellung ist funktional und verständlich, aber noch nicht so ausgereift, wie ursprünglich geplant.  

Meine Idee, die **Kappelbrücke als Hintergrund für die Balken** einzusetzen, musste ich leider verwerfen, da sie die Lesbarkeit und Performance negativ beeinflusste.  



## 3. Learnings  

Ich bin während des Projekts oft an meine Grenzen gestossen – und gerade dadurch habe ich am meisten gelernt. Mit Unterstützung von Lea, verschiedenen Online‑Tutorials und dem Einsatz von KI konnte ich viele Probleme selbständig lösen und habe die vorgeschlagenen Lösungen jeweils nachvollzogen, anstatt sie nur zu übernehmen.  

Zu den wichtigsten Learnings zählen:  
- GitHub Pages zum **Deployment** einer Website zu nutzen.  
- In **Figma** erste **Prototypen** zu gestalten und Designs zu testen.  
- Eine erste **Datenbank** anzulegen und zu verstehen, wie Daten strukturiert gespeichert und wieder ausgelesen werden können (z.B. mit SQL).  
- Das **Hosting mit Infomaniak** kennenzulernen, inklusive Einrichtung von Webhosting und Datenbank für eine eigene Website.  
- APIs systematisch zu testen und in die Anwendung einzubinden.  
- Fehler konsequent zu debuggen und Code‑Strukturen zu überarbeiten.  


## 4. Weitere Schwierigkeiten  

Einige Punkte sind noch **nicht vollständig gelöst**:  
- Der Slider läuft technisch, aber nicht perfekt.  
- Die Standortnamen weisen leichte Abweichungen auf.  
- Die eine Höhenangabe ist immer noch im untersuchen zu sehen, obwohl ich es aus meinem Code rausgestrichen habe. 

Trotzdem spiegelt das Ergebnis den grössten Teil meiner Lernreise wider – und darauf bin ich stolz.  



## 5. Ressourcen  

**Tools & Technologien**  
- Figma (Prototyping)  
- JavaScript, HTML, CSS, PHP, SQL  
- GitHub & GitHub Pages  
- Perplexity (Debugging‑Unterstützung)  
- Datenbank (z.B. MySQL/MariaDB)  
- Infomaniak (Webhosting)  
