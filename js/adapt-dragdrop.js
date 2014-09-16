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
            "dragcreate .ui-draggable"          : "onCreateDragItem",
            "dragstart .ui-draggable"           : "onStartDragItem",
            "dragstop .ui-draggable"            : "onStopDragItem",
            "dropactivate .ui-droppable"        : "onDropItemActivate",                     //Triggered when an accepted draggable starts dragging.  function( event, ui ) {} );
            "dropdeactivate .ui-droppable"      : "onDropItemDeactivate",                   //Triggered when an accepted draggable stops dragging. $( ".selector" ).on( "dropdeactivate", function( event, ui ) {} );
            "drop .ui-droppable"                : "onDropItem",                             //Triggered when an accepted draggable is dropped on the droppable  $( ".selector" ).on( "drop", function( event, ui ) {} );
            "dropout .ui-droppable"             : "onDropOutItem",                          //Triggered when an accepted draggable is dragged out of the droppable   $( ".selector" ).on( "dropout", function( event, ui ) {} );
            "dropover .ui-droppable"            : "onDropOverItem",                         //Triggered when an accepted draggable is dragged over the droppable  $( ".selector" ).on( "dropover", function( event, ui ) {} );

            "click .dragdrop-widget .button.submit" : "onSubmitClicked",
            "click .dragdrop-widget .button.reset"  : "onResetClicked",
            "click .dragdrop-widget .button.model"  : "onModelAnswerClicked",
            "click .dragdrop-widget .button.user"   : "onUserAnswerClicked"

        },

        preRender:function(){
            QuestionView.prototype.preRender.apply(this);

            //this.listenTo(Adapt, 'device:changed', this.reRender, this);  
            $(window).on("resize",this.reRender.bind(this)) ;     
        },   

        postRender: function() {
            QuestionView.prototype.postRender.apply(this);

            this.initDragDropItems();

            // $(this.el).find(".dragdrop-background")
            //     .css("width",this.model.get('_originalWidth')+"px")
            //     .css("height",this.model.get('_originalHeight')+"px")

            //this.reRender();

            this.setReadyStatus();
        }, 

        reRender: function() {
            var placedDraggables = [];
            _.each(this.model.get('_items'),function(item){
                if(item.currentDraggableId)
                {
                    placedDraggables.push(item.currentDraggableId);
                    this.moveDraggableToDroppable($('#'+item.currentDraggableId),$('#'+item.id),true)
                }
            },this);

             _.each(this.model.get('_draggableItems'),function(item){
                if(placedDraggables.indexOf(item.id) == -1)
                {
                    this.revert($('#'+item.id),true);
                }
            },this);
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

            this.setOriginals($(event.target));

        },

        setOriginals : function($draggable) {

            var originalWidth   = $draggable.parent().width();
            var originalHeight  = $draggable.parent().height();
            var percent;
            var right,left = parseFloat($draggable.css('left'));
            if(!left || (left === 'auto')){

                right = parseFloat($draggable.css('right'));
                percent = ((right/originalWidth));
                $draggable.data("original-right",percent);
            }else
            {
                percent = ((left/originalWidth));
                $draggable.data("original-left",percent);
            }

            var bottom,top = parseFloat($draggable.css('top'));
            if(!top || (top === 'auto')){
                bottom = parseFloat($draggable.css('bottom'));
                percent = ((bottom/originalHeight));
                $draggable.data("original-bottom",percent);
            }else
            {
                percent = ((top/originalHeight));
                $draggable.data("original-top",percent);
            }

            if((!top || (top === 'auto')) && (!bottom || (bottom === 'auto')))
                throw new Error("DragDrop Component Error : Your draggable items must be positioned using top or bottom");

            if((!left || (left === 'auto')) && (!right || (right === 'auto')))
                throw new Error("DragDrop Component Error : Your draggable items must be positioned using left or right");

            //insta set the left and top so that we can animate without odd skips
            this.revert($draggable,true);
        },

        reCalculateOriginals : function($draggable) {

        },

        onStartDragItem : function(event,ui) {
            

        },

        onStopDragItem : function(event,ui) {
            var draggerId = $(event.target).attr("id");
            var dropperItem = _.find(this.model.get('_items'),function(item){
                if(item.currentDraggableId == draggerId)
                    return item;
            });

            if(!dropperItem)
                this.revert($("#"+draggerId));

        },


        revert: function($d,instant) {
            
            instant = instant || false;
            $d.removeClass('ui-state-placed');


            var wasRight = false;
            //calculate left and top from original
            var left = $d.data('original-left');
            if((!left)||(left == 'auto')){
                left = 1.0 - $d.data('original-right');
                wasRight = true;
            }
                
            var wasBottom = false;
            var top = $d.data('original-top');
            if((!top)||(top == 'auto')){
                top = 1.0 - $d.data('original-bottom') ;//$d.data('original-bottom')$d.parent().height() - parseInt($d.data('original-bottom')) - $d.height();
                wasBottom = true;
            }

            if(!instant)
                $d.animate({
                        "left":(left * $d.parent().width()) - (wasRight?$d.outerWidth():0),
                        "top":(top * $d.parent().height()) - (wasBottom?$d.outerHeight():0)
                    },500,function(){

                });
            else{
                $d.css("left",(left * $d.parent().width()) - (wasRight?$d.outerWidth():0)),
                $d.css("top",(top * $d.parent().height()) - (wasBottom?$d.outerHeight():0))
           }
                
        },

        onDropItemActivate : function( event, ui ) {
            var $draggable = $(ui.draggable);
            var draggableItem = this.findDraggableItem($draggable.attr("id"));
            var $droppable = $(event.target);
            var droppableItem = this.findDroppableItem($droppable.attr("id"));
            //console.log("Activate " + droppableItem.id)

        },

        onDropItemDeactivate : function( event, ui ) {
            var $draggable = $(ui.draggable);
            var draggableItem = this.findDraggableItem($draggable.attr("id"));
            var $droppable = $(event.target);
            var droppableItem = this.findDroppableItem($droppable.attr("id"));
            //console.log("Deactivate " + droppableItem.id)
        },

        moveDraggableToDroppable: function($draggable,$droppable,instant){
            
            instant = instant || false;
            var left = $droppable.css('left');
            if(!left || (left ==='auto')) //then right?
            {
                var right = $droppable.css('right');
                if(right)
                    left = $droppable.parent().width() - parseInt(right) - $droppable.outerWidth() ;
            }

            var top = $droppable.css('top');
            if(!top || (top ==='auto')) //then right?
            {
                var bottom = $droppable.css('bottom');
                if(bottom)
                    top = $droppable.parent().height() - parseInt(bottom) - $droppable.outerHeight() ;
            }

            if(!instant)
                $draggable.animate({
                    left: left,
                    top: top
                },500,function(){
                    //set position to droppable position complete
                    $draggable.addClass('ui-state-placed');

                });
            else
            {
                $draggable.css('left',left);
                $draggable.css('top',top);
            }
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
                this.revert($('#'+residentDraggable.id));
            }

            //Set the new current id and move the dragger item into final positon
            droppableItem.currentDraggableId = draggableItem.id;

            
            this.moveDraggableToDroppable($draggable,$droppable);
            
        },

        onDropOutItem : function( event, ui ) {

            var $draggable = $(ui.draggable);
            $draggable.removeClass('ui-state-placed');
            var draggableItem = this.findDraggableItem($draggable.attr("id"));
            var dropperId = $(event.target).attr("id");
             console.log(draggableItem.id + "Moved out of Dropzone " + dropperId);

            var dropperItem = _.find(this.model.get('_items'),function(item){
                if((item.id == dropperId) &&(draggableItem.id == item.currentDraggableId))
                {
                    console.log("Removing current from "+dropperId);
                    item.currentDraggableId = null;
                    $(event.target).removeClass('ui-state-highlight');
                    return item;
                }
            });
        },

        onDropOverItem : function( event, ui ) {
            var $droppable = $(ui.draggable.element);
            var droppableItem = this.findDraggableItem($droppable.attr("id"));

            //console.log("Drop Over Item");
        },

        debugLog:function(){
            
            //console.log(this.model.get('_draggableItems'));
            console.log(_.pluck(this.model.get('_items'),'currentDraggableId'));
           
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

        showMarking: function() {
            _.each(this.model.get('_items'), function(item, i) {
                var $item = $("#"+item.id);
                $item.removeClass('correct incorrect');
                $item.addClass(item.correct ? 'correct' : 'incorrect');
            }, this);
        },

        markQuestion: function() {
            console.log("Marking Question");
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

            var $item = null;
            _.each(this.model.get("_items"),function(item){

                $item = $('#'+item.id);
                $item.removeClass("ui-state-highlight");

                item.currentDraggableId = null;
                item._isCorrect = item.correct = false;


            },this);

            _.each(this.model.get('_draggableItems'),function(item){
                this.revert($('#'+item.id));                
            },this);

            this.setAllItemsEnabled(true);


        },

        onSubmitClicked: function(event) {
            QuestionView.prototype.onSubmitClicked.apply(this, arguments);

            if (this.canSubmit()) {
               this.setAllItemsEnabled(false);
            }
        },

        setAllItemsEnabled: function(enabled) {
            $('.ui-draggable').draggable( "option", "disabled",!enabled);
        },

        onModelAnswerShown: function() {
            /*
                for all items get jquery item on the deck
                    if said item is correct leave alone
                    if said item is incorrect 
                        revert the dropper in it
                        and tell the dropper that it should be to go to it
            */
            //alert("TODO : SHOW the model answer " + this.model.get('_userAnswer'));

            var placedItems = [];
            _.each(this.model.get('_items'), function(item, index) {
                if(!item._isCorrect)
                {       
                    var $dropzone = $("#"+item.id);                                 
                    var correctItem = _.find(item._accepted,function(accepted){
                        if(accepted._isCorrect)
                            return accepted;
                    },this);

                    if(correctItem)
                    {
                        item.currentDraggableId = correctItem.id;
                        item.correct = true;

                        $dropzone.removeClass('correct incorrect');
                        $dropzone.addClass(item.correct ? 'correct' : 'incorrect');

                        var $correctItem = $("#"+correctItem.id);
                        placedItems.push(correctItem.id);
                        this.moveDraggableToDroppable($correctItem,$dropzone);
                    }
                }else
                    placedItems.push(item.currentDraggableId);
            }, this);


            this.revertLeftOvers(placedItems);



            
        },

        revertLeftOvers:function(arr)
        {
            _.each(this.model.get('_draggableItems'),function(item){
                if(arr.indexOf(item.id) == -1){
                    this.revert($("#"+item.id));
                }
            },this);
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

            var placedItems = [];
            _.each(this.model.get('_items'), function(item, i) 
            {
                var $dropzone = $("#"+item.id);
                var ansId = this.model.get('_userAnswer')[i];
                var $userAnswerItem = $("#"+ansId);
                item.currentDraggableId = ansId;
                placedItems.push(ansId);
                item.correct = item._isCorrect;
                $dropzone.removeClass('correct incorrect');
                $dropzone.addClass(item.correct ? 'correct' : 'incorrect');
                this.moveDraggableToDroppable($userAnswerItem,$dropzone);

            },this);

            this.revertLeftOvers(placedItems);

            
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