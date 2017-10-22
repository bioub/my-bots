const fs = require('fs');
const casper = require('casper').create(/*{
  verbose: true,
  logLevel: "debug"
}*/);

const jsonFile = 'annonces-ca-immo.json';

var newLinks = [];
var links = [];
var annoncesStr = fs.read(jsonFile);
var oldLinks = JSON.parse(annoncesStr);

function getLinks() {
  var links = document.querySelectorAll('.voir_detail');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('onclick').match(/document.location.href="([^"]+)"/)[1];
  });
}

casper.start('http://www.ca-immobilier-location.fr/liste_programmes.php');

casper.then(function() {
  this.fill('form#form_recherche_int', {
    type_appart: 'Appartement',
    pieces_3: '3',
    prix_max: '2200',
    loc_1: 'Paris',
    loc_2: '92300',
    loc_3: '92200'
  }, false);
});

casper.then(function() {
  this.evaluate(function() {
    var evt = new Event("submit", {"bubbles":true, "cancelable":false});
    var form = document.querySelector('form#form_recherche_int');
    form.dispatchEvent(evt);
  });
  this.waitForUrl('http://www.ca-immobilier-location.fr/resultats_recherche.php?page=resultats_recherche');
});

casper.then(function() {
  links = links.concat(this.evaluate(getLinks));
  fs.write(jsonFile, JSON.stringify(links));
  links.forEach(function(link) {
    if (oldLinks.indexOf(link) === -1) {
      newLinks.push(link);
    }
  });

  this.echo((new Date()) + ' : ' + newLinks.length + ' nouvelles annonces Crédit Agricole');
});

casper.thenBypassIf(function() {
  return !newLinks.length;
}, 2);

casper.setHttpAuth('api', 'key-2b0cc9c36ed603961e740e88a963976b');
casper.then(function() {
  this.open('https://api.mailgun.net/v3/mail.bioub.com/messages', {
    method: 'post',
    data:   {
      'from': 'Bot Crédit Immobilier Location <postmaster@mail.bioub.com>',
      'to': 'Romain Bohdanowicz <bioub@icloud.com>, Caroline Fournier <caroline.fournier14@gmail.com>',
      'subject':  'Nouvelles annonces Crédit Immobilier Location',
      'text':  newLinks.join('\n')
    }
  });
});

casper.run(function() {
  this.exit();
});