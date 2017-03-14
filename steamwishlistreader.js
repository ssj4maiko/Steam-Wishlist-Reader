/**
https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI
	http://store.steampowered.com/api/appdetails?filters=basic,developers,publishers,release_date,price_overview,genres&appids=GAMEID
*/
/***

	For those trying to add their language to be compatible, these are the functions that must be changed. Use Ctrl+F to look at them:

	function setLanguage
		Copy one of the available case and add your lang option, you can see it at the <html>, use either Source Code or Inspect.
		For the months object, you must change the index (the number values must be always the same), while you change the value
		for everything else.

	function getDivider
		The cases come from the API based on your location, so even if you use another language, steam prices are still local. You can
		find yours all over the internet, specially by making currency conversions on google. You can also try opening the API above,
		just change GAMEID with another random game ID (As long as it has a price, of course).
		Prices will come as an integer value, some currencies are usually divided in a centesimal value (Divide by 100),
		others are not (Divide by 1), maybe there are some with decimals or even multipliers, I don't know.

		For translators that can program, you don't need a new case/break if it's an option that already exists, you can just add
		the Case at any point before the break you need. I left USD and BRL as an example of what you can do.

	WLR_timeConverter
		This is gonna be harder and will need direct programming. Dates are formatted in significantly different ways in all regions,
		you need to work the string that is given and fill the <day>, <month> and <year> variables. If you can program or do Javascript,
		ask for help.

		Also a Tip, since this happened in the english version, items added in the current year may not contain the year itself, this
		means that tabs and buttons may appear at on the month item.

***/
function setLanguage(lang){
	switch(lang){
		case 'en':
			months = {	// Months in Lowercase
				 january	: '01'
				,february	: '02'
				,march		: '03'
				,april		: '04'
				,may		: '05'
				,june		: '06'
				,july		: '07'
				,august		: '08'
				,september	: '09'
				,october	: '10'
				,november	: '11'
				,december	: '12'
			}
			language.remove 		= "remove";	// Lowercase
			language.csvin			= "CSV Import";
			language.csvout			= "CSV Export";
			language.free			= "Free";
			language.headers		= ['Game ID','Original Rank','Type','Release Date','Product Name','Parent Product','Time Added','Price', 'Developer', 'Publisher','Genres','Store URL'];
			language.API_ERROR		= "There was an error checking for the game data for {n_error} game(s).\n It could be a game is not listed on Steam anymore,\n or the API is unresponsive because we made too many requests, in which case, try again in ~5 minutes.";
			language.CACHE_ERROR	= "There was an error on caching the data. Too many games?";
			language.WRONG_FILETYPE	= "You selected a file that doesn't seem right. Save it as a CSV file, \" for strings";
		break;
		default:
			alert("Wishlist Steam Export does not support your language yet.")
			break;
	}
}
function getDivider(cur){
	if(language.currency == null){
		language.currency = cur;
		switch(cur){
			case "USD":
			case "BRL":
				language.priceDivider = 100;
				break;
			case "JPY":
				language.priceDivider = 1;
				break;
			default:
				language.priceDivider = 1;
		}
	}
	return language.priceDivider;
}
var  months = {}
	,language = {
		 remove: "remove" 		// The content which is written next to the date. This is used to identify and remove that.
		,csvin: "CSV Import"	// Button Lavels
		,csvout: "CSV Export"
		,free: "Free"			// Price for Free games at the CSV
		,headers: ['Game ID','Original Rank','Type','Release Date','Product Name','Parent Product','Time Added','Price', 'Developer', 'Publisher','Genres','Store URL']
		,currency: null			// Identified automatically
		,priceDivider: 100		// Must be inserted at the getDivider function

		,API_ERROR: "There was an error checking for the game data for {n_error} game(s). It could be a game is not listed on Steam anymore, or the API is unresponsive because we made too many requests, in which case, try again in ~5 minutes."
		,CACHE_ERROR: "There was an error on caching the data. Too many games?"
		,WRONG_FILETYPE: "You selected a file that doesn't seem right. Save it as a CSV file, \" for strings"
	}
	,progress = {
		 total:0
		,current:0
		,counter:0
	}
	,today = new Date()
	,cache = {}
	,WLR_error = 0
	,WLR_warning = 1;

