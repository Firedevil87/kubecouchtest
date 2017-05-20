var FlashCardApp = {
};

// Dieses Objekt erzeugt für jede Seite (index, manage, learn) eine
// eigenes JavaScript-Objekt. Dies ermöglicht, dass der Seiten-spezifische
// Code in eigenen Objekten organisiert werden kann. Dieser Code muss nicht,
// darf aber natürlich, angepasst werde.
FlashCardApp.Base = function() {
  var context = $('body').data('js-context') || 'undefined';
  switch(context) {
    case 'manage':
      return new FlashCardApp.ManagePage(); break;
    case 'learn':
      return new FlashCardApp.LearnPage(); break;
    case 'start':
      return new FlashCardApp.StartPage(); break;
    default:
      alert('Undefined context: ' + context);
  }
}

// Dieses Objekt nutzt die Lockr-Bibliothek um JavaScript-Objekte
// im Brower-LocalStorage abzuspeichern und wieder auszulesen.
// Alle Seiten-Objekte sollten idealerweise niemals mit dem Lockr-Objekt
// und stattdessen mit dem Persistence-Objekt sprechen.
FlashCardApp.Persistence = {
  getCorrectAnswerCount: function() {
    return Lockr.get('correctAnswerCount', 0);
  },

  getWrongAnswerCount: function() {
    return Lockr.get('wrongAnswerCount', 0);
  },

  incCorrectAnswer: function() {
    return Lockr.set('correctAnswerCount', this.getCorrectAnswerCount() + 1);
  },

  incWrongAnswer: function() {
    return Lockr.set('wrongAnswerCount', this.getWrongAnswerCount() + 1);
  },

  resetAnswerCount: function() {
    Lockr.set('correctAnswerCount', 0);
    Lockr.set('wrongAnswerCount', 0);
    return true;
  },

  addCard: function(front, back){
    var cards = Lockr.get('ArrayOfCards', []);
    cards.push(front);
    cards.push(back);
    return Lockr.set('ArrayOfCards', cards);
  },

  getCards: function() {
    return Lockr.get('ArrayOfCards', []);
  },

  deleteCards: function() {
    return Lockr.set('ArrayOfCards', []  );
  },

  deleteCard: function(indexToBeDeleted) {
    var cards = Lockr.get('ArrayOfCards', []);
    cards.splice(indexToBeDeleted, 2);
    Lockr.set('ArrayOfCards', cards);
  },

  // Hier fehlen noch die Lade- und Speicherfunktionen für die Lernkarten
};

// Dies ist ein Beispiel-Objekt für die Startseite. Die Startseite hat
// nicht sehr viel Logik oder Interaktion. Sie zeigt lediglich ein paar
// Informationen aus dem Browser-LocalStorage an.
FlashCardApp.StartPage = function() {
  // So wird bspw. das Persistence-Objekt genutzt um Daten aus dem LocalStorage zu laden
  $('.js-cards-count').html(FlashCardApp.Persistence.getCards().length/2);
  $('.js-correct-answers-count').html(FlashCardApp.Persistence.getCorrectAnswerCount());
  $('.js-wrong-answers-count').html(FlashCardApp.Persistence.getWrongAnswerCount());
};


