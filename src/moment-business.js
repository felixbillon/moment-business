import moment from 'moment';
import containedPeriodicValues from 'contained-periodic-values';

moment.fn.weekDays = function(start) {
  var startDay = start.day();
  var totalDays = Math.abs(this.diff(start, 'days'));
  var containedSundays = containedPeriodicValues(startDay, totalDays + startDay, 0, 7);
  var containedSaturdays = containedPeriodicValues(startDay, totalDays + startDay, 6, 7);
  return totalDays - (containedSaturdays + containedSundays);
};

moment.fn.weekendDays = function(start) {
  return Math.abs(this.diff(start, 'days')) - this.weekDays(start);
};

function publicHolidays(year) {
	var JourAn = new Date(year, "00", "01")
	var FeteTravail = new Date(year, "04", "01")
	var Victoire1945 = new Date(year, "04", "08")
	var FeteNationale = new Date(year,"06", "14")
	var Assomption = new Date(year, "07", "15")
	var Toussaint = new Date(year, "10", "01")
	var Armistice = new Date(year, "10", "11")
	var Noel = new Date(year, "11", "25")
	
	var G = year%19
	var C = Math.floor(year/100)
	var H = (C - Math.floor(C/4) - Math.floor((8*C+13)/25) + 19*G + 15)%30
	var I = H - Math.floor(H/28)*(1 - Math.floor(H/28)*Math.floor(29/(H + 1))*Math.floor((21 - G)/11))
	var J = (year*1 + Math.floor(year/4) + I + 2 - C + Math.floor(C/4))%7
	var L = I - J
	var MoisPaques = 3 + Math.floor((L + 40)/44)
	var JourPaques = L + 28 - 31*Math.floor(MoisPaques/4)
	var LundiPaques = new Date(year, MoisPaques-1, JourPaques+1)
	var Ascension = new Date(year, MoisPaques-1, JourPaques+39)
	var LundiPentecote = new Date(year, MoisPaques-1, JourPaques+50)
	
	return new Array(JourAn, LundiPaques, FeteTravail, Victoire1945, Ascension, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel)
}

function determineSign(x) {
  x = +x;
  return x > 0 ? 1 : -1;
}

moment.fn.addWeekDays = function(count) {
  if (count === 0 || isNaN(count)) { return this; }

  var sign = determineSign(count);
  var day = this.day();
  var absIncrement = Math.abs(count);

  var days = 0;

  if (day === 0 && sign === -1) {
    days = 1;
  } else if (day === 6 && sign === 1) {
    days = 1;
  }

  // Add padding for weekends.
  var paddedAbsIncrement = absIncrement;
  if (day !== 0 && day !== 6 && sign > 0) {
    paddedAbsIncrement += day;
  } else if (day !== 0 && day !== 6 && sign < 0) {
    paddedAbsIncrement += 6 - day;
  }
  var weekendsInbetween =
    Math.max(Math.floor(paddedAbsIncrement / 5) - 1, 0) +
    (paddedAbsIncrement > 5 && paddedAbsIncrement % 5 > 0 ? 1 : 0);

  // Add the increment and number of weekends.
  days += absIncrement + weekendsInbetween * 2;
  
  //Check public holidays
  var startDate = moment(this);
  var endDate =startDate.add(sign * days, 'days');
  var range = moment.range(startDate, this);
  
  publicHolidays(startDate.year).forEach(function (element, index, array) {
    if(range.contains(element)) {
      sign === 1 ? days-- : days++;
    }
  });
  
  this.add(sign * days, 'days');
  return this;
};

// The inverse of adding
moment.fn.subtractWeekDays = function(count) {
  return this.addWeekDays(-count);
};

// Returns a Boolean representing
// whether or not the moment is Mon-Fri
moment.fn.isWeekDay = function() {
  return this.isoWeekday() < 6;
};

// The inverse of the above method
moment.fn.isWeekendDay = function() {
  return this.isoWeekday() > 5;
};
