/*This is doitest.js */

/* == Define global variables == */

/* doiRegExp is a regular expression to determine if a string is a valid DOI (Digital Object Identifier) */
var doiRegExp = new RegExp('(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)');

/* Change this value if you are using this script in an ILLiad ArticleRequest Form or not -- set to true or false */
var isILLiad = false;

/* OpenURLbase is the URL for your institution's OpenURL resolver, stopping just before the "?" before the OpenURL fields */
var OpenURLbase_BRO_primo = 'https://suny-bro.primo.exlibrisgroup.com/discovery/openurl';
var OpenURLbase_BUF_primo = 'https://search.lib.buffalo.edu/discovery/openurl';
var OpenURLbase_ALB_primo = 'https://search.library.albany.edu/discovery/openurl'
var OpenURLbase_BRO_ILL = 'https://brockport.idm.oclc.org/login?url=https://brockport.illiad.oclc.org/illiad/illiad.dll/OpenURL';

/* OpenURL prefix is only required if your resolver requires instiution specific information to be included */
var OpenURLprefix_BRO_primo ='institution=01SUNY_BRO&vid=01SUNY_BRO:01SUNY_BRO';
var OpenURLprefix_BUF_primo = 'institution=01SUNY_BUF&vid=01SUNY_BUF:everything';
var OpenURLprefix_ALB_primo = 'institution=suny-alb&vid=01SUNY_ALB:01SUNY_ALB';

/* OpenURLsuffix is only required if your resolver requires institutional authentication in a GET variable (EBSCO), as opposed to having the code in the host name (like 360Link).
Change this value to '' if you're in the latter category. */
var OpenURLsuffix_BRO = '';
var OpenURLsuffix_BUF = '';
var OpenURLsuffix_ALB = '';

/* OpenURLbase is the label displayed for OpenURL links */
var OpenURLbranding = 'Get an electronic copy';

/* == Define function for testing whether the input field contains a properly formatted DOI == */
function DOItest(DOItoTest) {
	/* DOI RegExp from https://github.com/regexhq/doi-regex/blob/master/index.js */
	if (doiRegExp.test(DOItoTest)) {
		$('#doiResponse').html('<p>Searching...</p>');
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
			$('#doiResponse').append('');
		}
		DOIval = $('#inputDOI').val();
		if (DOItest(DOIval) == true){
			DOI = DOIval.match(doiRegExp)[0];
			DOIurl = 'https://api.crossref.org/works/' + DOI + "/";
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
				var strCitedIn = 'Crossref DOI Lookup';
				$.each(data, function() {
				  $.each(this, function(k, v) {
					/* Display all read data in key value pairs; note that nested arrays will show as "object Object" */
					/* $('#doiResponse').append(k + ': ' + v + '</strong><br />'); */
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
										/*$('#doiResponse').append(k2 + ': ' + v2 + '</strong><br />');*/
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
					var OpenURLstring = '&sid=' + encodeURIComponent(strCitedIn) + '&genre=' + encodeURIComponent(strType) + '&issn=' + strISSN + '&ISBN=' + strISBN + '&volume=' + strVolume + '&issue=' + strIssue + '&date=' + encodeURIComponent(strDate) + '&spage=' + strPage + '&pages=' + strPage + '&title=' + encodeURIComponent(strJournal) + '&atitle=' + encodeURIComponent(strTitle) + '&aulast=' + encodeURIComponent(strAuthor) + '&doi=' + encodeURIComponent(DOI);
					var OpenURLLink_BRO_primo = OpenURLbase_BRO_primo + '?' + OpenURLprefix_BRO_primo + OpenURLstring;
					var OpenURLLink_BUF_primo = OpenURLbase_BUF_primo + '?' + OpenURLprefix_BUF_primo + OpenURLstring;
					var OpenURLLink_BRO_illiad = OpenURLbase_BRO_ILL + '?' + OpenURLstring;
					var OpenURLLink_ALB_primo = OpenURLbase_ALB_primo + '?' + OpenURLprefix_ALB_primo + OpenURLstring;
					/* Modified this part to display buttons in a second column */
					$('#openUrlLinking').empty();
					$('#openUrlLinking').append('<h3>Check for full text</h3>');
					$('#openUrlLinking').append('<button class="btn btn-success m-3 p-2"><a target="_blank" href="' + OpenURLLink_BRO_primo + '" class="text-white font-weight-bold">Find it at Brockport</a></button>');
					$('#openUrlLinking').append('<button class="btn btn-success m-3 p-2"><a target="_blank" href="' + OpenURLLink_BUF_primo + '" class="text-white font-weight-bold">Find it at UB</a></button>');
					$('#openUrlLinking').append('<br /><button class="btn btn-success m-3 p-2"><a target="_blank" href="' + OpenURLLink_BRO_illiad + '" class="text-white font-weight-bold">Brockport ILLiad</a></button>');
					$('#doiResponse').empty();
					$('#doiResponse').append('<h3>Information About this DOI</h3><div id="doiCitationData2">');
					/* TBD: Add a function to display a structured citation
					$('#doiResponse').append('<div id="apacitation">Citation: '+ getCitation(strAuthor,) + '</strong><br />');
					*/
					$('#doiResponse').append('Journal: <strong> ' + strJournal + '</strong><br />');
					$('#doiResponse').append('Title: <strong>' + strTitle + '</strong><br />');
					$('#doiResponse').append('Author: <strong>' + strAuthor + '</strong><br />');
					$('#doiResponse').append('Volume: <strong>' + strVolume + '</strong><br />');
					$('#doiResponse').append('Issue: <strong>'  + strIssue + '</strong><br />');
					$('#doiResponse').append('Page: <strong>'  + strPage + '</strong><br />');
					$('#doiResponse').append('Type: <strong>'  + strType + '</strong><br />');
					$('#doiResponse').append('Published-Print: <strong>'  + strPublishedPrint + '</strong><br />');
					$('#doiResponse').append('Published-Online: <strong>'  + strPublishedOnline + '</strong><br />');
					$('#doiResponse').append('Created: <strong>'  + strCreated + '</strong><br />');
					$('#doiResponse').append('Date: <strong>'  + strDate + '</strong><br />');
					$('#doiResponse').append('ISSN: <strong>' + strISSN + '</strong><br />');
					$('#doiResponse').append('ISBN: <strong>' + strISBN + '</strong><br />');
					$('#doiResponse').append('CitedIn: <strong>' + strCitedIn + '</strong><br />');
					$('#doiResponse').append('DOI: <strong>' + DOI + '</strong></div>');
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
