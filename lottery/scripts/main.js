(function($){

	var color;
	var colorHue = ["#A8A8A8","#8C8C8C"];//even,odd
	var textArr = ["富强福","和谐福","友善福","爱国福","敬业福","再接再厉哈","天猫超市","淘金币"];


	var rotateCount = 1;
	var partCount = 8;
	var eachAngle = 2*Math.PI/partCount;


	var outerCanvas,innerCanvas,innerCanvas2;
	var outerContext;

	drawCircles();
	drawText();
	drawInner();
	$(".btn").on("click",startLottery);

	function startLottery()
	{
		var randomNum = getRandom();
		outerContext.save();
		var deg = (randomNum*360/partCount+360*5*rotateCount)
		var rotateDeg = "rotate("+deg+"deg)";
		$("#outerCircle").css("-webkit-transform",rotateDeg);
		$('#outerCircle').css('-o-transform',rotateDeg);           //Opera
		$('#outerCircle').css('-moz-transform',rotateDeg);         //Firefox
		// outerContext.restore();
		rotateCount=rotateCount+1;


	}
function drawCircles(){
		outerCanvas = $("#outerCircle")[0];
		if(outerCanvas.getContext){

			outerContext = outerCanvas.getContext("2d");
			outerContext.save();


			//方法一，不变动坐标系，用循环加手动增加角度解决。
			// for(var i=0;i<partCount;i++)
			// {
			// 	outerContext.beginPath();
			// 	var startAngle = i*(2*Math.PI/partCount);
			// 	var endAngle = (i+1)*(2*Math.PI/partCount);
			// 	var center = 150;
			// 	if(i&1) color = colorHue[1];
			// 	else color=colorHue[0];

			// 	outerContext.fillStyle=color;
			// 	//这一句一定要加，否则出来的是弦，加上起始的点与结束的弧，最终闭合fill
			// 	outerContext.moveTo(150,150);
			// 	outerContext.arc(150,150,120,startAngle,endAngle,false);
			// 	outerContext.closePath();
			// 	outerContext.fill();
			// }

			//方法二，用旋转解决，注意rotate的度数都是弧度

			outerContext.translate(150,150);

			for(var i=0;i<partCount;i++)
			{
				outerContext.beginPath();
				var startAngle = -eachAngle/2;
				var endAngle = startAngle+eachAngle;

				if(i&1) color = colorHue[1];
				else color=colorHue[0];

				outerContext.fillStyle=color;
				//这一句一定要加，否则出来的是弦，加上起始的点与结束的弧，最终闭合fill
				outerContext.moveTo(0,0);
				outerContext.arc(0,0,120,startAngle,endAngle,false);//anticlock为false，顺时针
				outerContext.closePath();
				outerContext.fill();

				outerContext.rotate(eachAngle,0,0);//顺时针
			}
			outerContext.restore();
		}
		else{
			console.log("no context");

		}

	}

	function drawText(){//从y轴开始顺时针画文字，point:旋转坐标系

		// var outerCanvas = $("#outerCircle")[0];
		if(outerCanvas.getContext){
			outerContext.save();
			outerContext = outerCanvas.getContext("2d");
			outerContext.font="14px Microsoft Yahei";
			outerContext.textAlign="center";           //attention!
			outerContext.fillStyle="#DCC722";
			outerContext.translate(150,150);
			for(var i=0;i<8;i++)
			{
				var startX = 0,startY= -90;//有textAlign的话只需要x坐标为0就可以了

				outerContext.fillText(textArr[i],startX,startY);
				outerContext.rotate(eachAngle,0,0);

			}
			outerContext.restore();
		}

		// var outerCanvas = $("#outerText")[0];
		// if(outerCanvas.getContext){
		// 	var outerContext = outerCanvas.getContext("2d");
		// 	outerContext.font="14px Microsoft Yahei";
		// 	outerContext.textAlign="center";           //attention!
		// 	outerContext.fillStyle="#DCC722";
		// 	outerContext.translate(150,150);
		// 	for(var i=0;i<8;i++)
		// 	{
		// 		var startX = 0,startY= -90;//有textAlign的话只需要x坐标为0就可以了

		// 		outerContext.fillText(textArr[i],startX,startY);
		// 		outerContext.rotate(eachAngle,0,0);

		// 	}
		// }


	}
	function drawInner(){//canvas 160*160，

		innerCanvas = $("#innerMask")[0];
		innerCanvas2 = $("#innerCircle")[0];
		if(innerCanvas.getContext){
			var innerContext = innerCanvas.getContext("2d");
			drawCircleTemplate("rgba(0,0,0,0.5)",innerContext,60);
		}
		if(innerCanvas2.getContext){
			var innerContext = innerCanvas2.getContext("2d");
			drawCircleTemplate("#FF4350",innerContext,35);
			innerContext.beginPath();
			innerContext.fillStyle="#FF4350";
			innerContext.moveTo(140,125);
			innerContext.lineTo(150,95);
			innerContext.lineTo(160,125);
			innerContext.fill();
			innerContext.closePath();

		}

	}

	//utils
	function drawCircleTemplate(color,context,radius){
			context.fillStyle= color;

			context.beginPath();

			context.arc(150,150,radius,0,2*Math.PI);
			context.fill();
			context.closePath();
	}











})(jQuery);

function getRandom(){//抽随机数，如果为富强，则重抽，最多三次，如果敬业，重抽最多7次
		var random1 = Math.floor(Math.random()*8+1);//[1..8];
		var bossChoice = [1,5]//对应于textArr中的富强福跟敬业福
		var count = 1;
		switch(random1){
			case 1:
			{
				while(random1===1)
				{
					if(count>=3) break;
					random1 = Math.floor(Math.random()*8+1);
					count+=1;
					break;
				}

			}
			break;
			case 5:
			{
				while(random1===5)
				{
					if(count>=7) break;
					random1 = Math.floor(Math.random()*8+1);
					count+=1;
					break;
				}
			}
			break;
			default:break;
		}

		return random1;
	}