let gettingItem = browser.storage.local.get('cache');
gettingItem.then(function(items){
	if(typeof items.cache !== "undefined"){
		cache = items.cache;
	}
	/*console.log("Recovering Cache",cache);*/
}, function(error){
	console.log("Error: ",error);
});
gettingItem = browser.storage.local.get('warning');
gettingItem.then(function(value){
	WLR_warning = value ? value.warning : 1;
	/*console.log("Warning value",WLR_warning);*/}
, function(error){warning = 1});


setLanguage(document.documentElement.lang);


function findClass(element, className) {
	var foundElement = null, found;
	function recurse(element, className, found) {
		for (var i = 0; i < element.childNodes.length && !found; i++) {
			var el = element.childNodes[i];
			if(el.classList != undefined)
				found = el.classList.contains(className);
			if(found){
				foundElement = el;
				break;
			}
			recurse(element.childNodes[i], className, found);
		}
	}
	recurse(element, className, false);
	return foundElement;
}
function findTag(element, tagName) {
	var foundElement = null, found;
	tagName = tagName.toUpperCase();
	function recurse(element, tagName, found) {
		for (var i = 0; i < element.childNodes.length && !found; i++) {
			var el = element.childNodes[i];
			if(el.tagName != undefined)
				found = el.tagName == tagName;
			if(found){
				foundElement = el;
				break;
			}
			recurse(element.childNodes[i], tagName, found);
		}
	}
	recurse(element, tagName, false);
	return foundElement;
}
function WLR_timeConverter(date){
	var  year = '1970'
		,month= '01'
		,day  = '01'
		,orig = date;
	date = date.trim().toLowerCase();
	date = date.replace("("+(language.remove)+")",'');

	switch(document.documentElement.lang){
		case 'en':
			date = date.substr(9); //'Added on '
			date = date.split(' ');
			day = ('0'+date[0]).substr(-2);
			month = date[1].replace(',','').trim();
			month = months[month];
			/*if(!month)
				console.log(month,date,orig);*/
			if(date[2])
				year = date[2].substr(0,4);
			else
				year = today.getFullYear();
			break;
		/**

			DETECT EVERY OTHER LANGUAGE, don't forget to trim if things don't seem to be working, also don't forget to remove the (Remove) text.
			Also, add the every text translation stuff, up there.

		**/
	}
	return year+'-'+month+'-'+day;
}

var  WLR_gamesList = []
	,WLR_content = document.getElementById('wishlist_items')
	,WLR_form = WLR_content.parentNode
	,tmp = null;

