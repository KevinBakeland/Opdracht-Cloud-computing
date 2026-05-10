/**
 * News Ticker Module
 * Handelt de willekeurige headlines af met extra tussenruimte voor een "pauze" effect.
 */

const newsHeadlines = [
    "+++ AAPL: Apple kondigt revolutionaire AI-integratie aan in nieuwe iPhone-update +++",
    "+++ TSLA: Gigafactory productie overtreft kwartaalverwachtingen met 15% +++",
    "+++ KEVB: Kevin Coin bereikt nieuwe recordhoogte na massale adoptie +++",
    "+++ CATS: CryptoCats volume stijgt met 400% in laatste 24 uur na exchange listing +++",
    "+++ MARKTVREES: FED hint op stabiele rente, markten reageren optimistisch +++",
    "+++ WHALE ALERT: Grote hoeveelheid KEVB verplaatst naar koude wallet +++",
    "+++ ANALISTEN: 'TSLA koersdoel verhoogd naar recordhoogte door nieuwe batterijtech' +++",
    "+++ KEVB: Community bereikt mijlpaal van 100.000 actieve houders +++",
    "+++ BREAKING: Elon Musk plaatst mysterieuze emoji, koersen CATS reageren direct +++",
    "+++ TECH NEWS: AAPL werkt aan eigen metaverse-bril prototype +++",
    "+++ BREAKING: Kevin krijgt 100/100 op deze opdracht"
];

function updateNewsTicker() {
    // 1. Schud de lijst voor echte willekeur
    const shuffled = [...newsHeadlines].sort(() => 0.5 - Math.random());
    
    // 2. Voeg aan ELKE headline een enorme ruimte toe (simuleert de 2 seconden pauze)
    // We gebruiken een speciale spatie-karakter (\u00A0) die niet door HTML wordt genegeerd
    const spacedHeadlines = shuffled.map(text => text + "\u00A0".repeat(100));
    
    // 3. Voeg ze samen tot één lange string
    const selected = spacedHeadlines.join("");
    
    const tickerEl = document.getElementById('news-content');
    if (tickerEl) {
        tickerEl.innerText = selected;
    }
}

// Initialiseer de ticker
window.addEventListener('DOMContentLoaded', () => {
    updateNewsTicker();
    
    // Ververs de headlines om de 2 minuten voor nieuwe willekeur
    // Dit gebeurt op de achtergrond zonder dat de animatie verspringt
    setInterval(updateNewsTicker, 120000);
});