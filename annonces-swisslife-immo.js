const fs = require('fs');
const casper = require('casper').create(/*{
  verbose: true,
  logLevel: "debug"
}*/);

const jsonFile = 'annonces-swisslife-immo.json';

var newLinks = [];
var links = [];
var annoncesStr = fs.read(jsonFile);
var oldLinks = JSON.parse(annoncesStr);

function getLinks() {
  var links = document.querySelectorAll('.listingUL article');
  return Array.prototype.map.call(links, function(e) {
    return 'http://www.swisslife-immobilier.com' +
      e.getAttribute('onclick').match(/location.href='([^"]+)'/)[1];
  });
}

casper.start().thenOpen('http://www.swisslife-immobilier.com/recherche/', {
  method: "post",
  data: {
    'Sort[field]': 'dateenr',
    'Sort[order]': 'DESC',
  }
});

casper.then(function() {
  links = links.concat(this.evaluate(getLinks));
  fs.write(jsonFile, JSON.stringify(links));
  links.forEach(function(link) {
    if (oldLinks.indexOf(link) === -1) {
      newLinks.push(link);
    }
  });

  this.echo((new Date()) + ' : ' + newLinks.length + ' nouvelles annonces SwissLife');
});

casper.thenBypassIf(function() {
  return !newLinks.length;
}, 2);

casper.setHttpAuth('api', 'key-2b0cc9c36ed603961e740e88a963976b');
casper.then(function() {
  this.open('https://api.mailgun.net/v3/mail.bioub.com/messages', {
    method: 'post',
    data:   {
      'from': 'Bot SwissLife Immobilier Location <postmaster@mail.bioub.com>',
      'to': 'Romain Bohdanowicz <bioub@icloud.com>, Caroline Fournier <caroline.fournier14@gmail.com>',
      'subject':  'Nouvelles annonces SwissLife Location',
      'text':  newLinks.join('\n')
    }
  });
});


casper.run(function() {
  this.exit();
});