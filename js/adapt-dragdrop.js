/*
* adapt-component
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Jones <him@kevincjones.co.uk>
*/

define(["coreViews/questionView", "coreJS/adapt","./jquery-ui.js","./jquery.ui.touch-punch.js",'./dragdrop.js'], function(QuestionView, Adapt, JQueryUI, touchPunch,DragDropHelper) {


    var DragDrop = QuestionView.extend({

        events: {
            "click .dragdrop-widget .button.submit": "onSubmitClicked",
            "click .dragdrop-widget .button.reset": "onResetClicked",
            "click .dragdrop-widget .button.model": "onModelAnswerClicked",
            "click .dragdrop-widget .button.user": "onUserAnswerClicked"
        },

        preRender: function() {
            console.log("precalculating");

            var oWidth = this.model.get("_background").originalWidth;
            var oHeight = this.model.get("_background").originalHeight;
            var items = this.model.get("_items");
            _.each(items,function(item){
                item._width = ((item.width/oWidth)*100.0) +"%";
                item._height = ((item.height/oHeight)*100.0)+"%";
                item._left = ((item.left/oWidth)*100.0) +"%";
                item._top = ((item.top/oHeight)*100.0)+"%";
            });

            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);

           
        },
        
        postRender: function() {
            console.log("rendering");

            // IMPORTANT! 
            // Both of the following methods need to be called inside your view.

            //HOOK UP
            this.onScreenSizeChanged();

            var lessAttribs = this.model.get("LESS");

            DragDropHelper.Dragger.DEFAULT_BOUNDS = lessAttribs.DEFAULT_BOUNDS;//"#wrapper";
            DragDropHelper.Dragger.DEFAULT_DRAGGING_CLASS = lessAttribs.DEFAULT_DRAGGING_CLASS;//"ddd-dragging-s1";
            DragDropHelper.Dragger.DEFAULT_PLACED_CLASS = lessAttribs.DEFAULT_PLACED_CLASS;//"ddd-placed-s1";

            DragDropHelper.DropZone.DEFAULT_NEUTRAL_CLASS =  lessAttribs.DEFAULT_NEUTRAL_CLASS;//"neutraldropzone-s1";
            DragDropHelper.DropZone.DEFAULT_CORRECT_CLASS =  lessAttribs.DEFAULT_CORRECT_CLASS;//"correctdropzone-s1";
            DragDropHelper.DropZone.DEFAULT_INCORRECT_CLASS =  lessAttribs.DEFAULT_INCORRECT_CLASS;//"incorrectdropzone-s1";

            DragDropHelper.ControllerFactory.INACTIVE_BUTTON_CLASS = lessAttribs.INACTIVE_BUTTON_CLASS;//"inactive-but";

            var masterDragList = [];
            var draggerDictionary = {};
            var masterDropList = [];

            this.model.set("_isComplete",false);

            var items = this.model.get("_items");
            _.each(items,function(item){
                if(item.type == "dragger")
                {
                    masterDragList.push(DragDropHelper.DraggerFactory({tgtId:'#'+item.id}));
                    draggerDictionary[item.id] = masterDragList[masterDragList.length-1];
                }
            });


            _.each(items,function(item){
                if(item.type == "dropzone")
                {
                    item.correctDraggers = [];

                    _.each(item.correct,function(correct){
                        item.correctDraggers.push(draggerDictionary[correct]);
                    });

                    masterDropList.push(DragDropHelper.DropZoneFactory({
                        targetId:'#'+item.id,
                        acceptedDraggers : masterDragList,
                        correctDraggers : item.correctDraggers
                    }));
                }
            });

            

            this.ddController = DragDropHelper.ControllerFactory({
                $resetButton : null,
                $revealButton: null,
                $submitButton: null,
                dropzones :masterDropList,
                draggers: masterDragList
            });     

            // Use this to set the model status to ready. 
            // It should be used when telling Adapt that this view is completely loaded.
            // This is sometimes used in conjunction with imageReady.
            this.setReadyStatus();

            // Use this to set the model status to complete.
            // This can be used with inview or when the model is set to complete/the question has been answered.
            this.setCompletionStatus();
        },

        onScreenSizeChanged: function() {
            // if (Adapt.device.screenSize != 'large') {
            //     this.replaceWithNarrative();
            // }
            var h = $(this.el).find('.dragdrop-background').height();
            $(this.el).find('.dragdrop-container').css("height",h+"px");

            //font scale
            var oWidth = this.model.get("_background").originalWidth;
            var w = $(this.el).find('.dragdrop-background').width();
            var scale = (100.0*(w/oWidth))+'%';
            $(this.el).find('.dragdrop-container').css("font-size",scale);



        },

        resetQuestion: function(properties) {
            QuestionView.prototype.resetQuestion.apply(this, arguments);

            //TODO reset Drag and Dropper

            // _.each(this.model.get('_items'), function(item) {
            //     item.selected = false;
            // }, this);
        },

        canSubmit: function() {
            //TODO when we have the drag drop code in we want to disable until they play all
            return true;
        },

        canReset: function() {
            return !this.$('.mcq-widget, .button.reset').hasClass('disabled');
        },

        storeUserAnswer:function() {
            //TODO set useranswer to what the user put when he pressed submit
            this.model.set('_userAnswer', []);
        },

        onResetClicked: function(event) {
            if (this.canReset()) {
                QuestionView.prototype.onResetClicked.apply(this, arguments);
                this.ddController.reset();
            } else {
                if (event) {
                    event.preventDefault();
                }
            }
        },

        setResetButtonEnabled: function(enabled) {
            this.$('.button.reset').toggleClass('disabled', !enabled);
        },

        onSubmitClicked: function(event) {
            QuestionView.prototype.onSubmitClicked.apply(this, arguments);

            if (this.canSubmit()) {
               this.ddController.submit();
               this.model.set('_numberOfCorrectAnswers',this.ddController.correctItems());
               this.setResetButtonEnabled(!this.model.get('_isComplete'));
            }
        },

        isCorrect: function() {
            return !!Math.floor(this.model.get('_numberOfCorrectAnswers') / this.ddController.allZones.length);
        },
        
        isPartlyCorrect: function() {
            return !this.isCorrect() && this.model.get('_isAtLeastOneCorrectSelection');
        },

        onModelAnswerShown: function() {
            event.preventDefault();
            //show the correct answer
        },

        onUserAnswerShown: function(event) {
           event.preventDefault();
           //show the answer the user submitted
        }
        
    });
    
    Adapt.register("dragdrop", DragDrop);
    
});