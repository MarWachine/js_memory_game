'use strict';
/* TO DO:
 * -
 * OPTIONAL:
 * - Anzeige Highscores, Auslesen aus dem LocalStorage
 * - Abspeichern des Spielernamens, Verwendung im Highscore
 * - Galerie zum Anteasern der Decks
 */
// __________________________________________________________________________
// #### Globale DEKLARATIONEN ####

let min = 4;                                                    // Minimum Paare
let max = 12;                                                   // Maximum Paare
let inputPairs = 12;                                            // Default-Wert für Anzahl der Paare

let cellHeight = 156;
let contentHeight = 700;

let pairs = 0;                                                  // Verbleibende Paare
let actions = 0;                                                // Benötigte Züge
let faceUp = 0;                                                 // Anzahl aufgedeckter Karten

let cols = 0;
let rows = 0;

let chosenDeck = false;                                         // Default des gewählten Decks
let cardBack = false;                                           // Default Kartenrücken
let fieldBG = false;                                            // Default Spielbrett

let arrRnd = [];                                                // Zufällig angeordnete Frontseiten aus arrDraft[]
let arrRound = [];                                              // Verdopplung der Karten in arrRnd[]

const cardPool = {};                                            // Objekt für alle Karten aus der JSON-Datei
let arrDraft = [];                                              // Array der Frontseiten des ausgewählten Decks       

const elements = {};                                            // domMapping-Objekt

// let highscore = [];

// let username = 'Anonymer Spieler';



// #### MAPPING ####

const domMapping = () => {
    elements.body = document.body;
    elements.main = document.querySelector('#main');
    elements.options = document.querySelector('#options');
    elements.content = document.querySelector('#content');
    elements.highscore = document.querySelector('#highscore');
    elements.cells = Array.from(document.querySelectorAll('th'));
    elements.faceup = Array.from(document.querySelectorAll('.faceup'));
    elements.facedown = Array.from(document.querySelectorAll('.facedown'));
    elements.message = document.querySelector('#message');
    elements.actions = document.querySelector('#actions');
    elements.paare = document.querySelector('#paare');
    elements.zuege = document.querySelector('#zuege');
    elements.selectpairs = document.querySelector('#selectpairs');
    elements.pairchoice = document.querySelectorAll('.pairchoice');
    elements.option = Array.from(document.querySelectorAll('option'));
    elements.found = document.querySelector('#found');
    elements.decks = Array.from(document.querySelectorAll('.deck'));
    elements.chosendeck = document.querySelector('.chosendeck');
    elements.startgame = document.querySelector('#startgame');
    elements.foundpair = Array.from(document.querySelectorAll('.foundpair'));
    elements.squeezed = Array.from(document.querySelectorAll('.squeezed'));
    elements.extended = Array.from(document.querySelectorAll('.extended'));
//    elements.namearea = document.querySelector('.namearea');
//    elements.popup = document.querySelector('.popup');
}

// const appendEventlisteners = () => { }

// __________________________________________________________________________
// #### Create-Funktion zum Anlegen von DOM-Elementen ####

const create = (
    content = false,
    parent = elements.content,
    clss = false,
    type = 'div',
    first = false
) => {
    const newEl = document.createElement(type);
    if (content) newEl.innerHTML = content;
    if (clss) newEl.classList.add(clss);
    if (parent) parent.append(newEl);
    if (first) parent.prepend(newEl);
    return newEl;
}

// __________________________________________________________________________
// ### EINSTELLUNGEN (linke Seite) ###

//Anzahl der Paare festlegen
const setPairs = evt => {
    let target = evt.currentTarget;
    inputPairs = target.innerHTML;
//  loadPairScore();
}

// Auswahl der Paare
const fillSelect = () => {
    for (let i = max; i >= min; i -= 2) {
        let option = create(i, elements.selectpairs, 'pairchoice', 'option');
        option.addEventListener('click', setPairs);
    }
}