FlashCardApp.LearnPage = function() {
  var currentCard = 0;
  var Cards = FlashCardApp.Persistence.getCards();

  $('.js-finished-message').hide();
  $('.js-card-stage').hide();

  this.startButton = $('.js-start-round-button'); // Beginn
  this.endButton = $('.end-round-button'); // Beenden
  this.confirmButton = $('.js-confirm-button'); // Ja
  this.turnCardButton = $('.js-turn-card-button'); // Umdrehen
  this.denyButton = $('.js-deny-button'); //  Nein


  this.startButton.on('click', function(event) {  // Beginn
    startGame();
    $('.js-card').html(Cards[currentCard]);
    }.bind(this));


  this.endButton.click(function() { // Beenden
    window.location ="index.html";
  });


  this.confirmButton.on('click', function(event) {  // Ja
    confirmCard();
  }.bind(this));


  this.turnCardButton.on('click', function(event) { // Umdrehen
      if (currentCard % 2 === 1)
        currentCard--;
      else
        currentCard++;
        $('.js-card').html(Cards[currentCard]);
    }.bind(this));


  this.denyButton.on('click', function(event) { //  Nein
    denyCard();
  }.bind(this));


$('.js-cards-total').html(Cards.length/2);

  confirmCard = function() {
    FlashCardApp.Persistence.incCorrectAnswer();
    showNextCard();

  };
  denyCard = function() {
    FlashCardApp.Persistence.incWrongAnswer();
    showNextCard();
  },

  showNextCard = function() {
    if (currentCard >= Cards.length-2)
      endGame();
    if (currentCard % 2 == 1)
      currentCard++;
    else
      currentCard+=2;
   $('.js-card').html(Cards[currentCard]);
    updateIndexCurrentCard();
  }

  endGame = function() {
      $('.js-finished-message').show();
      $('.controls').show();
      $('.js-card-stage').hide();
  }

  startGame = function() {
      currentCard = 0;
      FlashCardApp.Persistence.resetAnswerCount();
      $('.controls').hide();
      $('.js-card-stage').show();
      $('.js-finished-message').hide();
      updateIndexCurrentCard();
  }

  updateIndexCurrentCard = function() {
      $('.js-cards-current').html((currentCard/2)+1);
  }

}

FlashCardApp.ManagePage = function() {

  this.addCardButton = $('.js-add-card-button');
  this.addCardForm = $('.js-add-card-form');
  this.cardsTable = $('.js-cards-table');
  this.deleteButton = $('.js-reset-data');
  this.loadDemoData = $('.js-load-demo-data');
  this.safeButton = $('.js-add-card-submit-button');

  this.addCardForm.hide();

  this.addCardButton.on('click', function(event) {
    this.addCardButton.hide();
    this.cardsTable.hide();
    this.addCardForm.show();
  }.bind(this));


  this.addCardForm.on('submit', function(event) {
    var front = $('.js-add-card-front-input').val();
    var back = $('.js-add-card-back-input').val();
    FlashCardApp.Persistence.addCard(front, back);
  }.bind(this));


  this.deleteButton.on('click', function(event) {
    FlashCardApp.Persistence.deleteCards();
    FlashCardApp.Persistence.resetAnswerCount();
    location.reload();
  }.bind(this));


  this.loadDemoData.on('click', function(event){
    FlashCardApp.Persistence.deleteCards();
    FlashCardApp.Persistence.resetAnswerCount();
    FlashCardApp.Persistence.addCard('Kindergarten', 'kindergarten');
    FlashCardApp.Persistence.addCard('Schachbrett', 'chess board');
    FlashCardApp.Persistence.addCard('Badezimmer', 'bathroom');
    location.reload();
  }.bind(this));


  this.safeButton.on('click', function(event){
    Lockr.set('Karten', cards );
    Lockr.set('anzKarten', cards.length);
  }.bind(this));


  var tableBody = this.cardsTable.find('tbody');
  var cards = FlashCardApp.Persistence.getCards();

  $('.js-cards-count').html(cards.length/2);

  for (var i = 0; i < cards.length; i += 2) {
      var tr = $('<tr/>').appendTo(tableBody);
      tr.append('<td>' + cards[i] + '</td>');
      tr.append('<td>' + cards[i+1] + '</td>');
      tr.append('<td>' + '<a class="js-delete-one-card" onclick="FlashCardApp.Persistence.deleteCard('+i+'); location.reload(); ">löschen</a>' + '</td>');
    }

};

// Die App wird zum Ende automatisch gestartet
new FlashCardApp.Base();
