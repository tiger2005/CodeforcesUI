'use scrict';
var win = nw.Window.get();
setTimeout(function(){win.show();},300);
$(".WindowMinimize").click(function(){
	win.minimize();
})
$(".WindowMaximize").click(function(){
	win.maximize();
	$(".WindowMaximize").css('display','none');
	$(".WindowRestore").css('display','inline-block');
})
$(".WindowRestore").click(function(){
	win.restore();
	$(".WindowMaximize").css('display','inline-block');
	$(".WindowRestore").css('display','none');
})
$(".WindowClose").click(function(){
	win.close();
})
