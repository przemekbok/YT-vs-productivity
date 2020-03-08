const timer = require("./timer");
const http = require("http");
const port = 3333;

let globalTime = 0;
let globalActive = false;
startServer();
timer.startCLI(startTimer, setTimer, setActive);

function setTimer(time) {
  globalTime = time;
}

function setActive(active) {
  globalActive = active;
}

function startServer() {
  const requestHandler = (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    if (request.url.includes("/remoteTimer")) {
      if (globalActive) {
        response.end(
          JSON.stringify({ active: true, "time remaining": globalTime })
        );
      } else {
        response.end(JSON.stringify({ active: false }));
      }
    } else {
      response.setHeader("Status", "404");
    }
    response.end("");
  };

  const server = http.createServer(requestHandler);

  server.listen(port, err => {
    if (err) {
      return console.log("something bad happened", err);
    }

    //console.log(`server is listening on ${port}\n`);
  });
}

function startTimer() {
  return new Promise(() => {
    function tick() {
      setTimeout(() => {
        if (globalTime - 250 >= 0) {
          globalTime -= 250;
          tick();
        } else {
          globalActive = false;
          timer.repeatQuestion();
          return;
        }
      }, 250);
    }
    tick();
  });
}
