/*This is doitest.js */

/* == Define global variables == */

/* doiRegExp is a regular expression to determine if a string is a valid DOI (Digital Object Identifier) */
var doiRegExp = new RegExp('(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)');

/* Change this value if you are using this script in an ILLiad ArticleRequest Form or not -- set to true or false */
var isILLiad = false;

/* OpenURLbase is the URL for your institution's OpenURL resolver, stopping just before the "?" before the OpenURL fields */
var OpenURLbase = 'https://suny-bro.primo.exlibrisgroup.com/discovery/openurl';
var OpenURLbase2 = 'https://search.lib.buffalo.edu/discovery/openurl';

/* OpenURL prefix is only required if your resolver requires instiution specific information to be included */
var OpenURLprefix ='institution=01SUNY_BRO&vid=01SUNY_BRO:01SUNY_BRO';
var OpenURLprefix2 = 'institution=01SUNY_BUF&vid=01SUNY_BUF:everything';

/* OpenURLsuffix is only required if your resolver requires institutional authentication in a GET variable (EBSCO), as opposed to having the code in the host name (like 360Link).
Change this value to '' if you're in the latter category. */
var OpenURLsuffix = '';

/* OpenURLbase is the label displayed for OpenURL links */
var OpenURLbranding = 'Get an electronic copy';

/* == Define function for testing whether the input field contains a properly formatted DOI == */
function DOItest(DOItoTest) {
	/* DOI RegExp from https://github.com/regexhq/doi-regex/blob/master/index.js */
	if (doiRegExp.test(DOItoTest)) {
		$('#doiResponse').html('<!-- Valid DOI -->');
		return true;
	} else {
		$('#doiResponse').html('<p>Not a valid DOI</p>');
		return false;
	}
}