// clickHandler der Deck-Auswahl, der die Zwischenspeicherung im Array auslöst
const chooseDeck = evt => {
    let target = evt.currentTarget;
    if (elements.chosendeck) {
        let previousDeck = elements.chosendeck;
        previousDeck.classList.remove('chosendeck');            // vorheriger Auswahl wird die aktive Klasse entfernt
    }
    target.classList.add('chosendeck');
    elements.chosendeck = document.querySelector('.chosendeck');    // neuer Auswahl wird die Klasse verliehen
    let deckP = target.querySelector('p');
    chosenDeck = deckP.innerHTML;                                   // Decknamen auslesen
    if (elements.startgame.classList.contains('blocked')) {
        elements.startgame.addEventListener('click', startGame);
        elements.startgame.classList.remove('blocked');
        elements.startgame.classList.add('unblocked');
    }
}

// draftDeck speichert die Bilder des ausgewählten Decks im global deklarierten Array
const draftDeck = evt => {
    let pool = cardPool.pool;
    for (let i = 0; i < pool.length; i++) {
        if (evt == pool[i].title) {                                 // Abgleich des Decknamens mit dem Titel im Kartenpool
            arrDraft = Array.from(pool[i].front);                   // Befüllen des Drafts mit den Frontseitenbildern dieses Objekts
            cardBack = `url(${pool[i].back})`;                      // Festlegen des Kartenrückens

            // Hier den entsprechenden Slider aktivieren
        }
    }
}

// shuffleDeck mischt das Array noch einmal zufällig durch
const shuffleDeck = evt => {
    let curIndex = evt.length
    let rndIndex = 0;

    while (curIndex != 0) {                                                 // "Fisher-Yates Shuffle"
        rndIndex = ~~(Math.random() * curIndex);                              // zufälliger Index und Index auf letzter Stelle des Array
        curIndex--;                                                           // Letzterer rückt mit jedem Durchlauf eine Stelle vor
        [evt[curIndex], evt[rndIndex]] = [evt[rndIndex], evt[curIndex]];   // Tauscht den Inhalt, auf den curIndex zeigt, mit dem an einer zufälligen Stelle
    }
    return evt;                                                             // Durchgemischtes Array zurückgeben
}

// setRound befüllt arrRnd in zufälliger Reihenfolge mit Karten des gewählten Decks
const setRound = () => {
    arrRnd = [];
    arrRound = [];
    for (let i = 0; i < inputPairs; i++) {              // Schleife für die Anzahl der gewählten Karten
        let rndex = ~~(Math.random() * inputPairs);
        let rnDraft = arrDraft[rndex];
        if (arrRnd.length == 0) {                       // Falls das Array noch leer ist, einfach pushen
            arrRnd.push(rnDraft);
            arrRound.push(rnDraft);
            arrRound.push(rnDraft);
        }
        else {                                          // falls nicht, für jeden Index iterieren und auf Gleichheit prüfen
            let duplicate = false;
            for (let j = 0; j < arrRnd.length; j++) {
                if (arrRnd[j] == rnDraft) {
                    duplicate = true;
                }
            }
            if (!duplicate) {                           // nur wenn nicht doppelt, wird gepusht
                arrRnd.push(rnDraft);
                arrRound.push(rnDraft);
                arrRound.push(rnDraft);
            }
            else i--;                                   // sonst Schleifendurchlauf abziehen und neu erzeugen
        }
    }

}

// startGame soll per Button Click alle übermittelten Daten
// der Einstellungen verwenden, um das Spielfeld aufzuziehen

const startGame = () => {
    elements.faceup = [];                                       // Arrays und Variablen im global scope zurücksetzen
    elements.facedown = [];
    elements.cells = [];
    elements.squeezed = [];
    elements.extended = [];
    faceUp = 0;
    let oldField = elements.content.querySelector('table');     // falls altes Spielfeld besteht, entfernen
    if (oldField) oldField.remove();
    draftDeck(chosenDeck);
    setFieldBG(chosenDeck);                                     // Spielbrett je nach Deck auswählen
    calcField(inputPairs);                                      // neuen Aufbau berechnen           
    setRound();                                                 // zufällige Befüllung des Runden-Arrays
    shuffleDeck(arrRound);
    setTimeout(buildField, 1000);
    countPairs();
    actions = 0;                                                // Aktionen zurücksetzen und wieder ausgeben
    countActions();
    for (let found of elements.foundpair) found.remove();       // gefunden Paare (unten) entfernen

}


