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
            "dragcreate .ui-draggable"         : "onCreateDragItem",
            "dragstart .ui-draggable"         : "onStartDragItem",
            "dragstop .ui-draggable"         : "onStopDragItem",
            "dropactivate .ui-droppable"   : "onDropItemActivate",                     //Triggered when an accepted draggable starts dragging.  function( event, ui ) {} );
            "dropdeactivate .ui-droppable" : "onDropItemDeactivate",                   //Triggered when an accepted draggable stops dragging. $( ".selector" ).on( "dropdeactivate", function( event, ui ) {} );
            "drop .ui-droppable"           : "onDropItem",                             //Triggered when an accepted draggable is dropped on the droppable  $( ".selector" ).on( "drop", function( event, ui ) {} );
            "dropout .ui-droppable"            : "onDropOutItem",                          //Triggered when an accepted draggable is dragged out of the droppable   $( ".selector" ).on( "dropout", function( event, ui ) {} );
            "dropover .ui-droppable"           : "onDropOverItem",                         //Triggered when an accepted draggable is dragged over the droppable  $( ".selector" ).on( "dropover", function( event, ui ) {} );

            "click .dragdrop-widget .button.submit" : "onSubmitClicked",
            "click .dragdrop-widget .button.reset"  : "onResetClicked",
            "click .dragdrop-widget .button.model"  : "onModelAnswerClicked",
            "click .dragdrop-widget .button.user"   : "onUserAnswerClicked",

        },

        initDragDropItems : function () {
            
            _.each(this.model.get('_draggableItems'),function(draggableItem){
                $('#'+draggableItem.id).draggable({});
            },this);

            _.each(this.model.get('_items'),function(droppableItem){
                $( "#"+droppableItem.id).droppable({
                    accept: "#" + _.pluck(droppableItem._accepted,"id")
                                    .join(", #"),
                    activeClass: "ui-state-hover",
                    hoverClass: "ui-state-active"
                });
            },this);
        },

        onCreateDragItem : function( event, ui) {
            $(event.target).data("original-left",$(event.target).css('left'));
            $(event.target).data("original-top",$(event.target).css('top'));
        },

        onStartDragItem : function(event,ui) {
            

        },

        onStopDragItem : function(event,ui) {
            var draggerId = $(event.target).attr("id");
            var dropperItem = _.find(this.model.get('_items'),function(item){
                if(item.currentDraggableId == draggerId)
                {
                    return item;
                }
            });

            if(!dropperItem)
            {
                var $d = $("#"+draggerId);
                $d.animate({
                        "left":$d.data('original-left'),
                        "top":$d.data('original-top'),
                    },500,function(){

                });
                
            }

        },

        onDropItemActivate : function( event, ui ) {
            var $droppable = $(ui.draggable.element);
            var droppableItem = this.findDraggableItem($droppable.attr("id"));

        },

        onDropItemDeactivate : function( event, ui ) {
            var $droppable = $(ui.draggable.element);
            var droppableItem = this.findDraggableItem($droppable.attr("id"));
        },

        onDropItem : function( event, ui ) {
            var $draggable = $(ui.draggable);
            var draggableItem = this.findDraggableItem($draggable.attr("id"));
            var $droppable = $(event.target);
            var droppableItem = this.findDroppableItem($droppable.attr("id"));

            //add class 
            $droppable.addClass( "ui-state-highlight" );

            if(droppableItem.currentDraggableId)
            {
                var residentDraggable = this.findDraggableItem(droppableItem.currentDraggableId);
                var $residentDraggable = $('#'+residentDraggable.id);
                console.log("Sending home dragger "+residentDraggable.id);
                
                $residentDraggable.animate({
                    "left":$residentDraggable.data('original-left'),
                    "top":$residentDraggable.data('original-top'),
                },500,function(){

                });      
            }

            //Set the new current id and move the dragger item into final positon
            droppableItem.currentDraggableId = draggableItem.id;
            $draggable.animate({
                left: $droppable.css('left'),
                top: $droppable.css('top')
            },500,function(){
                //set position to droppable position complete


            });
        },

        onDropOutItem : function( event, ui ) {
            var dropperId = $(event.target).attr("id");
            var dropperItem = _.find(this.model.get('_items'),function(item){
                if(item.id == dropperId)
                {
                    item.currentDraggableId = null;
                    $(event.target).removeClass('ui-state-highlight');
                    return item;
                }
            });
        },

        onDropOverItem : function( event, ui ) {
            var $droppable = $(ui.draggable.element);
            var droppableItem = this.findDraggableItem($droppable.attr("id"));
        },

        findDraggableItem:function(id){
            return _.find(this.model.get('_draggableItems'),function(dragger){
                if(dragger.id == id)
                    return dragger;
            });
        },

        findDroppableItem:function(id){
            return _.find(this.model.get('_items'),function(item){
                if(item.id == id)
                    return item;
            });
        },

        preRender:function(){
            QuestionView.prototype.preRender.apply(this);

            //TO DO hook up the drag and drop based on model
        },   

        postRender: function() {
            QuestionView.prototype.postRender.apply(this);

            this.initDragDropItems();

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
            var _this = this;
            this.model.set('_isAtLeastOneCorrectSelection', false);
            _.each(this.model.get('_items'), function(item, index) 
            {       
                var correctSelection = false;
                _.each(item._accepted,function(accepted){
                    if(item.currentDraggableId == accepted.id)
                    {
                        if(accepted._isCorrect){
                            correctSelection = true;
                            item._isCorrect = true;
                            _this.model.set('_isAtLeastOneCorrectSelection', true);
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

        onResetClicked: function(event) {
            QuestionView.prototype.onResetClicked.apply(this, arguments);


            _.each(this.model.get("_items"),function(item){

                $('#'+item.id).removeClass("ui-state-highlight");
                item.currentDraggableId = null;
                item._isCorrect = false;


            },this);

            _.each(this.model.get('_draggableItems'),function(item){
               var $item = $('#'+item.id);
                
                $item.animate({
                    "left":$item.data('original-left'),
                    "top":$item.data('original-top'),
                },500,function(){

                });      

            },this);


        },

        onSubmitClicked: function(event) {
            QuestionView.prototype.onSubmitClicked.apply(this, arguments);

            // if (this.canSubmit()) {
            //    this.setAllItemsEnabled(false);
            //    this.setResetButtonEnabled(!this.model.get('_isComplete'));
            // }
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
                userAnswer.push(item.currentDraggableId);
            });

            this.model.set('_userAnswer', userAnswer);
        }


        
        
    });
    
    Adapt.register("dragdrop", DragDrop);
    
});