function WLR_getItem(WLR_row){
	var  contents = {}
		,logo = findClass(WLR_row,'gameListRowLogo')
		,item = findClass(WLR_row,'wishlistRowItem');

	contents.id			= WLR_row.id.substr(5).trim();
	// Because the content may be loaded on a cache or not, we must access the same function from any of the two options.
	function loadItem(){
		var  id = contents.id
			,gamedata = cache[id].data;

		//console.log("Load Item",id,gamedata);
		if(gamedata){
			contents.store_url		= logo.children[0].href.trim();
			contents.icon			= logo.children[0].children[0].src.trim();
			contents.name			= gamedata.name;//findTag(item,'h4').textContent.trim();
			contents.type			= gamedata.type;
			contents.parent			= gamedata.fullgame ? gamedata.fullgame.name : '';
			contents.release_date	= gamedata.release_date.date;
			contents.timeAdded		= WLR_timeConverter(findClass(item,'wishlist_added_on').textContent).trim();
			contents.price	 		= gamedata.is_free ? language.free : (gamedata.price_overview ? gamedata.price_overview.initial / getDivider(gamedata.price_overview.currency) : '-');
			contents.developers		= gamedata.developers.join(', ');
			contents.publishers		= gamedata.publishers.join(', ');

			var genres = [];
			if(gamedata.genres){
				for(var i=0; i<gamedata.genres.length; ++i){
					genres.push(gamedata.genres[i].description);
				}
				contents.genres = genres.join(', ');
			} else {
				contents.genres = '-';
			}
		} else {
			contents.store_url		= logo.children[0].href.trim();
			contents.icon			= logo.children[0].children[0].src.trim();
			contents.name			= findTag(item,'h4').textContent.trim();
			contents.type			= '-';
			contents.parent			= '-';
			contents.release_date	= '-';
			contents.timeAdded		= WLR_timeConverter(findClass(item,'wishlist_added_on').textContent).trim();
			var price = findClass(item,'price');
			if(!price){		price = findClass(item,'discount_original_price');	}
			if(price)		contents.price = price.textContent.trim();	else	contents.price = '-';
			contents.developers		= '-';
			contents.publishers		= '-';
			contents.genres 		= '-';
		}

		var rank = findClass(item,'wishlist_rank');
		if(rank)
			contents.rank = rank.value.trim();
		else
			contents.rank = '';
		WLR_gamesList.push(contents);
		--progress.counter;
	}

	// Check if the content has been cached already
	progress.counter++;
	if(!cache[contents.id]){
		var httpRequest = new XMLHttpRequest();
		if (!httpRequest) {
			alert('Giving up :( Cannot create an XMLHTTP instance');
			return false;
		}
		httpRequest.onreadystatechange = function(){
			if (httpRequest.readyState === XMLHttpRequest.DONE) {
				if (httpRequest.status === 200) {
					var json = JSON.parse(httpRequest.responseText);
					//console.log("JSON",json);
					if(json[contents.id].success){
						delete json[contents.id].data.pc_requirements;
						delete json[contents.id].data.mac0_requirements;
						delete json[contents.id].data.linux_requirements;
						delete json[contents.id].data.legal_notice;
						delete json[contents.id].data.detailed_description;
					}
					cache[contents.id] = json[contents.id];
					// Once the info is cached, loadItem
					loadItem(json[contents.id].success);

					if(!json[contents.id].success){
						//--progress.counter;
						++WLR_error;
					}
				} else {
					console.log("Problem on connecting",httpRequest.status,'---',httpRequest);
				}
			}
		};
		httpRequest.open('GET', 'http://store.steampowered.com/api/appdetails?filters=basic,developers,publishers,release_date,'
																					+'price_overview,genres&appids='+contents.id);
		httpRequest.send();
		//console.log("Calling API for <",contents.id,">")
	} else {
		// info was already cached, loadItem
		loadItem();
	}

}
/**********************




**********************/

function addButtons(){
	var csvOut = document.getElementById('csvout_id');
	if(csvOut){
		var csvIn = document.getElementById('csvin_id'),
			base = csvOut.parentNode;
		csvOut.parentNode.removeChild(csvOut);
		csvIn.parentNode.removeChild(csvIn);
		base.parentNode.removeChild(base);
	}

	var  nextTo = document.getElementById('save_action_disabled_1')
		,base = document.createElement('div')
		,csvIn = document.createElement('input')
		,csvOut = document.createElement('input')
		,labelIn = document.createElement('label')
		,labelOut = document.createElement('label')
		;

	csvOut.value = "Download";
	csvOut.id = "csvout_id";
	csvOut.type = "button";
	csvOut.style.display = "none";
	labelOut.textContent = language.csvout;
	labelOut.htmlFor = csvOut.id;

	csvIn.textContent = language.csvin;
	csvIn.id = "csvin_id";
	csvIn.type = "file";
	csvIn.style.display = "none";
	labelIn.textContent = language.csvin;
	labelIn.htmlFor = csvIn.id;


	base.appendChild(labelOut);
	base.appendChild(csvOut);
	base.appendChild(labelIn);
	base.appendChild(csvIn);
	base.classList.add('WRL_Buttons');
	console.log(base);
	console.log(nextTo);

	nextTo.parentNode.insertBefore(base,nextTo);

	csvOut.addEventListener('click',createCSV);
	csvIn.addEventListener('change',importCSV);
}

