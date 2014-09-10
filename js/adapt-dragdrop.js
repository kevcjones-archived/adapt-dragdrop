/*
* adapt-component
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Jones <him@kevincjones.co.uk>
*/
define(function(require) {

    var Adapt           = require('coreJS/adapt');
    var QuestionView    = require('coreViews/questionView');
    var JQueryUI        =  require('./jquery-ui.js');
    var TouchPunch      = require('./jquery.ui.touch-punch.js')

    var DragDrop = QuestionView.extend({

        events: {
            "dropactivate .ui-droppable"   : "onDropItemActivate",                     //Triggered when an accepted draggable starts dragging.  function( event, ui ) {} );
            "dropdeactivate .ui-droppable" : "onDropItemDeactivate",                   //Triggered when an accepted draggable stops dragging. $( ".selector" ).on( "dropdeactivate", function( event, ui ) {} );
            "drop .ui-droppable"           : "onDropItem",                             //Triggered when an accepted draggable is dropped on the droppable  $( ".selector" ).on( "drop", function( event, ui ) {} );
            "out .ui-droppable"            : "onDropOutItem",                          //Triggered when an accepted draggable is dragged out of the droppable   $( ".selector" ).on( "dropout", function( event, ui ) {} );
            "over .ui-droppable"           : "onDropOverItem",                         //Triggered when an accepted draggable is dragged over the droppable  $( ".selector" ).on( "dropover", function( event, ui ) {} );

            "click .dragdrop-widget .button.submit" : "onSubmitClicked",
            "click .dragdrop-widget .button.reset"  : "onResetClicked",
            "click .dragdrop-widget .button.model"  : "onModelAnswerClicked",
            "click .dragdrop-widget .button.user"   : "onUserAnswerClicked",

        },

        onDropItemActivate : function( event, ui ) {
            var droppableId = $(ui.draggable.element).attr("id");
        },

        onDropItemDeactivate : function( event, ui ) {
            var droppableId = $(ui.draggable.element).attr("id");
        },

        onDropItem : function( event, ui ) {
            var droppableId = $(ui.draggable.element).attr("id");
        },

        onDropOutItem : function( event, ui ) {
            var droppableId = $(ui.draggable.element).attr("id");
        },

        onDropOverItem : function( event, ui ) {
            var droppableId = $(ui.draggable.element).attr("id");
        },

        findDraggableItem:function(id){
            return _.find(item._draggableItems,function(dragger){
                if(dragger.id == id)
                    return dragger;
            });
        },

        preRender:function(){
            QuestionView.prototype.preRender.apply(this);

            //TO DO hook up the drag and drop based on model
        },   

        postRender: function() {
            QuestionView.prototype.postRender.apply(this);
            this.setReadyStatus();
        },   

        /*
        Look at all droppables and if one does not contain a highlight class then its fair to assume we have not completed the excercise
        */
        canSubmit: function() {
          var canSubmit = true;
          $('.ui-droppable',this.el).each(
            _.bind(function(index, element) {
              var $element = $(element);
              if (!$element.hasClass('ui-state-highlight')) {
                canSubmit = false;
              }
            }, this));
          return canSubmit;
        },

        forEachAnswer: function(callback) {
            this.model.set('_isAtLeastOneCorrectSelection', false);
            _.each(this.model.get('_items'), function(item, index) 
            {       
                var correctSelection = false;
                _.each(item._accepted,function(accepted){
                    if(item.currentDropzoneId == accepted.id)
                    {
                        if(accepted._isCorrect){
                            correctSelection = true;
                            item._isCorrect = true;
                            this.model.set('_isAtLeastOneCorrectSelection', true);
                        }else
                        {
                            item._isCorrect = false;
                        }
                    }
                });
               
                callback(correctSelection, item);

            }, this);
        },  

        markQuestion: function() {
            this.forEachAnswer(function(correct, item) {
                item.correct = correct;
            });
            QuestionView.prototype.markQuestion.apply(this);
        },  

        onEnabledChanged: function() {
          this.$('.ui-droppable').prop('disabled', !this.model.get('_isEnabled'));
        },

        onModelAnswerShown: function() {
            /*
                for all items get jquery item on the deck
                    if said item is correct leave alone
                    if said item is incorrect 
                        revert the dropper in it
                        and tell the dropper that it should be to go to it
            */
            alert("TODO : SHOW the model answer");

            _.each(this.model.get('_items'), function(item, index) {

            }, this);
        },

        onUserAnswerShown: function(event) {
            /*
                for the items array get the item and index
                    get the item _useranswer array at index
                    with the item 
                        if incorrect 
                            revert
                            select correct item by _userAnswerId and animate into position
                        else
                            ignore

            */
            _.each(this.model.get('_items'), function(item, index) 
            {
                //this.model.get('_userAnswer')[i]                
            },this);
        },

        storeUserAnswer: function() {
            var userAnswer = [];
            
            this.forEachAnswer(function(correct, item) {
                userAnswer.push(item.currentDropzoneId);
            });

            this.model.set('_userAnswer', userAnswer);
        }


        
        
    });
    
    Adapt.register("dragdrop", DragDrop);
    
});