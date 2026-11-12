/**
 * Caden Musselman — webinar lead sheet (his free "CRM").
 *
 * Receives registrations and survey answers from /api/caden (Netlify function)
 * and writes them to two tabs in this Google Sheet, then emails Caden.
 * The phone number is the key: a repeat registration updates the same row.
 *
 * SETUP (about 5 minutes, once):
 *   1. Make a new Google Sheet, name it "Caden — Golden Door Webinar Leads".
 *   2. Extensions → Apps Script. Delete what's there, paste this whole file.
 *   3. Set TOKEN below to a long random string, and NOTIFY_EMAIL to Caden's email.
 *   4. Run `setup` once from the editor (approve the permissions). It builds
 *      both tabs with headers and checkboxes.
 *   5. Deploy → New deployment → type "Web app". Execute as: Me. Who has
 *      access: Anyone. Copy the /exec URL.
 *   6. In Netlify → Site configuration → Environment variables, add
 *      CADEN_SHEET_URL = that /exec URL and CADEN_SHEET_TOKEN = the same TOKEN.
 *      Then redeploy the site.
 *   7. Share the Sheet with Caden (Editor). He can work it from the Google
 *      Sheets app on his phone and tick a box as he sends each text.
 *
 * Editing this script later? Deploy → Manage deployments → edit → New version,
 * or the live URL keeps running the old code.
 */

var TOKEN = 'CHANGE-ME-to-a-long-random-string';
var NOTIFY_EMAIL = '';          // Caden's email. Empty = no emails.
var TZ = 'America/Denver';

var REG_TAB = 'Registrations';
var REG_HEADERS = ['Registered (MT)', 'First', 'Last', 'Phone', 'Email', 'Summers knocked', 'Company', 'Source',
  'Booked text', '3-day text', '1-day text', '6-hr text', '10-min text', 'Showed up', 'Wants meeting', 'Notes'];
var REG_CHECKBOX_COLS = [9, 10, 11, 12, 13, 14];   // Booked text … Showed up

var SURVEY_TAB = 'Survey';
var SURVEY_HEADERS = ['Submitted (MT)', 'First', 'Last', 'Phone', 'Rating', 'Most useful', 'Cover next',
  'Wants to meet about', 'Texted to book', 'Meeting booked', 'Notes'];
var SURVEY_CHECKBOX_COLS = [9, 10];

function setup() {
  var ss = SpreadsheetApp.getActive();
  prepTab_(ss, REG_TAB, REG_HEADERS, REG_CHECKBOX_COLS);
  prepTab_(ss, SURVEY_TAB, SURVEY_HEADERS, SURVEY_CHECKBOX_COLS);
  var extra = ss.getSheetByName('Sheet1');
  if (extra && ss.getSheets().length > 2) ss.deleteSheet(extra);
}

function prepTab_(ss, name, headers, checkboxCols) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold')
    .setBackground('#111111').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  checkboxCols.forEach(function (c) { sh.getRange(2, c, 999, 1).insertCheckboxes(); });
  sh.autoResizeColumns(1, headers.length);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return json_({ ok: false, error: 'bad token' });
    var ss = SpreadsheetApp.getActive();
    var when = Utilities.formatDate(new Date(d.submitted_at || Date.now()), TZ, 'yyyy-MM-dd h:mm a');
    var phone = prettyPhone_(d.phone);

    if (d.type === 'registration') {
      var sh = ss.getSheetByName(REG_TAB);
      var row = [when, d.first_name, d.last_name, phone, d.email, d.summers, d.company, d.source];
      var existing = findRow_(sh, 4, phone);
      if (existing) sh.getRange(existing, 1, 1, row.length).setValues([row]);
      else sh.getRange(nextRow_(sh), 1, 1, row.length).setValues([row]);
      notify_('New webinar registration: ' + d.first_name + ' ' + d.last_name,
        d.first_name + ' ' + d.last_name + '\n' + phone + '\n' + d.email +
        '\nSummers knocked: ' + d.summers + (d.company ? '\nCompany: ' + d.company : '') +
        '\n\nSend the booked text now:\n"Hey ' + d.first_name + ', it\'s Caden! You\'re locked in for the Golden Door webinar..."' +
        '\n\nOpen the sheet: ' + ss.getUrl());
      return json_({ ok: true });
    }

    if (d.type === 'survey') {
      var sv = ss.getSheetByName(SURVEY_TAB);
      sv.getRange(nextRow_(sv), 1, 1, 8).setValues([[when, d.first_name, d.last_name, phone, d.rating, d.best, d.next, d.meet]]);
      if (d.meet) {
        var reg = ss.getSheetByName(REG_TAB);
        var r = findRow_(reg, 4, phone);
        if (r) reg.getRange(r, 15).setValue(d.meet);
        notify_('MEETING REQUEST: ' + d.first_name + ' ' + d.last_name + ' (' + d.meet + ')',
          d.first_name + ' ' + d.last_name + ' wants to meet about: ' + d.meet + '\n' + phone +
          '\nRated the webinar ' + d.rating + '/10.\n\nText them within an hour of the webinar ending.\n\n' + ss.getUrl());
      }
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'unknown type' });
  } finally {
    lock.releaseLock();
  }
}

// First empty row in column A (the checkbox columns are pre-filled to row 1000,
// so getLastRow() would point past them).
function nextRow_(sh) {
  var col = sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), 1).getValues();
  for (var i = 0; i < col.length; i++) if (col[i][0] === '') return i + 2;
  sh.insertRowAfter(sh.getMaxRows());
  return sh.getMaxRows();
}

function findRow_(sh, col, value) {
  var vals = sh.getRange(2, col, Math.max(sh.getMaxRows() - 1, 1), 1).getValues();
  for (var i = 0; i < vals.length; i++) if (vals[i][0] === value) return i + 2;
  return 0;
}

function prettyPhone_(p) {
  var d = String(p || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : String(p || '');
}

function notify_(subject, body) {
  if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
