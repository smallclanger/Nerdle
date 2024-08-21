import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let allGuesses = [];
let allWordGuesses = [];
var now = new Date();
var fullDaysSinceEpoch = Math.floor(now / 8.64e7);

let indexForTodaysWord = fullDaysSinceEpoch % WORDS.length;
console.log("day=" + fullDaysSinceEpoch.toString() + " index=" + indexForTodaysWord.toString());
rightGuessString = WORDS[indexForTodaysWord];
console.log(rightGuessString);
let succeeded = false;

let currentStreak = 0;
let lastSuccessDay = 0;

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < rightGuessString.length; j++) {
            let box = document.createElement("div");
            if (isSpecialCharacter(rightGuessString[j])) {
                box.className = "space-box";
                box.textContent = rightGuessString[j];
            }
            else
                box.className = "letter-box";

            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function isSpecialCharacter(c) {
    return " -'/.".includes(c);
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            if (color === "green" || color === "gray")
                elem.style.color = "white";
            let oldColor = elem.style.backgroundColor;
            if (oldColor === "green") {
                return;
            }

            if (oldColor === "orange" && color !== "green") {
                return;
            }

            elem.style.backgroundColor = color;
            break;
        }
    }
}

function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;

    // this only handles single special characters - if there were two together we would need to make this a loop
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log('delete special one!');
        let box = row.children[nextLetter - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
        nextLetter -= 1;
    }
}

// change to check guess (index)
function checkGuess(rowIndex) {
    let row = document.getElementsByClassName("letter-row")[rowIndex];
    let guessString = "";
    let rightGuess = Array.from(rightGuessString);

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != rightGuessString.length) {
        toastr.error("Not enough letters!");
        return;
    }

    /*if (!WORDS.includes(guessString)) {
      toastr.error("Word not in list!");
      return;
    }*/

    allWordGuesses.push(guessString);

    var letterColor = [];
    for (let lc = 0; lc < rightGuessString.length; lc++)
        letterColor.push("gray");

    // check green
    for (let i = 0; i < rightGuessString.length; i++) {
        if (rightGuess[i] == currentGuess[i]) {
            letterColor[i] = "green";
            rightGuess[i] = "#";
        }
    }

    //check yellow
    //checking guess letters
    for (let i = 0; i < rightGuessString.length; i++) {
        if (letterColor[i] == "green") continue;

        // checking right letters
        for (let j = 0; j < rightGuessString.length; j++) {
            if (rightGuess[j] == currentGuess[i]) {
                letterColor[i] = "orange";
                rightGuess[j] = "#";
            }
        }
    }

    // Build colour boxes for share data
    let colorBoxes = [];
    for (let i = 0; i < letterColor.length; i++) {
        if (letterColor[i] === "green")
            colorBoxes.push("🟩");
        else if (letterColor[i] === "orange")
            colorBoxes.push("🟨");
        else
            colorBoxes.push("⬛");
    }

    allGuesses.push(colorBoxes);

    for (let i = 0; i < rightGuessString.length; i++) {
        if (isSpecialCharacter(guessString[i])) continue;
        let box = row.children[i];
        let delay = 125 * i;
        setTimeout(() => {
            //flip box
            animateCSS(box, "flipInX");
            //shade box
            box.style.backgroundColor = letterColor[i];
            shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
        }, delay);
    }

    if (guessString === rightGuessString) {
        succeeded = true;
        
        guessesRemaining = 0;
        
        if(lastSuccessDay != indexForTodaysWord )
        {
          // increase streak
          currentStreak++;
          lastSuccessDay = indexForTodaysWord;
        }

        showResult(rightGuessString);        

        storeSession();

        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
          currentStreak=0;          
      
            showResult(rightGuessString);                
        }

        storeSession();
    }
}

function showResult(correctWord) {
    if(succeeded)
    {
        document.getElementById("myForm").style.backgroundColor = 'rgb(112, 216, 91)'; 
        
        document.getElementById("resultLabel").innerText = "You guessed right! Game over! Current streak:"+currentStreak.toString();        
    }
    else
    {
        document.getElementById("myForm").style.backgroundColor = 'rgb(247, 47, 40)'; 
        document.getElementById("resultLabel").innerText = "You've run out of guesses! Game over!";
    }

    document.getElementById("correctWord").innerText = correctWord;
    document.getElementById("myForm").style.display = "grid";
}

