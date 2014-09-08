/*
* adapt-component
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Jones <him@kevincjones.co.uk>
*/

define(["coreViews/questionView", "coreJS/adapt","./jquery-ui.js","./jquery.ui.touch-punch.js"], function(QuestionView, Adapt, JQueryUI, touchPunch) {


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
            //  var h = $('.dragdrop-background').height();
            // $('.draggable-content').css("height",h+"px");

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
               this.setResetButtonEnabled(!this.model.get('_isComplete'));
            }
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