// __________________________________________________________________________
// #### IMPORT der Karten aus JSON-Datei ###

// JSON-Daten laden
const renderDecks = data => {
    for (let decks of data) {
        const deck = create(false, elements.options, 'deck', 'div');
        deck.style.backgroundImage = `url(${decks.back})`;         // Vergabe des Kartenrückens
        cardBack = deck.style.backgroundImage;
        deck.addEventListener('click', chooseDeck);

        create(decks.title, deck, false, 'p');
        elements.decks.push(deck);
    }
}

// Verarbeiten der geladenen JSON-Daten
const processDecks = evt => {
    const xhr = evt.target;
    if (xhr.status == 200) {
        let data = JSON.parse(xhr.responseText);
        renderDecks(data);
        cardPool.pool = data;                                     // <--  Hier wird der Pool befüllt
    } else console.warn(xhr.status, xhr.statusText);
}

// Laden der Decks aus der JSON-Datei
const loadDecks = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `./cards.json`);
    xhr.addEventListener('load', processDecks);
    xhr.send();
}

// __________________________________________________________________________
// #### AUFBAU des Spielfeldes ####

// Hintergrundbild je nach Kategorie laden
const setFieldBG = evt => {
    let pool = cardPool.pool;
    for (let i = 0; i < pool.length; i++) {
        if (evt == pool[i].title) fieldBG = `url(${pool[i].content})`;
    }
    elements.content.style.backgroundImage = fieldBG;
}

// Berechnung der optimalen Darstellung des Spielfelds
// Reihen
const calcRows = (input) => {
    let rows = 2;
    for (let i = rows; i <= input / 2; i++) {
        if ((input * 2) % i == 0) rows = i;
    }
    return rows;
}

// Spalten
const calcCols = (input) => {
    let cols = input * 2 / rows;
    return cols;
}

// calcField sorgt dafür, dass das Spielfeld immer im Querformat angelegt wird
const calcField = () => {
    pairs = inputPairs;
    rows = calcRows(inputPairs);
    cols = calcCols(inputPairs);
    if (rows > cols) {
        let temp = cols;
        cols = rows;
        rows = temp;
    }
}

// Tabelle mittig ausrichten
const centerField = () => {
    let fieldHeight = rows * cellHeight;
    console.log(fieldHeight, contentHeight);
    let marginTop = `${(contentHeight - fieldHeight) / 2}px`;
    return marginTop;
}

// Die Karten werden als Tabelle ausgelegt
const buildField = () => {
    let newField = create('', elements.content, '', 'table');
    newField.style.marginTop = centerField();
    console.log(newField.style.marginTop);
    for (let i = 0; i < rows; i++) {
        let newRow = create('', newField, '', 'tr');
        for (let j = 0; j < cols; j++) {
            setTimeout(() => {
                let newCell = create('', newRow, 'visible', 'th');
                newCell.classList.add('facedown');
                newCell.style.backgroundImage = cardBack;          // Kartenrückseite wird vergeben
                setCard(newCell);
                newCell.addEventListener('click', clickCard);
                elements.cells.push(newCell);                           // ausgelegte Karten werden im Array gespeichert
                elements.facedown.push(newCell);
            }, j + i * 200)                                    // Hier noch CSS-Klassen vergeben für Fade-in
        }
    }

}

// __________________________________________________________________________
// #### INTERAKTIONEN im Spiel ####

