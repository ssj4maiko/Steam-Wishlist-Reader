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
	,WLR_content = document.getElementById('wishlist_items')
	,WLR_form = WLR_content.parentNode
	,tmp = null
	,language = null;

function WLR_getItem(WLR_row){
	var  contents = {}
		,logo = findClass(WLR_row,'gameListRowLogo')
		,item = findClass(WLR_row,'wishlistRowItem');

	contents.id			= WLR_row.id.substr(5);
	contents.store_url	= logo.children[0].href;
	contents.icon		= logo.children[0].children[0].src;
	contents.name		= findTag(item,'h4').textContent;
	contents.timeAdded	= WLR_timeConverter(findClass(item,'wishlist_added_on').textContent);
	var rank = findClass(item,'wishlist_rank');

	if(rank)
		contents.rank = rank.value;
	else
		contents.rank = '';

	var price = findClass(item,'price');
	if(!price){
		price = findClass(item,'discount_original_price');
	}

	if(price)
		contents.price = price.textContent;
	else
		contents.price = '';

	return contents;
}

for(var i=0;i<WLR_content.children.length;++i){
	tmp = WLR_getItem(WLR_content.children[i]);
	WLR_gamesList[tmp.id] = tmp;
}

console.log(WLR_gamesList);