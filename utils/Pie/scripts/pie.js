(function($){
	//使用指南：传入data,title,textColor,参数，以及标题header.调用code1,2,3即可


	var data = [
				{"name":"硬件","percent":54.3},
				{"name":"软件","percent":37.0},
				{"name":"服务","percent":8.7}
				];

	var title = "按产业规模";
	var textColor = "#000";
	var pieTextColor ="#fff";       //在饼图上面的文字的颜色，比如“启明星辰”的颜色
	var sameLine = true;            //百分比与公司名字是否在一行
	//这边是标题
	var header = "2014年中国信息安全产业产品结构"; //标题


	var pie = new Pie(data,title,textColor,pieTextColor,sameLine,200,60);                 //code1
	pie.draw();                                                      //code2
	$(".title").text(header);                                       //code3





	function Pie(data,title,textColor,pieTextColor,sameLine,outerRadius,innerRadius)
	{
			var util = new Utils();
			function drawPies(radius){

				var outerCanvas = $("#pie")[0];
				var width = outerCanvas.width;
				var height = outerCanvas.height;
				if(outerCanvas.getContext){
					var context = outerCanvas.getContext("2d");
					context.save();
					context.translate(width/2,height/2);           //平移到圆心坐标

					var endAngle = 0,startAngle = -1*(data[0].percent)/100*Math.PI;
					var colorPart = 255/data.length;
					for(var i=0;i<data.length;i++)
					{
						endAngle = startAngle+(data[i].percent/100)*2*Math.PI;
						data[i].centerAngle = (startAngle+endAngle)/2;

						context.fillStyle = util.calculateColor(0,153,255,i,data.length);
						context.beginPath();
						context.moveTo(0,0);
						context.arc(0,0,radius,startAngle,endAngle,false)//顺时针
						context.closePath();
						context.fill();
						startAngle = endAngle;
					}
					context.restore();
				}
			}
			function drawTextInPies()
			{
				var outerTextCanvas = $("#pieText")[0];
				var width = outerTextCanvas.width;
				var height = outerTextCanvas.height;
				if(outerTextCanvas.getContext)
				{
					var context = outerTextCanvas.getContext("2d");
					var x=130,y=0;
					var curCenterAngle=0,lastCenterAngle = 0;
					context.font="14px Microsoft Yahei";
					context.textAlign="center";           //attention!
					context.fillStyle=pieTextColor;
					context.translate(width/2,height/2);
					//画布先旋转某个角度，然后字体围绕自身旋转相反的角度
					for(var i=0;i<data.length;i++)      //先旋转到该角度再画TEXT,
					{
						curCenterAngle = data[i].centerAngle;
						var rotateAngle = curCenterAngle-lastCenterAngle;
						var textAngle = Math.PI/2;
						context.rotate(rotateAngle,0,0);

						context.save();
						// if(curCenterAngle>Math.PI/2&&curCenterAngle<Math.PI/2*3)
						// {
						// 	context.rotate()
						// }
						context.translate(x,y);
						context.rotate(-curCenterAngle,0,0);
						context.fillText(data[i].name,0,0);
						if(sameLine)
						{
							var w = context.measureText(data[i].name).width;
							context.fillText(data[i].percent+"%",w+5,0);
						}
						else
						{
							context.fillText(data[i].percent+"%",0,20);
						}

						context.restore();


						lastCenterAngle = curCenterAngle;
					}

				}
			}

			function drawInnerCircle(radius)
			{
				var innerCanvas = $("#innerCircle")[0];
				var width = innerCanvas.width,height = innerCanvas.height;
				if(innerCanvas.getContext)
				{
					var context = innerCanvas.getContext("2d");
					context.fillStyle= "rgb(255, 255, 255)";
					context.beginPath();
					context.translate(width/2,height/2);
					context.arc(0,0,radius,0,Math.PI*2,false);
					context.closePath();
					context.fill();

					context.font="14px Microsoft Yahei";
					context.fillStyle = textColor;
					context.textAlign="center";
					context.fillText(title,0,0);

				}

			}
			function draw(){
				drawPies(outerRadius);    //外圆半径
				drawTextInPies();
				drawInnerCircle(innerRadius);   //内圆半径
			}
			return {draw:draw};

	}






})(jQuery);

function Utils()
{
	if(typeof this.calculateColor !="function")
	{
		Utils.prototype.calculateColor = function(red,green,blue,index,num){
			var r = red+Math.floor((255-red)/num)*index;
			var g = green+Math.floor((255-green)/num)*index;
			var b = blue+Math.floor((255-blue)/num)*index;
			return ["rgb(",r,",",g,",",b,")"].join("");
		}
	}
}

