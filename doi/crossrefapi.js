/*This is doitest-nonilliad.js */
/* == Define global variables == */

/* doiRegExp is a regular expression to determine if a string is a valid DOI (Digital Object Identifier) */
var doiRegExp = new RegExp('(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)');

/* Change this value if you are using this script in an ILLiad ArticleRequest Form or not -- set to true or false */
var isILLiad = false;

/* OpenURLbase is the URL for your institution's OpenURL resolver, stopping just before the "?" before the OpenURL fields */
var OpenURLbase_BRO = 'https://suny-bro.primo.exlibrisgroup.com/openurl/01SUNY_BRO/01SUNY_BRO:01SUNY_BRO';
var OpenURLbase_XBM = 'https://brockport.idm.oclc.org/login?url=https://brockport.illiad.oclc.org/illiad/illiad.dll/OpenURL';
var OpenURLbase_BUF = 'https://search.lib.buffalo.edu/openurl/01SUNY_BUF/01SUNY_BUF:everything';
var OpenURLbase_ALB = 'https://suny-alb.primo.exlibrisgroup.com/openurl/01SUNY_ALB/01SUNY_ALB:01SUNY_ALB';

/* OpenURLbase is the label displayed for OpenURL links; the icon displays next to the label */
var OpenURLbranding_BRO = 'Brockport';
var OpenURLbranding_XBM = 'Brockport ILLiad';
var OpenURLbranding_BUF = 'Buffalo';
var OpenURLbranding_ALB = 'Albany';

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

/* == Call the functions when the document is ready == */
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
			/* need error handling for cases with no CrossRef DOI record found, i.e. https://api.crossref.org/works/10.1016/j.iree.2016.07.002 */
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
				var strISSN = '';
				var strCitedIn = '';
				if (isILLiad == true) {
					strCitedIn = 'Library DOI Resolver in ILLiad';
				} else {
					strCitedIn = 'Library DOI Resolver outside of ILLiad';
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
							switch(v){
								case 'journal-article':
									strType = 'article';
									break;
								default:
									strType = v;
									break;
							}
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
							strISBN = v.toString().split(',')[0];
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
					var OpenURL_suffix ='?sid=' + encodeURIComponent(strCitedIn) + '&genre=' + encodeURIComponent(strType) + '&issn=' + strISSN + '&ISBN=' + strISBN + '&volume=' + strVolume + '&issue=' + strIssue + '&date=' + encodeURIComponent(strDate) + '&spage=' + strPage + '&pages=' + strPage + '&title=' + encodeURIComponent(strJournal) + '&atitle=' + encodeURIComponent(strTitle) + '&aulast=' + encodeURIComponent(strAuthor) + '&id=doi%3A' + encodeURIComponent(DOI);
					var OpenURLLink_BRO = OpenURLbase_BRO + OpenURL_suffix;
					var OpenURLLink_XBM = OpenURLbase_XBM + OpenURL_suffix;
					var OpenURLLink_BUF = OpenURLbase_BUF + OpenURL_suffix;
					var OpenURLLink_ALB = OpenURLbase_ALB + OpenURL_suffix;
					$('#openUrlLinking').empty();
					$('#openUrlLinking').append('<a style="display: block;margin: 1em 3em;font-size: 24px;" class="btn btn-success" target="_blank" href="' + OpenURLLink_BRO + '"> ' + OpenURLbranding_BRO + '</a>');
					$('#openUrlLinking').append('<a style="display: block;margin: 1em 3em;font-size: 24px;" class="btn btn-success" target="_blank" href="' + OpenURLLink_XBM + '"> ' + OpenURLbranding_XBM + '</a>');
					$('#openUrlLinking').append('<a style="display: block;margin: 1em 3em;font-size: 24px;" class="btn btn-primary" target="_blank" href="' + OpenURLLink_BUF + '"> ' + OpenURLbranding_BUF + '</a>');
					$('#openUrlLinking').append('<a style="display: block;margin: 1em 3em;font-size: 24px;" class="btn btn-warning" target="_blank" href="' + OpenURLLink_ALB + '"> ' + OpenURLbranding_ALB + '</a>');

					$('#doiResponse').append('<h2>Information About this DOI</h2><div id="doiCitationData">');
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
