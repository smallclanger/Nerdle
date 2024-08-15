import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let allGuesses = [];
let allWordGuesses = [];
var now = new Date();
var fullDaysSinceEpoch = Math.floor(now/8.64e7);

let indexForTodaysWord = fullDaysSinceEpoch % WORDS.length;
console.log("day="+fullDaysSinceEpoch.toString()+" index="+indexForTodaysWord.toString());
rightGuessString = WORDS[indexForTodaysWord];
console.log(rightGuessString);
let succeeded = false;

function initBoard() {

    let labelElement = document.getElementById("game-number");

    labelElement.innerText = "Game: " + indexForTodaysWord.toString();

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

function isSpecialCharacter(c)
{
	let specialChars = " -'/."
	return specialChars.includes(c);
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
		if(color==="green" ||  color ==="gray")
			elem.style.color="white";
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
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
  
  
   if(isSpecialCharacter(rightGuessString[nextLetter])) 
  {
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
    console.log("added [" + guessString + "] to array. Length now=" + allWordGuesses.length);
    console.log("words=" + allWordGuesses.length.toString());
    for (let i = 0; i < allWordGuesses.length; i++) {
        console.log(allWordGuesses[i]);
    }
    var letterColor = [];
    for (let lc = 0; lc < rightGuessString.length; lc++)
        letterColor.push("gray");
    //check green
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

        //checking right letters
        for (let j = 0; j < rightGuessString.length; j++) {
            if (rightGuess[j] == currentGuess[i]) {
                letterColor[i] = "orange";
                rightGuess[j] = "#";
            }
        }
    }

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
        showResult("You guessed right! Game over!");

        toastr.success("You guessed right! Game over!");

        guessesRemaining = 0;
        storeSession();

        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;
        storeSession();

        if (guessesRemaining === 0) {
            showResult("You've run out of guesses! Game over!" + `The right word was: "${rightGuessString}"`);

            toastr.error("You've run out of guesses! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);

        }
    }
}

function showResult(resultText)
{
	 let labelElement = document.getElementById("resultLabel");
	 document.getElementById("myForm").style.display = "block";
	 labelElement.innerText = resultText;
}

function insertLetter(pressedKey) {
    if (!((pressedKey.charCodeAt(0) >= 48 && pressedKey.charCodeAt(0) <= 57) || (pressedKey.charCodeAt(0) >= 97 && pressedKey.charCodeAt(0) <= 122))) {
        console.log('no char');
        return;
    }

    if (nextLetter === rightGuessString.length) {
        console.log("hit end of length of [" + rightGuessString+"] nextLetter="+nextLetter.toString());
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

function storeSession()
{
	localStorage.setItem("val_currentGuess", currentGuess);
    localStorage.setItem("val_allGuesses", JSON.stringify(allGuesses));
	localStorage.setItem("val_guessesRemaining", guessesRemaining);
    localStorage.setItem("val_nextLetter", nextLetter);
    localStorage.setItem("val_allWordGuesses", JSON.stringify(allWordGuesses));
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

  if (!target.classList.contains("share-btn")) {
    return;
  }
  
  let textToShare = "Nerdle "+indexForTodaysWord.toString();
  if( succeeded) textToShare = textToShare+" "+  allGuesses.length.toString()+"/6\r\n";
  else textToShare = textToShare+" X/6\r\n";
  for(let i =0; i<allGuesses.length;i++)
  {
	  for(let l=0;l<allGuesses[i].length;l++)
	  {
		  textToShare = textToShare +allGuesses[i][l];
	  }
	  textToShare = textToShare +"\r\n";
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

window.onload = function() {
  
	//currentGuess = localStorage.getItem("val_currentGuess");
 //   allGuesses = JSON.parse(localStorage.getItem("val_allGuesses"));
	//guessesRemaining = localStorage.getItem("val_guessesRemaining");
   // nextLetter = localStorage.getItem("val_nextLetter");
    allWordGuesses = JSON.parse(localStorage.getItem("val_allWordGuesses"));
	if(currentGuess===null)
	{
		console.log("resetting guess");
		currentGuess = [];
		guessesRemaining = NUMBER_OF_GUESSES;
		nextLetter = 0;
		allGuesses = [];
        allWordGuesses = [];
        
	}
	else
    {
        allGuesses = [];
        guessesRemaining = NUMBER_OF_GUESSES;
        let tempWordGuesses = allWordGuesses;
        allWordGuesses = [];
        console.log("words=" + tempWordGuesses.length.toString());
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
		// paint lines
		
		//show letters current guess
	}
    console.log("currentguess=" + currentGuess.length.toString());
    console.log("nextLetter=" + nextLetter);
    console.log("guessesRemaining=" + guessesRemaining);
    // ...
}

initBoard();
