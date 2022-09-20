import fetch from "node-fetch";
import inquirer from "inquirer";

// we cheat by downloading the list of plausible words
// otherwise we could use 'npm i all-the-german-words'
//
// we could improve this by only downloading the words once and cache them on the hard disk
const downloadWords = async () => {
  const response = await fetch("https://6mal5.com/wortify/data/words.csv");
  const words = await response.text();
  return words.split("\r\n");
};

const run = async () => {
  const words = await downloadWords();

  return inquirer
    .prompt([
      {
        type: "input",
        name: "orangeCharacter",
        message: "Wie lautet der orangene Buchstabe?",
        validate: (input) => {
          return new RegExp(/^[a-z]$/gi).test(input);
        },
        transformer: (input) => input.toLowerCase(),
      },
      {
        type: "input",
        name: "otherCharacters",
        message: "Wie lauten die anderen Buchstaben",
        validate: (input) => {
          return input.length === 6;
        },
        transformer: (input) => input.replaceAll(/[^a-z]/gi, ""),
      },
    ])
    .then(({ orangeCharacter, otherCharacters }) => {
      const allCharacters = orangeCharacter + otherCharacters;
      const matches = words.filter((word) => {
        const wordInLowerCase = word.toLowerCase();

        // only use the words with the orange character
        if (wordInLowerCase.includes(orangeCharacter)) {
          // each character in the word ...
          const characters = wordInLowerCase.split("");
          // ... has to be one of the entered characters
          return characters.every((char) => allCharacters.includes(char));
        } else {
          return false;
        }
      });
      return matches.sort((wordA, wordB) => wordA.length - wordB.length);
    })
    .catch((error) => console.error(error));
};

run()
  .then((matches) => {
    console.log(`Es wurden ${matches.length} Treffer gefunden:`);
    matches.forEach((match) => {
      console.log(`  ${match}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