function WLR_prepare(){
	/**
		Limiting the total may help with tests. Default: WLR_content.children.length;
	**/
	progress.total = WLR_content.children.length;
	progress.current = 0;
	progress.counter = 0;
	WLR_error = 0;
	
	for(var i=0;i<progress.total;++i){
		//console.log("First Loop",progress);
		progress.current = i+1;
		WLR_getItem(WLR_content.children[i]);
	}
	//console.log(progress);
}
function download(name, val) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(val));
	element.setAttribute('download', name);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}
function createCSV(e){
	// Because async XHR can take some time to load, we keep it on a loop checking and updating the progress
	WLR_prepare();
	var intervalLoop = window.setInterval(function(){
		// Only run when everything is fully loaded
		if(progress.total > 0 && progress.total == progress.current && progress.counter == 0){
			//Stop loop
			window.clearInterval(intervalLoop);
			/*
			let setting = browser.storage.local.clear();
			setting.then(function(){
				alert('Clear');
			},null);
			*/
			setting = browser.storage.local.set({cache : cache});
			setting.then(null, function(){
				alert(language.CACHE_ERROR);
			});

			// CSV configuration variables
			var  separator = ','
				,textSep = '"'
				,br = "\n"
				// Function variables
				,text = []
				,row = []
				,tmp = []
				,header = language.headers;

			//Insert CSV Header
			for(var i=0;i<header.length;++i){
				row.push(textSep+header[i]+textSep);
			}
			text.push(row.join(separator));

			//Insert CSV content that was prepared on WLR_getItem
			for(i=0;i < WLR_gamesList.length; ++i){
				//		['Game ID','Original Rank','Type','Release Date','Product Name','Belongs to','Time Added','Price', 'Developer', 'Publisher','Genres','Store URL'];
				tmp = [
					 WLR_gamesList[i].id
					,WLR_gamesList[i].rank
					,WLR_gamesList[i].type
					,WLR_gamesList[i].release_date
					,WLR_gamesList[i].name
					,WLR_gamesList[i].parent
					,WLR_gamesList[i].timeAdded
					,WLR_gamesList[i].price
					,WLR_gamesList[i].developers
					,WLR_gamesList[i].publishers
					,WLR_gamesList[i].genres
					,WLR_gamesList[i].store_url
				];
				row = [];
				for(var j=0;j<tmp.length;++j){
					row.push(textSep+tmp[j]+textSep);
				}
				text.push(row.join(separator));
			}
			download("Wishlist.csv",text.join(br));
			
			if(WLR_error > 1 || (WLR_error > 2 && WLR_warning == 1)){	
				alert(language.API_ERROR.replace('{n_error}',WLR_error));
				WLR_warning = 0;
				browser.storage.local.set({warning : WLR_warning});
			}
		}
	},5000);

	e.preventDefault();
	return false;
}

function throwEverythingBack(){
	var item, rank;
	for(var i=0;i<WLR_content.children.length;++i){
		item = findClass(WLR_content.children[i],'wishlistRowItem')
		rank = findClass(item,'wishlist_rank');
		rank.value = parseInt(rank.value.trim()) + 99000;
	}
}
function reSortByCSV(csv){
	var  br = "\n"
		,separator = ','
		,firstLine = 1;
	if(csv.indexOf("\r\n") !== false)
		br = "\r\n";
	/*
	if(csv.indexOf(';"') !== false)
		separator = ";";
	*/
	csv = csv.split(br);
	var event = new Event('change');

	for(var i = firstLine; i<csv.length;++i){
		if(csv[i] == '')
			continue;
		var gameId = csv[i].split(separator)[0];
		WLR_form['priority['+gameId+']'].value = i;
		WLR_form['priority['+gameId+']'].dispatchEvent(event);
	}
}

function importCSV(e){
	var  file = e.target.files[0]
		,reader = new FileReader();

	reader.onload = function(e){
		if(e.target.result.indexOf(language.headers[0]) !== false){
			throwEverythingBack();
			reSortByCSV(e.target.result);
		} else {
			alert(language.WRONG_FILETYPE);
		}
	};
	reader.readAsText(file);
}
/**********************




**********************/
addButtons();