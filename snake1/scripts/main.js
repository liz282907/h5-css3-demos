(function($){

	//1，不能同方向转身  done
	//2，碰到墙时转弯， done
	//3，不能碰自己，  done
	//4, 计分，每吃一个，+100分，每吃多少个可以增加一条命       done
	//5，version2 :设置level（时间越长，速度越快，可以考虑计时模式）todo
	//6，version2 :交互的部分抽出来 todo

	//疑惑的地方：1，有时候food会跳两次的问题，maybe是动画帧的原因,待考虑
	//			  2，见下方


	var keyCodes = {LEFT:37,UP:38,RIGHT:39,DOWN:40,PAUSE:80,RESUME:82,QUIT:27};

	var cvs = $("#canvasBody")[0];
	var score = 0,level = 1,gameOver = false,life=1;
	var raf;
	var interval=1000/(4*level),lastTime = Date.now();
	var util = new Utils();

	if(cvs.getContext){
		var context = cvs.getContext("2d");
		var width = cvs.width,height = cvs.height,cellWidth = 10;
		var curDirection=[1,0];//up:[0,-1],down[0,1],right[1,0],left[-1,0]

		var eaten=false;
		var snakeLength = 3,snakeCoord = [];//{[x,y],[]}
		//三个对象，画布上下文的各种操作，snake,food
		var food,snake,contextState;


/*******************************************food start*****************************************/
		function Food(foodCoord){
			this.coordinates = foodCoord;
		}

		Food.prototype.drawFood = drawFood;

		/******************************
		*食物的位置，且不能跟snake的位置冲突
		*******************************/
		function drawFood(){

			if(eaten)
			{
				var temp = this.coordinates = getRandomCell();
				var isValidFood = snakeCoord.every(function(d){     //not understand。这边的this的问题
					// return d.x !=this.coordinates.x && d.y!=this.coordinates.y; 注意这个时候的this改变为window
					//此时因为在一个匿名函数中，该函数是直接被调用的，因此是默认绑定，对象是window对象。而this.coordinates没定义，因此会有问题
					return d.x !=temp.x && d.y!=temp.y;
				});
				isValidFood?util.drawCell(contextState.ctx,this.coordinates.x,this.coordinates.y,cellWidth):drawFood();
				eaten = false;
			}
			else
			{
				util.drawCell(contextState.ctx,this.coordinates.x,this.coordinates.y,cellWidth,false);
			}
		}

/*******************************************food   end*****************************************/

/*******************************************snake   start*****************************************/

		snake =
		{
			// coordinates: snakeCoord,
			velocity:level,
			draw:function()
			{
				// context.clearRect(0,0,width,height);
				// context.stokeStyle = "black";
				// context.fillStyle = "#ccffcc";
				// context.strokeRect(0,0,width,height);
				// context.fillRect(0,0,width,height);
				// food.drawFood(foodCoord.x,foodCoord.y);//吃到食物的话，改变食物的位置
				for(var i=0;i<snakeCoord.length;i++)
				{
					i==0?isHead=true:isHead=false;
					util.drawCell(contextState.ctx,snakeCoord[i].x,snakeCoord[i].y,cellWidth,isHead);
				}
			},
			touchBoundary: checkTouchBoundary,
			eatFood: checkEatFood,
			selfCollision:checkSelfCollision,
			move: move
		}

			//撞墙时逆时针转弯，要提前一个cell就转向，否则会出去
			function checkTouchBoundary(x,y)
			{
				var key = null;
				var touchBoundary = false;
				if(x+cellWidth>=width && util.arraysEqual(curDirection,[1,0])) //右边界 此时Head.x=width
				{
					key = keyCodes.UP;
				}
				else if(y<=0 && util.arraysEqual(curDirection,[0,-1]))  //上边界
				{
					key = keyCodes.LEFT;
				}
				else if(x<=0 && util.arraysEqual(curDirection,[-1,0]))   //左边界
				{
					key = keyCodes.DOWN;
				}
				else if(y+cellWidth>=height && util.arraysEqual(curDirection,[0,1])) //下边界
				{
					key = keyCodes.RIGHT;
				}

				if(key)
				{
					touchBoundary = true;
					util.triggerKeyEvent(key);
				}

				return touchBoundary;
			}


			function checkEatFood()
			{
				if(snakeCoord[0].x==food.coordinates.x && snakeCoord[0].y==food.coordinates.y)
				{
					 // debugger;
					eaten = true;
					score+=level;
					checkScorelist();
					var oldtail = snakeCoord.slice(-1)[0];
					var tailX = oldtail.x-curDirection[0]*cellWidth;
					var tailY = oldtail.y-curDirection[1]*cellWidth;
					snakeCoord.push({x:tailX,y:tailY});
				}
			}

			//长度长于5时需要检测自我碰撞，碰撞返回true
			function checkSelfCollision()
			{
				var head = snakeCoord[0];
				return !(snakeCoord.every(function(d,i)
				{
					//忽略头部
					if(i==0 || snakeCoord.length<=4){return true;}
					else{
						return !(d.x==head.x &&d.y==head.y); //attention:别写成d.x!=head.x &&d.y!=head.y
					}
				}));
			}

			//头部改变位置，其他部分的x,y是上一个方块的位置。依次变换
			function move()
			{

				var oldHead = snakeCoord[0];
				var head = {};

				// checkTouchBoundary(oldHead.x,oldHead.y);
				snake.touchBoundary(oldHead.x,oldHead.y);
				if(snake.selfCollision())
				{
					life-=1;
					checkScorelist();
				}

				head.x = oldHead.x+curDirection[0]*cellWidth;
				head.y = oldHead.y+curDirection[1]*cellWidth;
				snakeCoord.pop();
				snakeCoord.unshift(head);
				/**********1
				temp = temp.map(function(d){
					d.x = d.x+curDirection[0]*cellWidth*level;
					d.y = d.y+curDirection[1]*cellWidth*level;
					return d;
				});
				for(var i=0;i<level;i++)
					snakeCoord.pop();
				Array.prototype.unshift.apply(snakeCoord,temp);

				**************************/
			}


/*******************************************snake  end*****************************************/
/*******************************************contextState  start*****************************************/

		function ContextState(context)
		{
			this.ctx =context;
		}
		ContextState.prototype = {
			constructor: ContextState,
			clear: clear,
			redraw:redraw,
			setParams:setParams,
			pause: pause,
			resume:resume,
			stop: stop,
			restart:restart
		};
			function clear()
			{
				window.cancelAnimationFrame(raf);
				this.ctx.clearRect(0,0,width,height);
			}
			function redraw()
			{
				this.ctx.clearRect(0,0,width,height);
				this.ctx.stokeStyle = "black";
				this.ctx.fillStyle = "#ccffcc";
				this.ctx.strokeRect(0,0,width,height);
				this.ctx.fillRect(0,0,width,height);
			}
			function setParams(ctx)
			{
				this.ctx = ctx;
			}
			function pause()
			{
				// this.ctx = ctx;
				window.cancelAnimationFrame(raf);
			}
			function resume()
			{
				// this.redraw();//canvas,context重绘
				// food.drawFood();
				draw();
			}
			function stop()
			{
				this.clear();
				$("#popupWindow-next").fadeIn();
			}
			function restart()
			{
				snakeCoord = [];
				snakeLength = 3;
				start();
			}

/*******************************************contextState  end*****************************************/
/*******************************************交互-》游戏开始 start*****************************************/

		$(document).on("keydown",keydown)
					.on("click","#popupWindow button",function(e)
						{
							$("#popupWindow").fadeOut();
							var choice = ($(this).attr("class").match(/pop-(\w+)/))[1];
							$("#popupWindow-level").removeClass("hide")
													.children("div").removeClass("hide")
													.filter("."+choice).siblings().addClass("hide")
													.end().fadeIn();

						})
					.on("click","#popupWindow-level li",function(e){
							var chosenLevel = $(e.currentTarget).index();
							level = chosenLevel+1;
							initScoreList();
							var normalizedLevel = chosenLevel+1+ Math.pow(2,chosenLevel-1);
							interval = 1000/(3*normalizedLevel);                     //别忘了更新Interval

							$("#popupWindow-level").fadeOut();
							setTimeout(start,1000);
					})
					.on("click","#clock-btn",function(e){
							level = 2;
							initScoreList();
							var normalizedLevel = level+ Math.pow(2,level);
							interval = 1000/(3*normalizedLevel);                     //别忘了更新Interval
							$("#popupWindow-level").fadeOut();
							start();
							setTimeout(checkClockGameOver,40*1000);
					})
					.on("click","#restart",function()
						{
							$("#popupWindow-next").hide();
							contextState.restart();
						});


		function start()
		{
			initCanvas();
			draw();
		}

		function initCanvas()
		{

			// context.stokeStyle = "black";
			context.fillStyle = "#ccffcc";
			// context.strokeRect(0,0,width,height);
			context.fillRect(0,0,width,height);

			contextState = new ContextState(context);

			//随机产生初始位置，方向向右走，且长度为3，因此只检测尾部X坐标
			var headX = Math.floor(Math.random()*(width/cellWidth))*cellWidth;
			var headY = Math.floor(Math.random()*(height/cellWidth))*cellWidth;
			while(headX-2*cellWidth<0)
			{
				headX = Math.floor(Math.random()*(width/cellWidth))*cellWidth;
			}
			var isHead = true;
			for(var i=0;i<snakeLength;i++)
			{
				snakeCoord.push({x:headX,y:headY,dir:[1,0]});             //remove useless dir
				headX-=cellWidth;
			}

			food = new Food(getRandomCell());

		}

		function draw()
		{
			raf = window.requestAnimationFrame(draw);
			var now = Date.now();
			var delta = now-lastTime;

			if(delta>=interval)
			{
				lastTime = now-delta%interval;
				contextState.redraw();
				food.drawFood();
				snake.draw();
				snake.eatFood();//检测是否吃到食物
				snake.move();
			}
		}


		/*************************************
		*监听按键，不能同方向转身
		************************************/
		function keydown(event)
		{
			var keyCode = event.which || event.keyCode;
			switch(keyCode)//left:37,up:38,right:39.down:40
			{
				case keyCodes.RIGHT:
					if(!util.arraysEqual(curDirection,[-1,0]))
						curDirection = [1,0];
					break;
				case keyCodes.LEFT:
					if(!util.arraysEqual(curDirection,[1,0]))
						curDirection = [-1,0];
					break;
				case keyCodes.UP://up
					if(!util.arraysEqual(curDirection,[0,1]))
						curDirection = [0,-1];
					break;
				case keyCodes.DOWN:
					if(!util.arraysEqual(curDirection,[0,-1]))
						curDirection = [0,1];
					break;
				case keyCodes.PAUSE://p =>pause 80
					// contextState.pause(context);
					contextState.pause();
					break;
				case keyCodes.RESUME://R =>resume 82
					contextState.resume();
					break;
				case keyCodes.QUIT://esc =>退出 27
					contextState.stop();
					break;
			}
		}

		function checkClockGameOver()
		{
			//因为设置level为2
			if(score/level<=2)
			{
				gameOver = true;
				contextState.stop();
				$("#popupWindow-next").fadeIn();
			}
		}

/*******************************************交互-》游戏开始 end*****************************************/

/*******************************************得分榜start***************************************************/
		function checkScorelist()
		{
			$(".score").text(100*score+"分");
			//每8分加一条命
			if(score%8==1&&score!=1)
			{
				life+=1;
				$(".life").text(life);
			}
			if(life==0)
			{
				gameOver = true;
				contextState.stop();
			}
		}

		function initScoreList()
		{
			$items = $(".leftColumn").find("li span");
			$items.eq(0).text(score+"分").end() 			//score
					.eq(1).text(1).end()     				//life
					.eq(2).text(level);         			//level
		}

/*******************************************得分榜***************************************************/

		function getRandomCell() {
			return{
				x: Math.floor(Math.random()*(width/cellWidth))*cellWidth,
				y: Math.floor(Math.random()*(height/cellWidth))*cellWidth
			}
		}


	}



})(jQuery);



function Utils()
{
	if(typeof this.arraysEqual != "function"){
		Utils.prototype.arraysEqual = function(a1,a2)
		{
			return a1.length===a2.length
			&& a1.every(function(d,i){
				return d==a2[i];
			})
		}
	}
	if(typeof this.triggerKeyEvent != "function"){
		Utils.prototype.triggerKeyEvent = function(keyCode) {
			var e = $.Event("keydown");
			e.which = keyCode;
			$(document).trigger(e);
		}
	}
	if(typeof this.drawCell != "function"){
		Utils.prototype.drawCell = function(ctx,x,y,cellWidth,isHead) {
			ctx.stokeStyle = "black";
			ctx.fillStyle="#ff9900";
			if(isHead) ctx.fillStyle = "#ff5c33";
			ctx.fillRect(x,y,cellWidth,cellWidth);
		}
	}

}

