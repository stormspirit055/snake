var log = console.log.bind(console);
export default class Game {
  constructor(canvas) {
    this._registerMoveAction()
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.__WIDTH = 500
    this.__HEIGHT = 500
    this.__GRIDNUM = 25
    this.__FPS = 4
    this.__SPEED = 1
    this.__GRIDWIDTH = this.__WIDTH / this.__GRIDNUM
    this.isStop = !0
    this.snake = []
    this.direction = 1
    this.timer = ''
    this.score = 0
    this.nextDirection = this.direction
  }
  initGame() {
    this.canvas.setAttribute('width', this.__WIDTH)
    this.canvas.setAttribute('height', this.__HEIGHT)
    this._initBg()
    this._initFood()
    this._initSnake()
    let btn = document.querySelector('#switch')
    btn.style.display = 'inline-block'
  }
  _initSnake() {
    let startPoint = this._getRandomPos(this.__WIDTH / this.__GRIDNUM - 1, this.__HEIGHT / this.__GRIDNUM - 1);
    let nextPoint = this._calNextPos(startPoint)
    this.snake = [startPoint, nextPoint]
    console.log(this.snake)
    this._drawSnake()
  }
  _snakeMove() {
    this.direction = this.nextDirection + this.direction == 0  ? this.direction : this.nextDirection
    this._drawCell(this.snake.shift(), 'clean')
    this.snake.push(this._calNextPos(this.snake[this.snake.length - 1]))
    this._judgeIsEat()
    this._drawSnake()
  }
  _judgeIsEat() {
    if (this._isInArray(this.snake, this.foodPoint))  {
      this.snake.push(this._calNextPos(this.snake.slice(-1)[0]))
      this._initFood()
      this._addScore()
    }
  }
  _addScore() {
    this.score += 1
    let scoreBoard = document.querySelector('.s-score')
    scoreBoard.innerHTML = 'score:' + this.score
    this.__SPEED = Math.ceil(this.score / 2) > 5 ? 5 : Math.ceil(this.score / 2)
    console.log(this.__SPEED)
    let speedBoard = document.querySelector('.s-speed')
    speedBoard.innerHTML = 'speed:' + this.__SPEED
  }
  _initFood() {
    do{
      this.foodPoint = this._getRandomPos()
      this._drawCell(this.foodPoint, 'food')
    }while(this._isInArray(this.snake, this.foodPoint))
  }
  _drawSnake() {
    this.snake.forEach((v, index) => {
      if (index == this.snake.length - 1 && this._isBlock(v)) {
        this._drawCell(v, 'danger')
        // 需要等待GUI线程完成渲染后 再弹框, GUI线程与定时器线程不互斥, JS线程与GUI线程互斥
        setTimeout(() => {
          this._stopGame()
        }, 100)
      }
      else {
        this._drawCell(v)
      }
    })
  }
  _isBlock(point) {
    //判断是否撞墙或撞自己
    return point.some(v => v == 0 || v == this.__GRIDNUM - 1) || this.snake.slice(0, this.snake.length - 1).some(v => {
      return v[0] == point[0] && v[1] == point[1]})    
  }
  _stopGame() {
    console.log('游戏结束')
    this._switchGame()
    let btn = document.querySelector('#switch')
    btn.style.display = 'none'
    alert('您的得分是: ' + this.score)
  }
  _updataCanvas() {
    if (this.isStop) return
    this.timer = setTimeout(() => {
      this._snakeMove()
      this._updataCanvas()
    }, 500 / this.__SPEED)
  }
  _calNextPos(point) {
    let nextPoint = []
    switch(this.direction){
      case 1:
          nextPoint = [point[0] + 1, point[1]]
          break
      case 2:
          nextPoint = [point[0], point[1] + 1]
          break
      case -1:
          nextPoint = [point[0] - 1, point[1]]
          break
      case -2:
          nextPoint = [point[0], point[1] - 1]
          break;
    }
    return nextPoint
  }
  _getRandomPos(Wmax = this.__WIDTH / this.__GRIDNUM - 1,Hmax = this.__HEIGHT / this.__GRIDNUM - 1) {
    return [Math.ceil(Math.random() * Wmax), Math.ceil(Math.random() * Hmax)]
  }
  _initBg() {
    let ctx = this.ctx
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.__WIDTH, 0);
    ctx.lineTo(this.__WIDTH, this.__HEIGHT);
    ctx.lineTo(0, this.__HEIGHT);
    ctx.lineTo(0, 0);
    ctx.stroke();
  }
  _drawCell(pos, type = "draw") {
    if (type == 'danger') {
      console.log('红色!!!')
    }
    let typeMap = {
      clean: '#fff',
      draw: 'black',
      danger: 'red',
      food: 'blue'
    }
    let ctx = this.ctx
    ctx.fillStyle = typeMap[type]
    ctx.beginPath();
    ctx.moveTo(this.__GRIDWIDTH*(pos[0] + 0.05),this.__GRIDWIDTH*(pos[1] + 0.05));
    ctx.lineTo(this.__GRIDWIDTH*(pos[0] + 0.05),this.__GRIDWIDTH*(pos[1] + 0.95))
    ctx.lineTo(this.__GRIDWIDTH*(pos[0] + 0.95),this.__GRIDWIDTH*(pos[1] + 0.95))
    ctx.lineTo(this.__GRIDWIDTH*(pos[0] + 0.95),this.__GRIDWIDTH*(pos[1] + 0.05))
    ctx.lineTo(this.__GRIDWIDTH*(pos[0] + 0.05),this.__GRIDWIDTH*(pos[1] + 0.05));
    ctx.fill()
  }
  _switchGame() {
    let btn = document.querySelector('#switch')
    this.isStop = !this.isStop
    if (this.isStop) {
      clearTimeout(this.timer)
    } else {
      this._updataCanvas()
    }
    btn.innerHTML = this.isStop ? '开始' : '暂停'
  }
  _registerMoveAction() {
    let _this = this
		document.addEventListener('keydown', function(e) {
			switch(e.keyCode){
				case 37:
          log('arrow_left')
					_this._changeDirection(-1)
					break;
				case 38:
					log('arrow_top')
					_this._changeDirection(-2)
					break;
				case 39:
					log('arrow_right')
					_this._changeDirection(1)
					break;
				case 40:
					log('arrow_down')
					_this._changeDirection(2)
					break;
				
			}
		}, false)
  }
  _changeDirection(direction) {
    if(direction + this.direction == 0) return
    this.nextDirection = direction
  }
  _isInArray(arr, point) {
    let result = !1
    arr.forEach(v => {
      if (v.toString() == point.toString()){
        result = !0
      }
    })
    return result
  }
}