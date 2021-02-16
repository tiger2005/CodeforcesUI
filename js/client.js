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
Array.prototype.indexOf = function(val){ 
	for (var i=0;i<this.length;i++)
		if (this[i] == val) return i;
	return -1;
};
var PagePool = [];
var ifShown = [];
var MainPageIds = [];
var CurrentPageId = -1;
var SettingsPageId = -1, DownloadPageId = -1;
var PageTypeList = ["HomeBlogEntry", "TopBlogEntry", "UserBlogEntry", "Blog", "Contest", "Gym",
				"ContestList", "GymList", "ProblemList", "Problem",
				"Submit", "Standings", "ContestStatus", "UserStatus",
				"HackPage", "RatingChanges", "Submission",
				"User", "Group", "FriendList", "RatingPage", "Settings", "DownloadInfo"];
var generateIcon = {
	"HomeBlogEntry": "fa-home",
	"TopBlogEntry": "fa-fire",
	"UserBlogEntry": "fa-newspaper-o",
	"Blog": "fa-sticky-note",
	"Contest": "fa-calendar-o",
	"Gym": "fa-sitemap",
	"ContestList": "fa-calendar",
	"GymList": "fa-calendar",
	"ProblemList": "fa-book",
	"Problem": "fa-question-circle",
	"Submit": "fa-send",
	"Standings": "fa-list",
	"ContestStatus": "fa-pie-chart",
	"UserStatus": "fa-pie-chart",
	"HackPage": "fa-user-secret",
	"RatingChanges": "fa-exchange",
	"Submission": "fa-tasks",
	"User": "fa-address-card",
	"Group": "fa-address-book", 
	"FriendList": "fa-users",
	"RatingPage": "fa-line-chart",
	"Settings": "fa-cogs",
	"DownloadInfo": "fa-download"
};
var generateTitle = {
	"HomeBlogEntry": function(x){return "Homepage Blog Entry";},
	"TopBlogEntry": function(x){return "Top Blog Entry";},
	"UserBlogEntry": function(x){return "Blogs of "+x;},
	"Blog": function(x){return "Blog #"+x;},
	"Contest": function(x){return "Contest #"+x;},
	"Gym": function(x){return "Gym #"+x;},
	"ContestList": function(x){return "Contest List";},
	"GymList": function(x){return "Gym List";},
	"ProblemList": function(x){return "Problem List";},
	"Problem": function(x){return x[0]=='99999'?("Problem ACMSGURU"+x[1]):("Problem CF"+x[0]+((x[1][0]>='A'&&x[1][0]<='Z')?x[1]:('-'+x[1])));},
	"Submit": function(x){return x[0]=='99999'?("Submit ACMSGURU"+x[1]):("Submit CF"+x[0]+((x[1][0]>='A'&&x[1][0]<='Z')?x[1]:('-'+x[1])));},
	"Standings": function(x){return "Standings of #"+x;},
	"ContestStatus": function(x){return "Status of #"+x;},
	"UserStatus": function(x){return "Submissions by "+x;},
	"HackPage": function(x){return "Hacks of #"+x;},
	"RatingChanges": function(x){return "Rating Changes of #"+x},
	"Submission": function(x){return "Submission #"+x;},
	"User": function(x){return "User @"+x;},
	"Group": function(x){return "Group #"+x;},
	"FriendList": function(x){return "Friends of mine";},
	"RatingPage": function(x){return "Rating of @"+x;},
	"Settings": function(x){return "Settings";},
	"DownloadInfo": function(x){return "Download Page";}
};
function ChangePage(x){
	if(CurrentPageId == x)	return;
	$(".title"+CurrentPageId).removeClass("CurrentTitle");
	$(".PageToolList"+CurrentPageId).css("max-width","0px");
	$(".page"+CurrentPageId).css('display','none');
	CurrentPageId = x;
	$(".title"+CurrentPageId).addClass("CurrentTitle");
	$(".PageToolList"+CurrentPageId).css("max-width","50px");
	$(".page"+CurrentPageId).css('display','block');
	if(x == -1)	$(".WindowTitleSet").html("Get Started!");
	else	$(".WindowTitleSet").html(generateTitle[PagePool[x].PageType](PagePool[x].PageInfo));
}
function ChangeShowType(x){
	if(ifShown[x]){
		$(".list"+x).css("display","none");
		$(".PageFolder"+x).removeClass("fa-angle-down").addClass("fa-angle-right");
	}
	else{
		$(".list"+x).css("display","block");
		$(".PageFolder"+x).removeClass("fa-angle-right").addClass("fa-angle-down");
	}
	ifShown[x] = !ifShown[x];
}
function deletePage(x){
	if(PagePool[x].fatherPage == -1){
		if(PagePool[x].PageType == "Settings")	SettingsPageId = -1;
		if(PagePool[x].PageType == "DownloadInfo")	DownloadPageId = -1;
		var p = MainPageIds.indexOf(x);
		MainPageIds.splice(p,1);
		if(p == MainPageIds.length)	--p;
		ChangePage(p == -1 ? -1 : MainPageIds[p]);
	}
	else{
		var p = PagePool[PagePool[x].fatherPage].sonList.indexOf(x);
		PagePool[PagePool[x].fatherPage].sonList.splice(p,1);
		if(p == PagePool[PagePool[x].fatherPage].sonList.length)	--p;
		ChangePage(p == -1 ? PagePool[CurrentPageId].fatherPage
			: PagePool[PagePool[x].fatherPage].sonList[p]);
	}
	$(".page"+x).remove();
	rebuildPage();
}
function pageToMain(x){
	if(PagePool[x].fatherPage == -1)	return;
	PagePool[PagePool[x].fatherPage].sonList.splice(PagePool[PagePool[x].fatherPage].sonList.indexOf(x),1);
	MainPageIds.push(x);
	rebuildPage();
}
function loadPageViewerInfo(id, from){
	$(from).append(`<div class="PageViewerBlock"><span class="PageToolList${id} PageToolList"${CurrentPageId==id?"":` style="max-width:0px"`}><i class="PageFolder${id} fa ${ifShown[id]?"fa-angle-down":"fa-angle-right"}" onclick="ChangeShowType(${id})"></i><i class="fa fa-times PageCloser" onclick="deletePage(${id})"></i>${from==".PageViewer"?"":`<i class="PageToMain fa fa-code-fork" onclick="pageToMain(${id})"></i>`}</span><i class="fa ${generateIcon[PagePool[id].PageType]} icon${id} PageIcon" onclick="ChangePage(${id})"></i><span class="title${id} PageTitle${CurrentPageId==id?" CurrentTitle":""}" onclick="ChangePage(${id})">${generateTitle[PagePool[id].PageType](PagePool[id].PageInfo)}</span></div><br/><div class="PageSonList list${id}"${ifShown[id]?"":` style="display:none"`}></div>`);
	for(var i=0;i<PagePool[id].sonList.length;i++)
		loadPageViewerInfo(PagePool[id].sonList[i],".list"+id);
}
function rebuildPage(){
	if(MainPageIds.length == 0)
		$(".PageViewer").html(`<div style="width:100%;height:100%;display:grid;place-items:center"><span style="font-size: 14px;font-family:Consolas;">Blank</span></div>`);
	else{
		$(".PageViewer").html("");
		for(var i=0;i<MainPageIds.length;i++)
			loadPageViewerInfo(MainPageIds[i],".PageViewer");
	}
}
var windowOpenIf = false;
function closeMessageBox(){
	windowOpenIf = false;
	$('.AlertWindow').css('display','none');
	$(".BlackBackground").css('background','rgba(0,0,0,0)');
	setTimeout(function(){$('.AllWindow').css('display','none')},300);
}
function buildRealPage(id, type, info){
	$(".PagesWrapper").append(`<div class="RealPage page${id}" style="display:none"></div>`);
	if(type == "Settings"){
		if((typeof(localStorage.getItem("AuthorizeIf"))).toLowerCase() != 'string')
			localStorage.setItem("AuthorizeIf", "No");
		$(".page"+id).append(
			`<table style="width:100%;padding:5px;" cellpadding="2">
				<tr><td><i class="fa fa-user"></i> Handle</td><td><input type="text" class="HandleInput" style="width:100%" placeholder="Codeforces Handle" /></td></tr>
				<tr><td><i class="fa fa-address-card"></i> Authorize</td><td><label><input type="radio" name="AuthorizeIf" value="No"${localStorage.getItem("AuthorizeIf")!="Yes"?" checked='checked'":""} style="vertical-align:-5px;"/> No</label> <label><input type="radio" name="AuthorizeIf" value="Yes"${localStorage.getItem("AuthorizeIf")=="Yes"?" checked='checked'":""} style="vertical-align:-5px;" /> Yes</label></td>
				<tr><td colspan="2" style="font-size:10px">You can go to <span style="cursor:pointer;" onclick="openURL('https://codeforces.com/settings/api')">https://codeforces.com/settings/api</span> to generate API key.<br/>You can get friend list and adapted content by API key.</td></tr>
				<tr class="ifOpenAuthorize"><td><i class="fa fa-key"></i> Key</td><td><input type="password" class="ApiKeyInput" style="width:100%" placeholder="Your Api Key" /></td></tr>
				<tr class="ifOpenAuthorize"><td><i class="fa fa-eye-slash"></i> Secret</td><td><input type="password" class="ApiSecretInput" style="width:100%" placeholder="Your Api Secret" /></td></tr>
				<tr><td><i class="fa fa-eyedropper"></i> Style</td><td><label><input type="radio" name="StyleChosen" value="Light"${localStorage.getItem("StyleChosen")=="Light"?" checked='checked'":""} style="vertical-align:-5px;"/> Light</label> <label><input type="radio" name="StyleChosen" value="Dark"${localStorage.getItem("StyleChosen")=="Dark"?" checked='checked'":""} style="vertical-align:-5px;"/> Dark</label> <label><input type="radio" name="StyleChosen" value="FollowSystem"${localStorage.getItem("StyleChosen")=="FollowSystem"?" checked='checked'":""} style="vertical-align:-5px;"/> Follow System</label></td>
			</table>`);
		if(localStorage.getItem("AuthorizeIf") == "No"){
			$(".ifOpenAuthorize").each(function(){
				$(this).css("display","none");
			});
		}
		$("input[name='AuthorizeIf']").click(function(){
			var p = $("input[name='AuthorizeIf']:checked").val();
			localStorage.setItem('AuthorizeIf', p);
			if(p == 'Yes'){
				$(".ifOpenAuthorize").each(function(){
					$(this).css("display","table-row");
				});
			}
			else{
				$(".ifOpenAuthorize").each(function(){
					$(this).css("display","none");
				});
			}
		});
		$("input[name='StyleChosen']").click(function(){
			var p = $("input[name='StyleChosen']:checked").val();
			localStorage.setItem("StyleChosen", p);
			if(p == 'Light' && DarkMode)
				ChangeTheme(true);
			if(p == 'Dark' && !DarkMode)
				ChangeTheme(true);
			if(p == 'FollowSystem'){
				if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
					if(window.matchMedia('(prefers-color-scheme: dark)').matches && !DarkMode)
						ChangeTheme(true);
					if(window.matchMedia('(prefers-color-scheme: light)').matches && DarkMode)
						ChangeTheme(true);
				}
			}
		});
		if((typeof(localStorage.getItem("Handle"))).toLowerCase() != 'string')
			localStorage.setItem("Handle", '');
		$(".HandleInput").val(localStorage.getItem("Handle"));
		if((typeof(localStorage.getItem("ApiKey"))).toLowerCase() != 'string')
			localStorage.setItem("ApiKey", '');
		$(".ApiKeyInput").val(localStorage.getItem("ApiKey"));
		if((typeof(localStorage.getItem("ApiSecret"))).toLowerCase() != 'string')
			localStorage.setItem("ApiSecret", '');
		$(".ApiSecretInput").val(localStorage.getItem("ApiSecret"));
		$(".HandleInput").bind('input propertychange',function(){
			localStorage.setItem('Handle', $(".HandleInput").val());
		})
		$(".ApiKeyInput").bind('input propertychange',function(){
			localStorage.setItem('ApiKey', $(".ApiKeyInput").val());
		})
		$(".ApiSecretInput").bind('input propertychange',function(){
			localStorage.setItem('ApiSecret', $(".ApiSecretInput").val());
		})
	}
}
function NewPage(pageType,pageInfo,from,inSilence){
	if(pageType == "Settings" && SettingsPageId != -1){
		ChangePage(SettingsPageId);
		return;
	}
	if(pageType == "DownloadInfo" && DownloadPageId != -1){
		ChangePage(DownloadPageId);
		return;
	}
	if(Array.isArray(pageInfo)){
		for(var i=0;i<pageInfo.length;i++){
			pageInfo[i] = $.trim(pageInfo[i]);
			if(pageInfo[i] == '')	return;
		}
	}
	else{
		pageInfo = $.trim(pageInfo);
		if(pageInfo == "")	return;
	}
	var ret = PagePool.length;
	ifShown.push(true);
	PagePool.push({PageType: pageType, PageInfo: pageInfo, sonList: [], fatherPage: from});
	if(PagePool[ret].PageType == "Settings")	SettingsPageId = ret;
	if(PagePool[ret].PageType == "DownloadInfo")	DownloadPageId = ret;
	buildRealPage(ret, pageType, pageInfo);
	if(from == -1)	MainPageIds.push(ret);
	else	PagePool[from].sonList.push(ret);
	rebuildPage();
	if(!inSilence)	ChangePage(ret);
	if(windowOpenIf)	closeMessageBox();
	return ret;
}
function openWindow(title){
	windowOpenIf = true;
	$(".WindowTitle").html(title);
	$(".WindowContent").html("");
	if(title == "Blog"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('HomeBlogEntry','.',-1,false)"><i class="fa fa-home"></i> Homepage Blog Entry</div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('TopBlogEntry','.',-1,false)"><i class="fa fa-fire"></i> Top Blog Entry</div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('UserBlogEntry',$('.UsernameInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-user"></i><span>&nbsp;Blogs&nbsp;By&nbsp;User&nbsp;@&nbsp;</span><input type="text" class="UsernameInput" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div style="width:100%;font-size:14px;text-align:center;">--------- OR ---------</div>`)
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('UserBlogEntry',$('.BlogIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-sticky-note"></i><span>&nbsp;Blog&nbsp;#&nbsp;</span><input type="text" class="BlogIdInput" style="flex:1;" onclick=';' /></div></div>`);
	}
	if(title == "Contest/Gym"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('ContestList','.',-1,false)"><i class="fa fa-calendar"></i> Contest List</div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('GymList','.',-1,false)"><i class="fa fa-calendar"></i> Gym List</div>`);
		$(".WindowContent").append(`<div style="width:100%;font-size:14px;text-align:center;">--------- OR ---------</div>`)
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Contest',$('.ContestIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-calendar-o"></i><span>&nbsp;Contest&nbsp;#&nbsp;</span><input type="text" class="ContestIdInput" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Gym',$('.GymIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-sitemap"></i><span>&nbsp;Gym&nbsp;#&nbsp;</span><input type="text" class="GymIdInput" style="flex:1;" onclick=';' /></div></div>`);
	}
	if(title == "Problem"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('ProblemList','.',-1,false)"><i class="fa fa-book"></i> Problem List</div>`);
		$(".WindowContent").append(`<div style="width:100%;font-size:14px;text-align:center;">--------- OR ---------</div>`)
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Problem',[$('.ContestIdInput').val(),$('.IndexInput').val()],-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-calendar-o"></i><span>&nbsp;Contest&nbsp;#&nbsp;</span><input type="text" class="ContestIdInput" style="flex:1;" onclick=';' /><span>&nbsp;Index&nbsp;=&nbsp;</span><input type="text" class="IndexInput" style="width:60px;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Problem',[$('.GymIdInput').val(),$('.IndexInput2').val()],-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-sitemap"></i><span>&nbsp;Gym&nbsp;#&nbsp;</span><input type="text" class="GymIdInput" style="flex:1;" onclick=';' /><span>&nbsp;Index&nbsp;=&nbsp;</span><input type="text" class="IndexInput2" style="width:60px;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Problem',['99999', $('.IndexInput3').val()],-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-question-circle"></i><span>&nbsp;ACMSGURU&nbsp;#&nbsp;</span><input type="text" class="IndexInput3" style="flex:1;" onclick=';' /></div></div>`);
	}
	if(title == "Standings"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Standings',$('.ContestIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-calendar-o"></i><span>&nbsp;Standings&nbsp;of&nbsp;Contest&nbsp;#&nbsp;</span><input type="text" class="ContestIdInput" style="flex:1;" onclick=';' /></div></div>`);
	}
	if(title == "Status"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('ContestStatus',$('.ContestIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-calendar-o"></i><span>&nbsp;Status&nbsp;of&nbsp;Contest&nbsp;#&nbsp;</span><input type="text" class="ContestIdInput" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('HackPage',$('.ContestIdInput2').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-user-secret"></i><span>&nbsp;Hacks&nbsp;of&nbsp;Contest&nbsp;#&nbsp;</span><input type="text" class="ContestIdInput2" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div style="width:100%;font-size:14px;text-align:center;">--------- OR ---------</div>`)
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Submission',$('.SubmissionIdInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-pie-chart"></i><span>&nbsp;Submission&nbsp;#&nbsp;</span><input type="text" class="SubmissionIdInput" style="flex:1;" onclick=';' /></div></div>`);
	}
	if(title == "User"){
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('User',$('.UsernameInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-user"></i><span>&nbsp;User&nbsp;@&nbsp;</span><input type="text" class="UsernameInput" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('Group',$('.GroupInput').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-users"></i><span>&nbsp;Group&nbsp;#&nbsp;</span><input type="text" class="GroupInput" style="flex:1;" onclick=';' /></div></div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('FriendList','.',-1,false)"><i class="fa fa-users"></i> Friends Of Mine</div>`);
		$(".WindowContent").append(`<div class="OptionBar" onclick="NewPage('RatingPage',$('.UsernameInput2').val(),-1,false)"><div style="display:flex;flex-direction: row;width:100%"><i class="fa fa-user"></i><span>&nbsp;Rating&nbsp;of&nbsp;@&nbsp;</span><input type="text" class="UsernameInput2" style="flex:1;" onclick=';' /></div></div>`);
	}
	$('.AllWindow').css('display','block');
	$('.AlertWindow').css('display','block');
	$(".BlackBackground").css('background','rgba(0,0,0,0.5)');
}
$('.BlackBackground').attr('onclick','closeMessageBox()');