const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");
const open = require("open");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const Spinner = require("cli-spinner").Spinner;

/** Output a nice welcom message in CLI :) */
console.log(
  chalk.green(
    figlet.textSync("Hello Cat Lover", {
      font: "Ghost",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

/** Prompt two questions to get the text from user */
const init = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "text1",
        message: "Hey, give me a text to create your cat ",
      },
      {
        type: "input",
        name: "text2",
        message: "Cool, I need a one more text to create a nice cat for you ",
      },
    ])
    .then((answers) => {
      getImage(answers.text1, answers.text2);
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(error);
      } else {
        console.log("something else went wrong :(");
      }
    });
};

async function getImage(text1, text2) {
  try {
    const spinner = new Spinner("Creating your cat card... %s");
    spinner.setSpinnerString("|/-\\");
    spinner.start();

    const path = Path.resolve(__dirname, "image", "my_cat_card.png");
    const writer = Fs.createWriteStream(path);

    const API_URL = `http://localhost:5500/api/cat?text1=${text1}&text2=${text2}`;

    const response = await Axios({
      url: API_URL,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    await open(path, { wait: true });
    spinner.stop(false);
    console.log("\n Meawwww!! Your cat card is ready");

    inquirer
      .prompt([
        {
          type: "list",
          name: "nextOption",
          message: "Would you like to create another card? ",
          choices: ["Yes", "No"],
        },
      ])
      .then((answers) => {
        if (answers.nextOption == "Yes") {
          init();
        } else {
          console.log('"Bye Bye! Love your cat');
        }
      });
  } catch (e) {
    console.log(e);
  }
}

init();
