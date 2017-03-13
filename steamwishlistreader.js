var  months = {}
	,today = new Date();
function setLanguage(lang){
	switch(lang){
		case 'en':
			months = {
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
		break;
	}
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
		,day  = '01';
	date = date.trim();
	date = date.replace('\t','');
	switch(document.documentElement.lang){
		case 'en':
			date = date.replace("(Remove)",'');
			date = date.substr(9); //'Added on '
			date = date.split(' ');
			day = ('0'+date[0]).substr(-2);
			month = date[1].trim().replace(',','').toLowerCase();
			month = months[month];
			if(date[2])
				year = date[2].substr(0,4);
			else
				year = today.getFullYear();
			break;
		case date.indexOf('Adicionado em'):
			language = 'PT-BR';
			break;
	}
	return year+'-'+month+'-'+day;
}

var  WLR_gamesList = {}
	,WLR_gamesList_array = []
	,WLR_content = document.getElementById('wishlist_items')
	,WLR_form = WLR_content.parentNode
	,tmp = null
	,language = null;

function WLR_getItem(WLR_row){
	var  contents = {}
		,logo = findClass(WLR_row,'gameListRowLogo')
		,item = findClass(WLR_row,'wishlistRowItem');

	contents.id			= WLR_row.id.substr(5).trim();
	contents.store_url	= logo.children[0].href.trim();
	contents.icon		= logo.children[0].children[0].src.trim();
	contents.name		= findTag(item,'h4').textContent.trim();
	contents.timeAdded	= WLR_timeConverter(findClass(item,'wishlist_added_on').textContent).trim();
	var rank = findClass(item,'wishlist_rank');

	if(rank)
		contents.rank = rank.value.trim();
	else
		contents.rank = '';

	var price = findClass(item,'price');
	if(!price){
		price = findClass(item,'discount_original_price');
	}

	if(price)
		contents.price = price.textContent.trim();
	else
		contents.price = '';

	return contents;
}
/**********************




**********************/

function addButtons(){
	var  nextTo = document.getElementById('wishlist_sort_options')
		,base = document.createElement('div')
		,csvIn = document.createElement('button')
		,csvOut = document.createElement('button')
		;
	csvOut.textContent = "CSV Export";
	csvIn.textContent = "CSV Import";

	csvOut.addEventListener('click',createCSV);

	base.appendChild(csvIn);
	base.appendChild(csvOut);
	base.classList.add('sort_options');

	nextTo.parentNode.insertBefore(base,nextTo);

}
function WLR_prepare(){
	if(WLR_gamesList_array.length == 0){
		for(var i=0;i<WLR_content.children.length;++i){
			tmp = WLR_getItem(WLR_content.children[i]);
			WLR_gamesList[tmp.id] = tmp;
			WLR_gamesList_array.push(tmp);
		}
	}

	console.log(WLR_gamesList);
}
function download(name, val) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(val));
	element.setAttribute('download', name);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}
function createCSV(e){
	WLR_prepare();
	var  separator = ','
		,textSep = '"'
		,br = "\n"
		,text = []
		,row = []
		,tmp = []
		,header = ['Game ID','Original Rank', 'Name','Time Added','Price'];

	for(var i=0;i<header.length;++i){
		row.push(textSep+header[i]+textSep);
	}
	text.push(row.join(separator));

	for(i in WLR_gamesList){
		tmp = [WLR_gamesList[i].id, WLR_gamesList[i].rank, WLR_gamesList[i].name, WLR_gamesList[i].timeAdded, WLR_gamesList[i].price];
		row = [];
		for(var j=0;j<tmp.length;++j){
			row.push(textSep+tmp[j]+textSep);
		}
		text.push(row.join(separator));
	}
	download("Wishlist.csv",text.join(br));

	e.preventDefault();
	return false;
}
/**********************




**********************/
addButtons();