// Beim Klicken soll die Karte umgedreht werden.
const clickCard = evt => {
    let target = evt.currentTarget;
    let i = elements.cells.indexOf(target);                         // Index der Karte im Kartenarray
    flipCardStart(target);
    setTimeout(() => { target.style.backgroundImage = `url(${arrRound[i]}` }, 400);            // Abgleich der Indizes und Vergabe der Frontseite
    flipCardEnd(target);
    target.classList.remove('facedown');
    target.classList.add('faceup');
    target.removeEventListener('click', clickCard);
    elements.faceup.push(target);                                   // Faceup pushen
    faceUp++;
    if (faceUp == 2) {                                              // sobald zwei Karten aufgedeckt sind, erfolgt der Abgleich nach 1 Sekunde
        for (let card of elements.facedown) card.removeEventListener('click', clickCard);
        setTimeout(compareCards, 1500);
    };
}

// Offene Karten sollen miteinander verglichen werden
const compareCards = () => {
    let openCardOne = elements.faceup[0];
    let openCardTwo = elements.faceup[1];
    let bgOne = openCardOne.style.backgroundImage;
    let bgTwo = openCardTwo.style.backgroundImage;
    if (bgOne == bgTwo) {                                           // Übereinstimmung --> Karten werden entfernt, die Counter werden aktiv
        let foundpair = create('', elements.found, 'foundpair', 'div');
        foundpair.style.backgroundImage = bgOne;
        elements.foundpair.push(foundpair);
        flipCardStart(openCardOne);
        removeCard(openCardOne);
        flipCardStart(openCardTwo);
        removeCard(openCardTwo);
        pairs--;
        countPairs();
    }
    else {                                                          // keine Übereinstimmung --> Karten werden wieder verdeckt
        openCardOne.classList.remove('faceup');
        openCardOne.classList.add('facedown');
        flipCardStart(openCardOne);
        setTimeout(() => openCardOne.style.backgroundImage = cardBack, 400);
        flipCardEnd(openCardOne);
        openCardTwo.classList.remove('faceup');
        openCardTwo.classList.add('facedown');
        flipCardStart(openCardTwo);
        setTimeout(() => openCardTwo.style.backgroundImage = cardBack, 400);
        flipCardEnd(openCardTwo);
    }
    elements.faceup = [];                                           // Array mit aufgedeckten Elementen wieder leeren
    for (let card of elements.facedown) card.addEventListener('click', clickCard);
    faceUp = 0;
    actions++;
    countActions();                                                 // Die Versuche werden unabhängig vom Ergebnis hochgezählt.
}

// Beim Austeilen der Karten soll eine Animation erfolgen
const setCard = card => {
    card.classList.add('setcard');
    setTimeout(() => card.classList.remove('setcard'), 400);
}

// Beim Umdrehen der Karte soll eine Animation ablaufen
const flipCardStart = card => {
    card.classList.add('squeezed');
}

const flipCardEnd = card => {
    setTimeout(() => {
        card.classList.remove('squeezed');
        card.classList.add('extended');
    }, 400);
    setTimeout(() => card.classList.remove('extended'), 200);
}

// Bei Übereinstimmung werden die Karten unsichtbar und nicht-interaktiv
const removeCard = evt => {
    evt.removeEventListener('click', clickCard);
    evt.classList.remove('faceup');
    evt.classList.remove('facedown');
    evt.classList.remove('visible');
    evt.classList.add('invisible');
    elements.facedown = Array.from(document.querySelectorAll('.facedown'));
}

