/**
https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI
	http://store.steampowered.com/api/appdetails?filters=basic,developers,publishers,release_date,price_overview,genres&appids=GAMEID
*/
var  months = {}
	,language = {
		 remove: "remove"
		,csvin: "CSV Import"
		,csvout: "CSV Export"
		,free: "Free"
		,headers: ['Game ID','Original Rank','Type','Release Date','Product Name','Parent Product','Time Added','Price', 'Developer', 'Publisher','Genres','Store URL']
		,currency: null
		,priceDivider: 100
		,API_ERROR: "There was an error checking for the game data. If you have over or almost 200 games on your wishlist, you may want to try again after 5 minutes"
		,CACHE_ERROR: "There was an error on caching the data. Too many games?"
	}
	,progress = {
		 total:0
		,current:0
		,counter:0
	}
	,today = new Date()
	,cache = {}
	,WLR_error = 0;

let gettingItem = browser.storage.local.get();
gettingItem.then(function(items){cache = items; console.log("REcovering Cache",cache);}, function(error){console.log("Error: ",error);});
console.log("Cache:",cache);

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
			language.remove 	= "remove";	// Lowercase
			language.csvin		= "CSV Import";
			language.csvout		= "CSV Export";
			language.free		= "Free";
			language.headers	= ['Game ID','Original Rank','Type','Release Date','Product Name','Parent Product','Time Added','Price', 'Developer', 'Publisher','Genres','Store URL'];
			language.API_ERROR	= "There was an error checking for the game data. If you have over or almost 200 games on your wishlist, you may want to try again after 5 minutes";
			language.CACHE_ERROR= "There was an error on caching the data. Too many games?";
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
			if(!month)
				console.log(month,date,orig);
			if(date[2])
				year = date[2].substr(0,4);
			else
				year = today.getFullYear();
			break;
		case 'pt-br':
			
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
			,gamedata = cache[id][id].data;

		console.log("Load Item",id,cache[id][id]);
		contents.store_url		= logo.children[0].href.trim();
		contents.icon			= logo.children[0].children[0].src.trim();
		contents.name			= gamedata.name;//findTag(item,'h4').textContent.trim();
		contents.type			= gamedata.type;
		contents.parent			= gamedata.fullgame ? gamedata.fullgame.name : '';
		contents.release_date	= gamedata.release_date.date;
		contents.timeAdded		= WLR_timeConverter(findClass(item,'wishlist_added_on').textContent).trim();
		contents.price	 		= gamedata.is_free ? language.free : (gamedata.price_overview ? gamedata.price_overview.initial * getDivider(gamedata.price_overview.currency) : '-');
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

		var rank = findClass(item,'wishlist_rank');
		if(rank)
			contents.rank = rank.value.trim();
		else
			contents.rank = '';
		/*
		var price = findClass(item,'price');
		if(!price){
			price = findClass(item,'discount_original_price');
		}

		if(price)
			contents.price = price.textContent.trim();
		else
			contents.price = '';
		*/
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
					if(json[contents.id].success){
						cache[contents.id] = json;
						console.log("JSON",json);
						// Once the info is cached, loadItem
						loadItem();
					} else {
						--progress.counter;
						WLR_error = 1;
					}
				} else {
					console.log("Problem on connecting",httpRequest.status,'---',httpRequest);
				}
			}
		};
		httpRequest.open('GET', /*'http://localhost/steamwishlistreader/test.json'*/
						'http://store.steampowered.com/api/appdetails?filters=basic,developers,publishers,release_date,price_overview,genres&appids='+contents.id);
		httpRequest.send();
		console.log("Calling API for <",contents.id,">")
	} else {
		// info was already cached, loadItem
		loadItem();
	}

}
/**********************




**********************/

function addButtons(){
	var csvOut = document.getElementById('csvout_id');
	if(!csvOut){
		var  nextTo = document.getElementById('wishlist_sort_options')
			,base = document.createElement('div')
			,csvIn = document.createElement('button')
			,csvOut = document.createElement('button')
			;
		csvOut.textContent = language.csvout;
		csvOut.id = "csvout_id";
		csvIn.textContent = language.csvin;
		csvIn.id = "csvin_id";


		base.appendChild(csvIn);
		base.appendChild(csvOut);
		base.classList.add('sort_options');

		nextTo.parentNode.insertBefore(base,nextTo);
	} else {
		var csvIn = document.getElementById('csvin_id');
		csvOut.removeEventListener('click',createCSV);
		csvIn.removeEventListener('click',importCSV);
	}

	csvOut.addEventListener('click',createCSV);
	csvIn.addEventListener('click',importCSV);
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
		console.log("First Loop",progress);
		progress.current = i+1;
		WLR_getItem(WLR_content.children[i]);
		//WLR_gamesList[tmp.id] = tmp;
	}
	console.log(progress);
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
		console.log("First Loop",progress);
		// Only run when everything is fully loaded
		if(progress.total > 0 && progress.total == progress.current && progress.counter == 0){
			//Stop loop
			window.clearInterval(intervalLoop);
			let setting = browser.storage.local.set(cache);
			setting.then(null, function(){
				alert(language.CACHE_ERROR);
			});

			if(!WLR_error){
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
			} else {
				alert(language.API_ERROR);
			}
		}
	},5000);

	e.preventDefault();
	return false;
}
function importCSV(e){
	alert("will be done");
}
/**********************




**********************/
addButtons();

/*
function redirect(requestDetails) {
	console.log("Redirecting: " + requestDetails);
	return {
		redirectUrl: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"
	};
}
browser.webRequest.onBeforeRequest.addListener(
	redirect
	,{urls: ["*://store.steampowered.com/api/appdetails*"]}
	,["blocking"]
);
*/