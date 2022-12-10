let ballSpeed = 10;
let BarWidth = 15;
let fadeAmount = 100;

let shotsByPaddle1 = 0;
let shotsByPaddle2 = 0;

let lastMissed;
let missPaddleMargin = 2

let shotsMissByPaddle1 = 0;
let shotsMissByPaddle2 = 0;

let multiplayer = true;
let Bars = [];
let ready = false;
let firstThrow = true

function setup() {
  createCanvas(800, innerHeight);
  let gear = select(".gear");
  ball = new Ball();
  Bars = [new Bar(0), new Bar(width - BarWidth)];
  gear.mousePressed(() => {
    select(".props").toggleClass("show");
  });

  let ballSpeedInput = select(".ball-speed");
  let noOfPlayerRadios = selectAll(".noOfPlayer");
  ballSpeedInput.changed(() => {
    ballSpeed = ballSpeedInput.value();
  });

  noOfPlayerRadios.forEach((radio) => {
    radio.changed(() => {
      if (radio.value() === "multi") {
        multiplayer = true;
      } else {
        multiplayer = false;
      }
    });
  });
}

function draw() {
  background(0, 0, 10, fadeAmount);
  select('.paddle1').html(shotsByPaddle1)
  select('.paddle2').html(shotsByPaddle2)

  select('.miss1').html(shotsMissByPaddle1)
  select('.miss2').html(shotsMissByPaddle2)

  if (ready) { 
    ball.update();
  }
  ball.draw()
  Bars.forEach((bar) => {
    bar.draw();
  });
  if (keyIsDown(UP_ARROW)) {
    Bars[1].move("up");
  }
  if (keyIsDown(DOWN_ARROW)) {
    Bars[1].move("down");
  }
  if (multiplayer === true) {
    if (keyIsDown(87)) {
      Bars[0].move("up");
    }
    if (keyIsDown(83)) {
      Bars[0].move("down");
    }
  } else {
    Bars["0"].autoMove();
  }
  if (!ready) {
    if(firstThrow) return
    let missedPaddle;
    if (ball.position.x > width / 2) {
      missedPaddle = Bars[1];
      ball = new Ball({x: missedPaddle.position.x-missPaddleMargin, y: missedPaddle.position.y+missedPaddle.height/2});
    } else {
      missedPaddle = Bars[0];
      ball = new Ball({x: missedPaddle.position.x+missPaddleMargin+missedPaddle.width, y: missedPaddle.position.y+missedPaddle.height/2});
    }
  }
}

function mousePressed(e) {
  let path = e.path;
  if (
    !path.includes(document.querySelector(".gear")) &&
    !path.includes(document.querySelector(".form"))
  ) {
    document.querySelector(".props").classList.remove("show");
  }
}

function keyPressed() {
  if (keyCode === 27) {
    select(".props").toggleClass("show");
  } else if(keyCode==32) {
    ready = true;
    if (firstThrow) firstThrow = false
  }
}


class Ball {
  constructor(position) {
    if (random(-1, 1) > 0) {
      this.angle = random((5 * PI) / 6, (7 * PI) / 6); // 2.6 <-> 3.6
    } else {
      this.angle = random(PI / 6, -PI / 6); // -0.5 <-> 0.5
    }
    this.radius = 20;
    if (position) {
      this.position = {
        x: position["x"],
        y: position["y"],
      };
    } else {
      this.position = {
        x: width / 2,
        y: height / 2,
      };
    }
    this.velocity = {
      x: cos(this.angle) * ballSpeed,
      y: sin(this.angle) * ballSpeed,
    };
  }
  draw() {
    fill(255, 0, 0);
    noStroke();
    circle(this.position.x, this.position.y, this.radius);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //Shot
    Bars.forEach((bar) => {
      if (
        bar.position.x < this.position.x &&
        bar.position.y < this.position.y &&
        this.position.y < bar.position.y + bar.height &&
        this.position.x < bar.position.x + bar.width
      ) {
        let paddle
        this.velocity.x *= -1;
        fadeAmount--;
        if (ball.position.x < width / 2) {
          paddle = Bars[0]
          if (paddle===lastMissed) return
          lastMissed = undefined
          shotsByPaddle1++
        } else {
          paddle = Bars[1]
          if (paddle===lastMissed) return
          lastMissed = undefined
          shotsByPaddle2++
        }
      }
    });

    //Bumped on top/bottom border
    if (this.position.y > height || this.position.y < 0) {
      this.velocity.y *= -1;
    }

    //Missed
    if (
      this.position.x - this.radius > width ||
      this.position.x < 0 ||
      this.position.y + this.radius < 0 ||
      this.position.y - this.radius > height
    ) {
      let missedPaddle;
      if (this.position.x > width / 2) {
        missedPaddle = Bars[1];
        ball = new Ball(
          {x: missedPaddle.position.x-missPaddleMargin, y: missedPaddle.position.y+missedPaddle.height/2}
        );
        shotsMissByPaddle2++
      } 
      else {
        missedPaddle = Bars[0];
        ball = new Ball(
          {x: missedPaddle.position.x+missPaddleMargin+missedPaddle.width, y: missedPaddle.position.y+missedPaddle.height/2}
        );
        shotsMissByPaddle1++
      }
      ready = false
      fadeAmount = 100;
      lastMissed = missedPaddle
    }
  }
}

class Bar {
  constructor(x) {
    this.width = BarWidth;
    this.height = 100;
    this.position = {
      x: x,
      y: 200,
    };
  }
  draw() {
    fill(0, 0, 255);
    noStroke();
    rect(this.position.x, this.position.y, this.width, this.height);
  }
  move(direction) {
    switch (direction) {
      case "up":
        if (this.position.y > 5) {
          this.position.y -= 10;
        }
        break;
      case "down":
        if (this.position.y + this.height + 5 < height) {
          this.position.y += 10;
        }
        break;

      default:
        break;
    }
  }
  autoMove() {
    if (ball.position.x > width / (3 / 2)) return;
    if (ball.position.y > this.position.y + this.height / 2) {
      this.position.y +=
        abs(this.height / 2 + this.position.y - ball.position.y) * 0.1;
    } else {
      this.position.y -=
        abs(this.height / 2 + this.position.y - ball.position.y) * 0.1;
    }
  }
}