// __________________________________________________________________________
/* #### HIGHSCORE-Sektion - leider zeitlich nicht geschafft ####

// Die Bestenliste benötigter Züge soll für jede Schwierigkeitsstufe (4-12 Paare) individuell gespeichert und ausgegeben werden
const loadHighscore = () => {
    if (localStorage.getItem('scores')) {
        highscore = JSON.parse(localStorage.getItem('scores'));
    }
}

// Lädt den Highscore für die entsprechende Anzahl an Paaren
const loadPairScore = () => {
    loadHighscore();
    console.log(highscore);
    if (highscore.length > 0) {
        for (let i = 0; i < highscore.length; i++) {
            if (Number(highscore[i].pairs) == inputPairs) {
                let nameList = create('', elements.highscore, 'scorelist', 'ol');
                for (let entry in highscore[i].entries) {
                    create(entry.name, nameList, 'score', 'li');
                }
                let scoreList = create('', elements.highscore, 'scorelist', 'ul');
                for (let entry in highscore[i].entries) {
                    create(entry.actions, scoreList, 'score', 'li');
                }
            }

            else create('Keine Einträge', elements.highscore, false, 'p');
        }
    }
    else create('Keine Einträge', elements.highscore, false, 'p');
}
console.log(JSON.parse(localStorage.getItem('scores')));

// Speichert den Highscore im localStorage
const saveHighscore = () => {
    const score = {};
    score.name = username;
    score.actions = actions;                                            // <-- Falls es noch keine Einträge gibt, Struktur anlegen
    if (highscore.length > 0) {
        for (let i = 0; i < highscore.length; i++) {                    // <-- Falls es Einträge gibt, aber noch nicht für die Paarzahl
            if (highscore[i].pairs == inputPairs) {
                highscore[i].entries.push(score);
            }
            else {
                const newPairs = {};
                newPairs.pairs = Number(inputPairs);
                newPairs.entries = [];
                newPairs.entries.push(score);
                highscore.push(newPairs);
            }
        }
    }

    else {
        const newPairs = {};
        newPairs.pairs = Number(inputPairs);
        newPairs.entries = [];
        newPairs.entries.push(score);
        highscore.push(newPairs);
    }

    orderHighscore();
    localStorage.setItem('scores', JSON.stringify(highscore));
}

// Vor dem Speichern werden die Einträge sortiert
const orderHighscore = () => {
    for (let i = 0; i < highscore.length; i++) {
        let entries = highscore[i].entries;
        entries.sort((a, b) => a.actions - b.actions);
    }
}
*/

// __________________________________________________________________________
// ### COUNTER etc. ###

// Zähler verbleibender Paare
const countPairs = () => {                                          
    let pairMsg = elements.message;
    let pairCount = elements.paare;
    console.log(elements.paare);
    pairMsg.innerHTML = 'Verbleibende Paare:';
    pairCount.innerHTML = pairs;
    if (pairs == 0) {
        pairMsg.innerHTML = 'Geschafft!';
        pairCount.innerHTML = '';
//        firePopUp();
    }
}

// Zähler benötigter Züge
const countActions = () => {                                        
    let actionMsg = elements.actions;
    let actionCount = elements.zuege;
    actionMsg.innerHTML = 'Benötigte Züge:';
    actionCount.innerHTML = actions;
}

// Text, wenn noch kein Spiel gestartet wurde
const loadGreeting = () => {                                        
    elements.message.innerHTML = '';
    elements.actions.innerHTML = 'Bitte wähle dein Deck!';
}


/*// Funktion zum Eintrag im Highscore
const firePopUp = () => {
    const popUp = create('', document.body, 'popup', 'div');
    create('Geschafft!', popUp, 'grats', 'h3');
    create('Du hast', popUp, false, 'p');
    create(actions, popUp, false, 'h1');
    create('Züge benötigt.', popUp, false, 'p');
    create('Verewige dich im Highscore:', popUp, false, 'p');
    const nameArea = create('', popUp, 'namearea', 'input');
    nameArea.type = 'textarea';
    nameArea.placeholder = username;
    const nameSubmit = create('Eintragen', popUp, 'namesubmit', 'button');
    nameSubmit.addEventListener('click', saveEntry);
}

const saveEntry = () => {
    domMapping();
    if (elements.namearea.value) username = elements.namearea.value;
    elements.popup.remove();
    saveHighscore();
}
*/

// __________________________________________________________________________
// #### DCL INIT ####

const init = () => {
    domMapping();
//    appendEventlisteners();
    fillSelect();
    loadDecks();
    loadGreeting();
}

document.addEventListener('DOMContentLoaded', init);