function insertLetter(pressedKey) {
    if (!((pressedKey.charCodeAt(0) >= 48 && pressedKey.charCodeAt(0) <= 57) || (pressedKey.charCodeAt(0) >= 97 && pressedKey.charCodeAt(0) <= 122))) {
        console.log('not valid character');
        return;
    }

    if (nextLetter === rightGuessString.length) {
        console.log("hit end of length of [" + rightGuessString + "] nextLetter=" + nextLetter.toString());
        return;
    }

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;

    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log("jumping over next character as it is special " + rightGuessString[nextLetter]);
        currentGuess.push(rightGuessString[nextLetter]);
        nextLetter += 1;
    }

    storeSession();
}

function storeSession() {
    localStorage.setItem("val_allWordGuesses", JSON.stringify(allWordGuesses));
    localStorage.setItem("val_indexForTodaysWord", JSON.stringify(indexForTodaysWord));

    localStorage.setItem("val_currentStreak", JSON.stringify(currentStreak));
    localStorage.setItem("val_lastSuccessDay", JSON.stringify(lastSuccessDay));
}

const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element;
        node.style.setProperty("--animate-duration", "0.3s");

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        return;
    }

    let found = pressedKey.match(/[a-z0-9]/gi);
    console.log(found);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }
    let key = target.textContent;

    if (key === "Del") {
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

document.getElementById("myForm").addEventListener("click", (e) => {
    const target = e.target;
    
    if (target.classList.contains("fa-close")) {
        document.getElementById("myForm").style.display = "none";
        return;
    }

    if (!target.classList.contains("share-btn")) {
        return;
    }

    let textToShare = "Nerdle " + indexForTodaysWord.toString();
    if (succeeded) textToShare = textToShare + " " + allGuesses.length.toString() + "/"+NUMBER_OF_GUESSES+"\r\n";
    else textToShare = textToShare + " X/"+NUMBER_OF_GUESSES+"\r\n";
    for (let i = 0; i < allGuesses.length; i++) {
        for (let l = 0; l < allGuesses[i].length; l++) {
            textToShare = textToShare + allGuesses[i][l];
        }

        textToShare = textToShare + "\r\n";
    }

    console.log(textToShare);

    if (navigator.share) {
        navigator.share({
            text: textToShare,
            title: 'Nerdle result',
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);
    } else {
        // fallback
    }

});

window.onload = function () {
    let tempWordGuesses = JSON.parse(localStorage.getItem("val_allWordGuesses"));
    currentStreak = JSON.parse(localStorage.getItem("val_currentStreak",));
    lastSuccessDay = JSON.parse(localStorage.getItem("val_lastSuccessDay"));

    if(currentStreak===null) currentStreak=0;
    if(lastSuccessDay===null) lastSuccessDay=0;
    if(!(indexForTodaysWord === 0 && lastSuccessDay === WORDS.length-1) &&
        indexForTodaysWord-lastSuccessDay>1)
        {
            console.log("Streak ended - not played for at least a day");
            currentStreak=0;
        }

    if (tempWordGuesses === null || localStorage.getItem("val_indexForTodaysWord") != indexForTodaysWord) {
        console.log("resetting guess");
    }
    else {
        for (let i = 0; i < tempWordGuesses.length; i++) {
            let row = document.getElementsByClassName("letter-row")[i];
            currentGuess = tempWordGuesses[i];
            for (let l = 0; l < tempWordGuesses[i].length; l++) {
                let box = row.children[l];
                animateCSS(box, "pulse");
                box.textContent = tempWordGuesses[i][l];
                box.classList.add("filled-box");
            }

            checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        }
    }

    (document.getElementById("game-number")).innerText = "Game: " + indexForTodaysWord.toString() + " / "+ WORDS.length.toString() + " Streak:"+ currentStreak.toString();
}

initBoard();