/* == Get things done once the document is ready == */
$(document).ready(function() {
	if (isILLiad == true) {
		$('#doiSearchBox').hide();
	}
	$('#haveDOI').click(function() {
		$('#doiSearchBox').show();
		$('#doiSearchBox').dialog({ title: "DOI Search for Interlibrary Loan", modal: true, width: 350, position: 'middle', center: true, buttons: [
		{
		text: 'Close',
		click: function() { $(this).dialog("close");}
		}
		] });

	});
	$('#checkDOI').click(function() {
		$('#doiResponse').text('');
		if (!(isILLiad == true)) {
			$('#doiResponse').css({"border":"1px solid #bbb", "margin-top":"0.2em", "padding":"0.5em"});
		}
		DOIval = $('#inputDOI').val();
		if (DOItest(DOIval) == true){
			DOI = DOIval.match(doiRegExp)[0];
			DOIurl = 'https://api.crossref.org/works/' + DOI;
			$('#doiResponse').append('<!--Loading and testing ' + DOIurl + '-->');
			/* need error handling for cases with no CrossRef DOI record found, i.e. http://api.crossref.org/works/10.1016/j.iree.2016.07.002 */
			$.getJSON( DOIurl, function( data ) {
			})
			.success(function(data) {
				/* Define Local OpenURL variable */
				var strAuthor = '';
				var strJournal = '';
				var strTitle = '';
				var strVolume = '';
				var strIssue = '';
				var strType = '';
				var strDate = '';
				var strPublishedPrint = '';
				var strPublishedOnline = '';
				var strCreated = '';
				var strPage = '';
				var strISBN = '';
				var strCitedIn = '';
				if (isILLiad == true) {
					strCitedIn = 'CrossRefLookupLR';
				} else {
					strCitedIn = 'CrossRefLookupLR';
				}
				$.each(data, function() {
				  $.each(this, function(k, v) {
					/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
					/* $('#doiResponse').append(k + ': ' + v + '<br />'); */
					switch(k){
						case 'container-title':
							strJournal = v;
							break;
						case 'title':
							strTitle = v;
							break;
						case 'volume':
							strVolume = v;
							break;
						case 'issue':
							strIssue = v;
							break;
						case 'page':
							strPage = v;
							break;
						case 'type':
							/* TBD: nest conditionals to convert types into ILLiad/OpenURL values. Perhaps apply that logic separately to make code usable for both resolution systems? */
							strType = v;
							break;
						case 'published-print':
							/* Need nested loop to process array; also run logic later to prioritize published-print over published-online over created date */
							$.each(this, function(k2,v2) {
								/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
								if (k2 == 'date-parts'){
									strPublishedPrint = v2.toString().split(',')[0];
								}
							});
							break;
						case 'published-online':
							/* Need nested loop to process array; also run logic later to prioritize published-print over published-online over created date */
							$.each(this, function(k2,v2) {
								/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
								if (k2 == 'date-parts'){
									strPublishedOnline = v2.toString().split(',')[0];
								}
							});
							break;
						case 'created':
							/* Need nested loop to process array; also run logic later to prioritize published-print over published-online over created date */
							$.each(this, function(k2,v2) {
								/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
								if (k2 == 'date-parts'){
									strCreated = v2.toString().split(',')[0];
								}
							});
							break;

						case 'ISSN':
							strISSN = v.toString().split(',')[0];
							break;
						case 'ISBN':
							strISBN = v;
							break;
						case 'author':
							/* exists in a nested array for articles with multiple authors. Check for functionality if not an array: checked 2016/8/5 16:54 EDT */
							if (strAuthor == ''){
								var strGiven = '';
								var strFamily = '';
								$.each(this, function() {
									$.each(this, function(k2,v2) {
										/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
										/*$('#doiResponse').append(k2 + ': ' + v2 + '<br />');*/
										if (strAuthor == ''){
											if (k2 == 'family'){
												strFamily = v2;
											}
											if (k2 == 'given') {
												strGiven = v2;
											}
										}
									});
									if (!(strFamily == '') && !(strGiven =='')){
										strAuthor = strFamily + ', ' + strGiven;
									}
								});
							}
							break;
					}
				  });
				});

				/* Calculate Best Approximation of Date of Publication */
				if (!(strPublishedPrint == '')) {
					strDate = strPublishedPrint;
				} else if (!(strPublishedOnline == '')) {
					strDate = strPublishedOnline;
				} else if (!(strCreated == '')) {
					strDate = strCreated;
				}

				if (!(isILLiad == true)) {
					/* Since this isn't for ILLiad, Generate Output to the screen and create an OpenURL link */
					var OpenURLLink = OpenURLbase + '?' + OpenURLprefix + '&sid=' + encodeURIComponent(strCitedIn) + '&genre=' + encodeURIComponent(strType) + '&issn=' + strISSN + '&ISBN=' + strISBN + '&volume=' + strVolume + '&issue=' + strIssue + '&date=' + encodeURIComponent(strDate) + '&spage=' + strPage + '&pages=' + strPage + '&title=' + encodeURIComponent(strJournal) + '&atitle=' + encodeURIComponent(strTitle) + '&aulast=' + encodeURIComponent(strAuthor) + '&id=doi%3A%2F%2F' + encodeURIComponent(DOI) + OpenURLsuffix;
					var OpenURLLink2 = OpenURLbase2 + '?' + OpenURLprefix2 + '&sid=' + encodeURIComponent(strCitedIn) + '&genre=' + encodeURIComponent(strType) + '&issn=' + strISSN + '&ISBN=' + strISBN + '&volume=' + strVolume + '&issue=' + strIssue + '&date=' + encodeURIComponent(strDate) + '&spage=' + strPage + '&pages=' + strPage + '&title=' + encodeURIComponent(strJournal) + '&atitle=' + encodeURIComponent(strTitle) + '&aulast=' + encodeURIComponent(strAuthor) + '&id=doi%3A%2F%2F' + encodeURIComponent(DOI) + OpenURLsuffix2;
					$('#doiResponse').append('<h4>Check for full text</h4><p><a href="' + OpenURLLink + '">Find it at Brockport</a></p><h4>Information About this DOI</h4><div id="doiCitationData">');
					$('#doiResponse').append('<h4>Check for full text</h4><p><a href="' + OpenURLLink2 + '">Find it at UB</a></p><h4>Information About this DOI</h4><div id="doiCitationData2">');
					/* TBD: Add a function to display a structured citation
					$('#doiResponse').append('<div id="apacitation">Citation: '+ getCitation(strAuthor,) + '<br />');
					*/
					$('#doiResponse').append('Journal: ' + strJournal + '<br />');
					$('#doiResponse').append('Title: ' + strTitle + '<br />');
					$('#doiResponse').append('Author: ' + strAuthor + '<br />');
					$('#doiResponse').append('Volume: ' + strVolume + '<br />');
					$('#doiResponse').append('Issue: '  + strIssue + '<br />');
					$('#doiResponse').append('Page: '  + strPage + '<br />');
					$('#doiResponse').append('Type: '  + strType + '<br />');
					$('#doiResponse').append('Published-Print: '  + strPublishedPrint + '<br />');
					$('#doiResponse').append('Published-Online: '  + strPublishedOnline + '<br />');
					$('#doiResponse').append('Created: '  + strCreated + '<br />');
					$('#doiResponse').append('Date: '  + strDate + '<br />');
					$('#doiResponse').append('ISSN: ' + strISSN + '<br />');
					$('#doiResponse').append('ISBN: ' + strISBN + '<br />');
					$('#doiResponse').append('CitedIn: ' + strCitedIn + '<br />');
					$('#doiResponse').append('DOI: ' + DOI + '</div>');
				}
				if (isILLiad == true) {
					/* Populate data into ILLiad form */
					$('#PhotoArticleAuthor').val(strAuthor);
					$('#PhotoArticleTitle').val(strTitle);
					$('#PhotoJournalTitle').val(strJournal);
					$('#PhotoJournalVolume').val(strVolume);
					$('#PhotoJournalIssue').val(strIssue);
					$('#PhotoJournalInclusivePages').val(strPage);
					$('#ISSN').val(strISSN);
					$('#PhotoJournalYear').val(strDate);
					$('#CitedIn').val(strCitedIn);
					/* Close popup */
					$('#doiResponse').closest('.ui-dialog-content').dialog('close');
				}
			})
			.error(function(event,jqxhr, exception){
				$('#doiResponse').append('That DOI was not found. <!-- code: ' + event.status + ' jqxhr: ' + jqxhr + ' exception: ' + exception + '-->');
			});
		} else {
			$('#doiResponse').append('No DOI found; no response called.');
		}
	});
});
